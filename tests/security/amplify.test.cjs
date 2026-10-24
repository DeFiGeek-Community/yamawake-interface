const test = require("node:test");
const assert = require("node:assert/strict");
const dotenv = require("dotenv");
const { execFileSync } = require("node:child_process");
const { serializeEnvironment } = require("../../scripts/write-amplify-env.cjs");

function env() {
  return {
    SIWE_DOMAIN: "yamawake.xyz",
    IRON_SESSION_COOKIE_NAME: "test_session",
    IRON_SESSION_PASSWORD: "test-only-password-with-more-than-32-characters",
  };
}

test("Amplify serializes only the approved SSR keys and public configuration", () => {
  const input = {
    ...env(),
    BASIC_AUTH_PASS: 'special # characters = "quoted"',
    _AWS_SECRET_ACCESS_KEY: "test-only-value",
    NEXT_PUBLIC_GIT_ID: "abc123",
    UNRELATED_PRIVATE_TOKEN: "must-not-be-included",
  };
  const output = serializeEnvironment(input);
  const parsed = dotenv.parse(output);
  for (const [key, value] of Object.entries(input)) {
    if (key !== "UNRELATED_PRIVATE_TOKEN") assert.equal(parsed[key], value);
  }
  assert.ok(!output.includes("UNRELATED_PRIVATE_TOKEN"));
  assert.ok(!output.includes("must-not-be-included"));
});

test("Amplify rejects missing production authentication configuration and the old sample password", () => {
  for (const invalid of [
    { SIWE_DOMAIN: "" },
    { SIWE_DOMAIN: "https://yamawake.xyz/path" },
    { IRON_SESSION_PASSWORD: "short" },
    { IRON_SESSION_PASSWORD: "complex_password_at_least_32_characters_long" },
    { IRON_SESSION_COOKIE_NAME: "" },
  ]) {
    assert.throws(() => serializeEnvironment({ ...env(), ...invalid }));
  }
});

test("Amplify dotenv serialization preserves special characters and rejects injected extra keys", () => {
  for (const value of [
    "line one\nline two",
    "literal\\nbackslash",
    "single'quote",
    'double"quote',
    "back`tick",
    "'\nUNEXPECTED_KEY=value\n'",
  ]) {
    const parsed = dotenv.parse(serializeEnvironment({ ...env(), BASIC_AUTH_PASS: value }));
    assert.equal(parsed.BASIC_AUTH_PASS, value);
    assert.equal(parsed.UNEXPECTED_KEY, undefined);
  }
});

test("Amplify preserves dollar expressions through the actual Next.js environment loader", () => {
  for (const value of [
    "$UNSET_SECRET",
    "${IRON_SESSION_PASSWORD}",
    "literal\\$value",
    "two$$dollars",
  ]) {
    const contents = serializeEnvironment({ ...env(), BASIC_AUTH_PASS: value });
    const result = execFileSync(
      process.execPath,
      [
        "-e",
        `
      for (const key of Object.keys(process.env)) delete process.env[key];
      const { processEnv } = require("@next/env");
      const [, parsed] = processEnv([{ path: ".env.production", contents: process.argv[1] }], process.cwd());
      process.stdout.write(JSON.stringify(parsed));
    `,
        contents,
      ],
      { encoding: "utf8" },
    );
    assert.equal(JSON.parse(result).BASIC_AUTH_PASS, value);
  }
  assert.throws(
    () => serializeEnvironment({ ...env(), BASIC_AUTH_PASS: "'\"`$variable\nend" }),
    /Cannot safely serialize/,
  );
});
