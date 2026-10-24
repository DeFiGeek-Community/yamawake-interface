const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseYarnInventory,
  pnpmIssues,
  bulkIssues,
  evaluate,
} = require("../../scripts/audit-policy.cjs");
const issue = {
  package: "legacy-tool",
  version: "1.0.0",
  advisory: "GHSA-aaaa-bbbb-cccc",
  severity: "high",
};
const baseline = {
  expires: "2026-11-23",
  development: [
    { package: issue.package, version: issue.version, advisories: { [issue.advisory]: "high" } },
  ],
};
const now = Date.parse("2026-10-24");

test("audit policy never allows production High/Critical and rejects new findings or versions", () => {
  assert.equal(evaluate("production", [issue], baseline, now).blocking.length, 1);
  assert.equal(evaluate("development", [issue], baseline, now).deferred.length, 1);
  for (const changed of [
    { ...issue, version: "1.0.1" },
    { ...issue, advisory: "GHSA-dddd-eeee-ffff" },
    { ...issue, severity: "critical" },
  ]) {
    assert.equal(evaluate("development", [changed], baseline, now).blocking.length, 1);
  }
  assert.equal(
    evaluate("development", [issue], baseline, Date.parse("2026-11-24")).blocking.length,
    1,
  );
});

test("audit parsing fails closed instead of treating registry failures as clean reports", () => {
  assert.throws(() => pnpmIssues({ error: { message: "network unavailable" } }));
  assert.throws(() => bulkIssues({ error: "unavailable" }, {}));
  assert.throws(() => parseYarnInventory("invalid lockfile"));
  assert.throws(() => evaluate("development", [issue], { expires: "invalid" }, now));
});

test("Yarn advisory lookup supports scoped packages and filters unaffected versions", () => {
  const inventory = parseYarnInventory(
    '"@scope/pkg@^1.0.0", "@scope/pkg@~1.0.1":\n  version "1.0.2"\n\nplain@^2.0.0:\n  version "2.0.0"\n',
  );
  assert.deepEqual(inventory, { "@scope/pkg": ["1.0.2"], plain: ["2.0.0"] });
  const advisories = {
    "@scope/pkg": [
      {
        url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
        severity: "high",
        vulnerable_versions: "<1.0.3",
      },
    ],
    plain: [
      {
        url: "https://github.com/advisories/GHSA-dddd-eeee-ffff",
        severity: "high",
        vulnerable_versions: "<2.0.0",
      },
    ],
  };
  assert.deepEqual(
    bulkIssues(advisories, inventory).map((x) => x.package),
    ["@scope/pkg"],
  );
});
