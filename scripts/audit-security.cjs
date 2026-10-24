const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { parseYarnInventory, pnpmIssues, bulkIssues, evaluate } = require("./audit-policy.cjs");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "artifacts/security");

async function auditPnpm(prod) {
  const args = ["audit", "--json", ...(prod ? ["--prod"] : [])];
  let stdout;
  try {
    ({ stdout } = await promisify(execFile)("pnpm", args, {
      cwd: root,
      maxBuffer: 16 * 1024 * 1024,
      timeout: 90000,
    }));
  } catch (error) {
    if (error.code !== 1 || !error.stdout) throw error;
    stdout = error.stdout;
  }
  const audit = JSON.parse(stdout);
  const issues = pnpmIssues(audit);
  fs.writeFileSync(
    path.join(output, prod ? "production.json" : "workspace.json"),
    JSON.stringify(audit, null, 2),
  );
  console.log(
    `${prod ? "Production" : "Workspace"}: ${JSON.stringify(audit.metadata.vulnerabilities)}`,
  );
  return issues;
}

async function auditSubgraph() {
  const inventory = parseYarnInventory(
    fs.readFileSync(path.join(root, "subgraph/yarn.lock"), "utf8"),
  );
  const response = await fetch("https://registry.npmjs.org/-/npm/v1/security/advisories/bulk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(inventory),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Registry returned HTTP ${response.status}`);
  const advisories = await response.json();
  const issues = bulkIssues(advisories, inventory);
  fs.writeFileSync(
    path.join(output, "subgraph.json"),
    JSON.stringify({ inventory, advisories, issues }, null, 2),
  );
  console.log(
    `Subgraph: ${issues.length} advisory/version matches (separate build/deployment tooling)`,
  );
  return issues;
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const baseline = JSON.parse(
    fs.readFileSync(path.join(root, "security/audit-baseline.json"), "utf8"),
  );
  const [production, development, subgraph] = await Promise.all([
    auditPnpm(true),
    auditPnpm(false),
    auditSubgraph(),
  ]);
  let failures = 0;
  for (const [scope, issues] of Object.entries({ production, development, subgraph })) {
    const result = evaluate(scope, issues, baseline);
    failures += result.blocking.length;
    for (const issue of result.blocking)
      console.error(
        `BLOCKED ${scope}: ${issue.package}@${issue.version} ${issue.advisory} (${issue.severity})`,
      );
    if (result.deferred.length)
      console.warn(
        `${scope}: ${result.deferred.length} existing High/Critical matches deferred until ${baseline.expires}; see security/audit-baseline.json`,
      );
  }
  if (failures) throw new Error(`${failures} new, expired or production High/Critical findings`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
