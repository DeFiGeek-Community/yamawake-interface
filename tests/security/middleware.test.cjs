const test = require("node:test");
const assert = require("node:assert/strict");
const { createLoader } = require("./load-source.cjs");

function run(header, env = { BASIC_AUTH_USER: "user", BASIC_AUTH_PASS: "pass:word" }) {
  const middleware = createLoader(
    {
      "next/server": {
        NextResponse: {
          next: () => ({ allowed: true }),
          rewrite: (url) => ({ allowed: false, path: url.pathname }),
        },
      },
    },
    env,
  )("apps/web/middleware.ts").middleware;
  return middleware({
    headers: { get: () => header },
    nextUrl: { clone: () => new URL("https://audit.example/dashboard") },
  });
}

test("Basic auth accepts valid credentials including a colon in the password", () => {
  assert.equal(run(`Basic ${Buffer.from("user:pass:word").toString("base64")}`).allowed, true);
});

test("missing, invalid and non-Basic credentials are challenged without throwing", () => {
  for (const header of [
    null,
    "Basic",
    "Basic !!!!",
    "Basic a",
    "Bearer abc",
    `Basic ${Buffer.from("wrong:pass:word").toString("base64")}`,
  ]) {
    const result = run(header);
    assert.equal(result.allowed, false);
    assert.equal(result.path, "/api/auth");
  }
});

test("Basic auth is disabled only when both settings are absent", () => {
  assert.equal(run(null, {}).allowed, true);
  assert.equal(run(null, { BASIC_AUTH_USER: "user" }).allowed, false);
});
