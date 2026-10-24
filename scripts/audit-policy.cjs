const semver = require("semver");
const ranks = { low: 1, moderate: 2, high: 3, critical: 4 };

function parseYarnInventory(source) {
  const inventory = {};
  let selector;
  for (const line of source.split("\n")) {
    if (/^[^\s#].*:$/.test(line))
      selector = line.slice(0, -1).split(/,\s+/)[0].replace(/^"|"$/g, "");
    const match = line.match(/^  version "([^"]+)"$/);
    if (!match) continue;
    const name = selector?.slice(0, selector.lastIndexOf("@"));
    if (!name || !semver.valid(match[1])) throw new Error("Unsupported yarn.lock entry");
    inventory[name] ??= [];
    if (!inventory[name].includes(match[1])) inventory[name].push(match[1]);
  }
  if (!Object.keys(inventory).length) throw new Error("No packages found in yarn.lock");
  return inventory;
}

function advisoryId(url) {
  const id = new URL(url).pathname.split("/").at(-1);
  if (!/^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(id))
    throw new Error("Missing advisory identity");
  return id;
}

function pnpmIssues(audit) {
  if (audit.error || !audit.metadata?.vulnerabilities || !audit.advisories)
    throw new Error("Invalid pnpm audit response");
  return Object.values(audit.advisories).flatMap((advisory) =>
    [...new Set(advisory.findings.map((finding) => finding.version))].map((version) => ({
      package: advisory.module_name,
      version,
      advisory: advisoryId(advisory.url),
      severity: advisory.severity,
    })),
  );
}

function bulkIssues(response, inventory) {
  if (!response || typeof response !== "object" || Array.isArray(response) || response.error)
    throw new Error("Invalid registry response");
  return Object.entries(response).flatMap(([name, advisories]) => {
    if (!inventory[name] || !Array.isArray(advisories))
      throw new Error("Unexpected registry package");
    return advisories.flatMap((advisory) => {
      if (!semver.validRange(advisory.vulnerable_versions))
        throw new Error("Invalid vulnerability range");
      return inventory[name]
        .filter((version) =>
          semver.satisfies(version, advisory.vulnerable_versions, { includePrerelease: true }),
        )
        .map((version) => ({
          package: name,
          version,
          advisory: advisoryId(advisory.url),
          severity: advisory.severity,
        }));
    });
  });
}

function evaluate(scope, issues, baseline, now = Date.now()) {
  const expires = Date.parse(`${baseline.expires}T00:00:00Z`);
  if (!Number.isFinite(expires)) throw new Error("Invalid baseline expiry");
  const blocking = [],
    deferred = [];
  for (const issue of issues) {
    if (!(issue.severity in ranks)) throw new Error("Unknown vulnerability severity");
    if (ranks[issue.severity] < ranks.high) continue;
    const known = baseline[scope]?.find(
      (entry) => entry.package === issue.package && entry.version === issue.version,
    );
    const allowed = known?.advisories[issue.advisory];
    if (
      scope !== "production" &&
      expires > now &&
      allowed &&
      ranks[issue.severity] <= ranks[allowed]
    )
      deferred.push(issue);
    else blocking.push(issue);
  }
  return { blocking, deferred };
}

module.exports = { parseYarnInventory, pnpmIssues, bulkIssues, evaluate };
