const test = require("node:test");
const assert = require("node:assert/strict");
const { createLoader, response, cookieFrom, appRequire } = require("./load-source.cjs");
const ethers = appRequire("ethers");
const { SiweMessage } = appRequire("siwe");
const { getIronSession } = appRequire("iron-session");
const dynamo = appRequire("@aws-sdk/client-dynamodb");
const viem = appRequire("viem");
const wallet = ethers.Wallet.createRandom();
const safeAddress = "0x1111111111111111111111111111111111111111";
const auctionAddress = "0x2222222222222222222222222222222222222222";

function fixture() {
  const env = {
    NODE_ENV: "production",
    SIWE_DOMAIN: "audit.example",
    IRON_SESSION_COOKIE_NAME: "audit_session",
    IRON_SESSION_PASSWORD: "audit-only-password-with-more-than-32-characters",
    _AWS_DYNAMO_TABLE_NAME: "audit-table",
    _AWS_REGION: "us-east-1",
  };
  const state = {
    records: new Map(),
    commands: [],
    writes: [],
    owner: wallet.address,
    safeOwner: true,
    ownerReads: 0,
    safeReads: 0,
    providerUrls: [],
    contractCalls: 0,
    storageFailure: false,
  };
  const conditionalFailure = () =>
    Object.assign(new Error("Condition failed"), { name: "ConditionalCheckFailedException" });
  const load = createLoader(
    {
      "@aws-sdk/client-dynamodb": {
        ...dynamo,
        DynamoDBClient: class {
          async send(command) {
            if (state.storageFailure) throw new Error("Storage offline");
            state.commands.push(command);
            const input = command.input;
            const id = (input.Item || input.Key).AuctionId.S;
            if (command instanceof dynamo.PutItemCommand) {
              assert.equal(input.ConditionExpression, "attribute_not_exists(AuctionId)");
              if (state.records.has(id)) throw conditionalFailure();
              state.records.set(id, { expiresAt: Number(input.Item.ExpiresAt.N) });
            } else {
              assert.equal(
                input.ConditionExpression,
                "attribute_exists(AuctionId) AND ExpiresAt > :now AND attribute_not_exists(ConsumedAt)",
              );
              const record = state.records.get(id);
              if (
                !record ||
                record.consumed ||
                record.expiresAt <= Number(input.ExpressionAttributeValues[":now"].N)
              )
                throw conditionalFailure();
              record.consumed = true;
            }
            return {};
          }
        },
      },
      "lib/dynamodb/metaData": {
        DBClient: class {
          async addMetaData(data) {
            state.writes.push(data);
            return data;
          }
          async updateAuction(data) {
            state.writes.push(data);
            return data;
          }
        },
      },
      "lib/utils/chain": {
        getSupportedChain: (id) =>
          [1, 8453].includes(Number(id)) ? { id: Number(id) } : undefined,
      },
      "lib/utils/serverside": {
        getViemProvider: () => ({}),
        getServerRPCEndpoints: () => ["https://rpc.audit.invalid"],
      },
      viem: {
        ...viem,
        getContract: ({ address }) => ({
          read: {
            owner: async () => {
              state.ownerReads++;
              return state.owner;
            },
            isOwner: async () => {
              assert.equal(address, safeAddress);
              state.safeReads++;
              return state.safeOwner;
            },
          },
        }),
      },
      ethers: {
        ...ethers,
        ethers: {
          ...ethers.ethers,
          JsonRpcProvider: class {
            constructor(url) {
              state.providerUrls.push(url);
            }
            async call(transaction) {
              state.contractCalls++;
              return transaction.to.toLowerCase() === auctionAddress
                ? `0x1626ba7e${"0".repeat(56)}`
                : "0x";
            }
            destroy() {}
          },
        },
      },
    },
    env,
  );
  const nonce = load("apps/web/pages/api/nonce.ts").default;
  const verify = load("apps/web/pages/api/verify.ts").default;
  const metadata = load("apps/web/pages/api/metadata/[chainId]/index.ts").default;
  const owner = load("apps/web/pages/api/metadata/[chainId]/[id]/owner.ts").default;
  const me = load("apps/web/pages/api/me.ts").default;
  async function challenge() {
    const res = response();
    await nonce({ method: "GET", headers: { host: "audit.example" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader("cache-control"), "no-store");
    return { nonce: res.body, cookie: cookieFrom(res) };
  }
  async function signed(c, overrides = {}) {
    const message = new SiweMessage({
      domain: "audit.example",
      address: wallet.address,
      uri: "https://audit.example",
      version: "1",
      chainId: 1,
      nonce: c.nonce,
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      ...overrides,
    });
    return {
      method: "POST",
      headers: { host: "audit.example", cookie: c.cookie },
      body: { message, signature: await wallet.signMessage(message.prepareMessage()), chainId: 1 },
    };
  }
  async function sealed(data) {
    const res = response();
    const session = await getIronSession(
      { headers: {} },
      res,
      load("packages/lib/constants/ironOptions.ts").default,
    );
    Object.assign(session, data);
    await session.save();
    return cookieFrom(res);
  }
  async function validSession(overrides = {}) {
    return sealed({
      siwe: { address: wallet.address, chainId: 1, ...overrides },
      expiresAt: Date.now() + 3600000,
    });
  }
  return {
    env,
    state,
    load,
    nonce,
    verify,
    metadata,
    owner,
    me,
    challenge,
    signed,
    sealed,
    validSession,
  };
}

test("a signed challenge is accepted only once, including concurrent original-cookie replays", async () => {
  const f = fixture();
  const c = await f.challenge();
  const req = await f.signed(c);
  const responses = [response(), response()];
  await Promise.all(responses.map((res) => f.verify(req, res)));
  assert.deepEqual(responses.map((r) => r.statusCode).sort(), [200, 422]);
  const replay = response();
  await f.verify(req, replay);
  assert.equal(replay.statusCode, 422);
  assert.equal([...f.state.records.values()].filter((x) => x.consumed).length, 1);
  const key = [...f.state.records.keys()][0];
  assert.match(key, /^auth:nonce:[a-f0-9]{64}$/);
  assert.ok(!key.includes(c.nonce));
  assert.ok(f.state.commands.every((cmd) => (cmd.input.Item || cmd.input.Key).ChainId.N === "0"));
});

test("unknown and expired challenges fail closed", async () => {
  for (const expired of [false, true]) {
    const f = fixture();
    const c = await f.challenge();
    if (expired) [...f.state.records.values()][0].expiresAt = 0;
    else f.state.records.clear();
    const res = response();
    await f.verify(await f.signed(c), res);
    assert.equal(res.statusCode, 422);
  }
});

test("storage failure cannot issue a nonce or authenticate a user", async () => {
  const f = fixture();
  const c = await f.challenge();
  const req = await f.signed(c);
  f.state.storageFailure = true;
  const login = response();
  await f.verify(req, login);
  assert.equal(login.statusCode, 422);
  assert.equal(login.getHeader("set-cookie"), undefined);
  const nonce = response();
  await f.nonce({ method: "GET", headers: { host: "audit.example" } }, nonce);
  assert.equal(nonce.statusCode, 500);
  assert.equal(nonce.getHeader("set-cookie"), undefined);
});

test("production domain, URI and chain are bound to the request", async () => {
  const f = fixture();
  const c = await f.challenge();
  for (const overrides of [
    { domain: "phishing.example" },
    { uri: "https://phishing.example" },
    { chainId: 8453 },
  ]) {
    const req = await f.signed(c, overrides);
    req.headers.host = "phishing.example";
    const res = response();
    await f.verify(req, res);
    assert.equal(res.statusCode, 422);
  }
  delete f.env.SIWE_DOMAIN;
  const res = response();
  await f.verify(await f.signed(c), res);
  assert.equal(res.statusCode, 503);
});

test("a bad signature does not consume a valid challenge", async () => {
  const f = fixture();
  const c = await f.challenge();
  const req = await f.signed(c);
  const bad = response();
  await f.verify(
    { ...req, body: { ...req.body, signature: await wallet.signMessage("different message") } },
    bad,
  );
  assert.equal(bad.statusCode, 422);
  assert.equal([...f.state.records.values()][0].consumed, undefined);
  const good = response();
  await f.verify(req, good);
  assert.equal(good.statusCode, 200);
});

test("EIP-1271 verification receives a real RPC URL and accepts contract signatures", async () => {
  const f = fixture();
  const c = await f.challenge();
  const res = response();
  await f.verify(await f.signed(c, { address: auctionAddress }), res);
  assert.equal(res.statusCode, 200);
  assert.ok(f.state.contractCalls > 0);
  assert.deepEqual(f.state.providerUrls, ["https://rpc.audit.invalid"]);
});

test("valid EOA metadata updates normalize decimal form values", async () => {
  const f = fixture();
  const res = response();
  await f.metadata(
    {
      method: "PUT",
      headers: { cookie: await f.validSession() },
      query: { chainId: "1" },
      body: {
        id: auctionAddress,
        title: "Test",
        targetTotalRaised: "1.25",
        maximumTotalRaised: "2.5",
      },
    },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(f.state.writes.length, 1);
  assert.equal(f.state.writes[0].targetTotalRaised, 1.25);
});

test("Safe membership is rechecked for both writes and owner checks", async () => {
  const f = fixture();
  f.state.owner = safeAddress;
  const cookie = await f.validSession({ resources: [safeAddress] });
  const req = {
    method: "PUT",
    headers: { cookie },
    query: { chainId: "1", id: auctionAddress },
    body: { id: auctionAddress, title: "Before removal" },
  };
  const allowed = response();
  await f.metadata(req, allowed);
  assert.equal(allowed.statusCode, 200);
  f.state.safeOwner = false;
  const denied = response();
  await f.metadata(req, denied);
  assert.equal(denied.statusCode, 403);
  const owner = response();
  await f.owner({ ...req, method: "GET" }, owner);
  assert.equal(owner.statusCode, 403);
  assert.equal(f.state.writes.length, 1);
  assert.equal(f.state.safeReads, 3);
});

test("expired, legacy and wrong-chain sessions cannot write", async () => {
  const f = fixture();
  for (const data of [
    { siwe: { address: wallet.address, chainId: 1 } },
    { siwe: { address: wallet.address, chainId: 1 }, expiresAt: Date.now() - 1 },
    {
      siwe: { address: wallet.address, chainId: 1, expirationTime: new Date(0).toISOString() },
      expiresAt: Date.now() + 3600000,
    },
    { siwe: { address: wallet.address, chainId: 8453 }, expiresAt: Date.now() + 3600000 },
  ]) {
    const res = response();
    await f.metadata(
      {
        method: "PUT",
        headers: { cookie: await f.sealed(data) },
        query: { chainId: "1" },
        body: { id: auctionAddress },
      },
      res,
    );
    assert.ok([401, 403].includes(res.statusCode));
  }
  assert.equal(f.state.writes.length, 0);
  assert.equal(f.state.ownerReads, 0);
});

test("malformed metadata returns 400 before RPC or database writes", async () => {
  const f = fixture();
  const cookie = await f.validSession();
  for (const body of [
    null,
    [],
    "bad",
    { id: "bad" },
    { id: auctionAddress, title: {} },
    { id: auctionAddress, projectURL: "javascript:alert(1)" },
    { id: auctionAddress, targetTotalRaised: -1 },
    { id: auctionAddress, targetTotalRaised: {} },
  ]) {
    const res = response();
    await f.metadata({ method: "PUT", headers: { cookie }, query: { chainId: "1" }, body }, res);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(f.state.ownerReads, 0);
  assert.equal(f.state.writes.length, 0);
});

test("me clears expired sessions", async () => {
  const f = fixture();
  const res = response();
  await f.me(
    {
      method: "GET",
      headers: {
        cookie: await f.sealed({ siwe: { address: wallet.address, chainId: 1 }, expiresAt: 1 }),
      },
    },
    res,
  );
  assert.equal(res.body.user, null);
  assert.match(res.getHeader("set-cookie").at(-1), /Max-Age=0/);
});
