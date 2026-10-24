const test = require("node:test");
const assert = require("node:assert/strict");
const { createLoader, appRequire } = require("./load-source.cjs");
const viem = appRequire("viem");
const account = { address: "0x1111111111111111111111111111111111111111" };
const safeAddress = "0x2222222222222222222222222222222222222222";
const request = {
  chainId: 1,
  account,
  address: account.address,
  functionName: "approve",
  abi: [
    {
      type: "function",
      name: "approve",
      stateMutability: "nonpayable",
      inputs: [
        { type: "address", name: "spender" },
        { type: "uint256", name: "amount" },
      ],
      outputs: [{ type: "bool" }],
    },
  ],
  args: [safeAddress, 1n],
};

function fixture() {
  const state = {
    activeChain: 1,
    providerChain: 1,
    requestedChains: [],
    apiChains: [],
    init: 0,
    signed: 0,
    proposed: 0,
    switchBeforeSign: false,
  };
  const provider = { request: async () => `0x${state.providerChain.toString(16)}` };
  const load = createLoader({
    "@wagmi/core": {
      getNetwork: () => ({
        chain: state.activeChain ? { id: state.activeChain } : undefined,
        chains: [],
      }),
      ChainMismatchError: class extends Error {},
      ConnectorNotFoundError: class extends Error {},
      getWalletClient: async ({ chainId }) => {
        state.requestedChains.push(chainId);
        return { account };
      },
      getConfig: () => ({
        connector: {
          getProvider: async () => provider,
          getChainId: async () => state.providerChain,
        },
      }),
    },
    "@safe-global/protocol-kit": {
      init: async () => {
        state.init++;
        return {
          createTransaction: async ({ transactions }) => ({ data: transactions }),
          getTransactionHash: async () => {
            if (state.switchBeforeSign) state.providerChain = 8453;
            return "0x1234";
          },
          signHash: async () => {
            state.signed++;
            return { data: "0x1234" };
          },
        };
      },
    },
    "@safe-global/api-kit": class {
      constructor({ chainId }) {
        state.apiChains.push(Number(chainId));
      }
      async proposeTransaction() {
        state.proposed++;
      }
    },
    viem,
  });
  return {
    state,
    write: load("packages/ui/hooks/Safe/writeSafeContract.ts").writeSafeContract,
    send: load("packages/ui/hooks/Safe/sendSafeTransaction.ts").sendSafeTransaction,
  };
}

test("prepared Safe writes retain their original chain through the API proposal", async () => {
  const f = fixture();
  await f.write({ mode: "prepared", request, safeAddress });
  assert.deepEqual(f.state.requestedChains, [1]);
  assert.deepEqual(f.state.apiChains, [1]);
  assert.equal(f.state.proposed, 1);
});

test("prepared Safe writes reject another network and disconnected wallets before signing", async () => {
  for (const chain of [8453, undefined]) {
    const f = fixture();
    f.state.activeChain = chain;
    await assert.rejects(f.write({ mode: "prepared", request, safeAddress }));
    assert.equal(f.state.init, 0);
    assert.equal(f.state.signed, 0);
    assert.equal(f.state.proposed, 0);
  }
});

test("missing or contradictory target chains cannot create Safe proposals", async () => {
  for (const config of [
    { mode: "prepared", request: { ...request, chainId: undefined }, safeAddress },
    { mode: "prepared", request, safeAddress, chainId: 8453 },
  ]) {
    const f = fixture();
    await assert.rejects(f.write(config));
    assert.equal(f.state.init, 0);
  }
});

test("provider chain mismatch is rejected even when wagmi state is stale", async () => {
  const f = fixture();
  f.state.providerChain = 8453;
  await assert.rejects(f.write({ mode: "prepared", request, safeAddress }), /provider network/);
  assert.equal(f.state.init, 0);
  assert.equal(f.state.signed, 0);
});

test("changing chains during preparation stops Safe writes and native transfers before signing", async () => {
  for (const native of [false, true]) {
    const f = fixture();
    f.state.switchBeforeSign = true;
    const operation = native
      ? f.send({
          mode: "prepared",
          chainId: 1,
          account,
          to: account.address,
          value: 1n,
          safeAddress,
        })
      : f.write({ mode: "prepared", request, safeAddress });
    await assert.rejects(operation, /provider network/);
    assert.equal(f.state.signed, 0);
    assert.equal(f.state.proposed, 0);
  }
});

test("native Safe transfers require a target chain", async () => {
  const f = fixture();
  await assert.rejects(
    f.send({ mode: "prepared", account, to: account.address, value: 1n, safeAddress }),
    /Target chain/,
  );
  assert.equal(f.state.init, 0);
});

test("switching Safes updates memoized write and send callbacks", async () => {
  for (const contract of [true, false]) {
    const slots = [];
    let index = 0;
    const sent = [];
    function memo(factory, deps) {
      const slot = index++;
      const old = slots[slot];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i])))
        slots[slot] = { deps, value: factory() };
      return slots[slot].value;
    }
    let mutation;
    const mutate = (config) => mutation(config);
    const load = createLoader({
      react: { useMemo: memo, useCallback: (fn, deps) => memo(() => fn, deps) },
      wagmi: {
        useMutation: (_key, fn) => {
          mutation = fn;
          return { mutate, mutateAsync: mutate };
        },
      },
      "@wagmi/core": {},
      "@wagmi/core/internal": { getSendTransactionParameters: () => ({}) },
      "./writeSafeContract": {
        writeSafeContract: (config) => {
          sent.push(config.safeAddress);
        },
      },
      "./sendSafeTransaction": {
        sendSafeTransaction: (config) => {
          sent.push(config.safeAddress);
        },
      },
    });
    const hook = contract
      ? load("packages/ui/hooks/Safe/useSafeContractWrite.ts").useSafeContractWrite
      : load("packages/ui/hooks/Safe/useSafeSendTransaction.ts").useSafeSendTransaction;
    for (const address of [safeAddress, account.address]) {
      index = 0;
      const result = hook(
        contract
          ? { mode: "prepared", request, safeAddress: address }
          : { chainId: 1, to: account.address, safeAddress: address },
      );
      if (contract) {
        result.write();
        await result.writeAsync();
      } else {
        result.sendTransaction();
        await result.sendTransactionAsync();
      }
    }
    assert.deepEqual(sent, [safeAddress, safeAddress, account.address, account.address]);
  }
});
