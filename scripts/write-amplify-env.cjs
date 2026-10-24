const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

const serverKeys = new Set([
  "ALCHEMY_API_KEY",
  "INFURA_API_TOKEN",
  "IRON_SESSION_PASSWORD",
  "IRON_SESSION_COOKIE_NAME",
  "SIWE_DOMAIN",
  "BASIC_AUTH_USER",
  "BASIC_AUTH_PASS",
  "_AWS_ACCESS_KEY_ID",
  "_AWS_SECRET_ACCESS_KEY",
  "_AWS_REGION",
  "_AWS_DYNAMO_TABLE_NAME",
]);

function serializeEnvironment(env) {
  const password = env.IRON_SESSION_PASSWORD;
  if (
    !password ||
    password.length < 32 ||
    password === "complex_password_at_least_32_characters_long" ||
    !env.IRON_SESSION_COOKIE_NAME ||
    !env.SIWE_DOMAIN
  ) {
    throw new Error(
      "Set SIWE_DOMAIN, IRON_SESSION_COOKIE_NAME and a random session password before deploying",
    );
  }
  const origin = new URL(`https://${env.SIWE_DOMAIN}`);
  if (
    origin.host !== env.SIWE_DOMAIN ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error("SIWE_DOMAIN must be the canonical host[:port]");
  }
  return (
    Object.entries(env)
      .filter(
        ([key, value]) =>
          value !== undefined && (serverKeys.has(key) || /^NEXT_PUBLIC_[A-Z0-9_]+$/.test(key)),
      )
      .map(([key, value]) => {
        // Next.js expands dollar expressions even inside quoted dotenv values.
        const escaped = value.replace(/\$/g, "\\$");
        for (const encoded of [`'${escaped}'`, `\`${escaped}\``, JSON.stringify(escaped)]) {
          const parsed = dotenv.parse(`${key}=${encoded}`);
          if (Object.keys(parsed).length === 1 && parsed[key] === escaped)
            return `${key}=${encoded}`;
        }
        throw new Error(`Cannot safely serialize environment variable ${key}`);
      })
      .join("\n") + "\n"
  );
}

if (require.main === module) {
  try {
    const output = path.resolve(__dirname, "../apps/web/.env.production");
    fs.writeFileSync(output, serializeEnvironment(process.env), { mode: 0o600 });
    fs.chmodSync(output, 0o600);
    console.log("Prepared the approved SSR environment variables.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { serializeEnvironment };
