module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui", "lib"],
  env: {
    IRON_SESSION_PASSWORD: process.env.IRON_SESSION_PASSWORD,
    IRON_SESSION_COOKIE_NAME: process.env.IRON_SESSION_COOKIE_NAME,
    _AWS_ACCESS_KEY_ID: process.env._AWS_ACCESS_KEY_ID,
    _AWS_SECRET_ACCESS_KEY: process.env._AWS_SECRET_ACCESS_KEY,
    _AWS_REGION: process.env._AWS_REGION,
    _AWS_DYNAMO_TABLE_NAME: process.env._AWS_DYNAMO_TABLE_NAME,
  }
};
