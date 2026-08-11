import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const requireFromDocs = createRequire(resolve(repositoryRoot, "docs/package.json"));
const { parse } = requireFromDocs("yaml");
const argumentsList = process.argv.slice(2);
const baseIndex = argumentsList.indexOf("--base");
const base = baseIndex >= 0 ? argumentsList[baseIndex + 1] : "origin/main";

function git(...args) {
  return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
}

function globRegex(glob) {
  let expression = "^";
  for (let index = 0; index < glob.length; index += 1) {
    const character = glob[index];
    if (character === "*") {
      if (glob[index + 1] === "*" && glob[index + 2] === "/") { expression += "(?:.*/)?"; index += 2; }
      else if (glob[index + 1] === "*") { expression += ".*"; index += 1; }
      else expression += "[^/]*";
    } else if (character === "?") expression += "[^/]";
    else expression += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  }
  return new RegExp(`${expression}$`);
}

const changedFiles = new Set();
try { git("merge-base", base, "HEAD"); git("diff", "--name-only", `${base}...HEAD`).forEach((file) => changedFiles.add(file.replaceAll("\\", "/"))); }
catch { git("diff", "--name-only", base, "HEAD").forEach((file) => changedFiles.add(file.replaceAll("\\", "/"))); }
if (!process.env.CI) {
  git("diff", "--name-only").forEach((file) => changedFiles.add(file.replaceAll("\\", "/")));
  git("diff", "--cached", "--name-only").forEach((file) => changedFiles.add(file.replaceAll("\\", "/")));
  git("ls-files", "--others", "--exclude-standard").forEach((file) => changedFiles.add(file.replaceAll("\\", "/")));
}

const impactMap = parse(await readFile(resolve(repositoryRoot, "docs/doc-impact-map.yaml"), "utf8"));
const failures = [];
const impacts = [];
const repositoryFiles = new Set([...git("ls-files"), ...git("ls-files", "--others", "--exclude-standard")].map((file) => file.replaceAll("\\", "/")));
for (const rule of impactMap.rules ?? []) {
  for (const sourcePattern of rule.sources ?? []) {
    if (![...repositoryFiles].some((file) => globRegex(sourcePattern).test(file))) failures.push(`${rule.id}: source pattern matches no repository files: ${sourcePattern}`);
  }
  for (const target of [...(rule.generated ?? []), ...(rule.narrative ?? [])]) {
    try { await stat(resolve(repositoryRoot, target)); }
    catch { failures.push(`${rule.id}: documentation target does not exist: ${target}`); }
  }
}
const allRuleMatchers = (impactMap.rules ?? []).flatMap((rule) => rule.sources.map(globRegex));
const coverageIncludes = (impactMap.coverage?.include ?? []).map(globRegex);
const coverageExcludes = (impactMap.coverage?.exclude ?? []).map(globRegex);
const unmatchedCoveredFiles = [...changedFiles].filter((file) =>
  coverageIncludes.some((matcher) => matcher.test(file))
  && !coverageExcludes.some((matcher) => matcher.test(file))
  && !allRuleMatchers.some((matcher) => matcher.test(file)));
if (unmatchedCoveredFiles.length) failures.push(`Unmapped implementation changes: ${unmatchedCoveredFiles.join(", ")}. Add an explicit rule to docs/doc-impact-map.yaml.`);
for (const rule of impactMap.rules ?? []) {
  const matchers = rule.sources.map(globRegex);
  const matchedSources = [...changedFiles].filter((file) => matchers.some((matcher) => matcher.test(file)));
  if (!matchedSources.length) continue;
  const changedNarrative = (rule.narrative ?? []).filter((file) => changedFiles.has(file));
  impacts.push({ rule, matchedSources, changedNarrative });
  if ((rule.narrative ?? []).length && !changedNarrative.length) {
    failures.push(`${rule.id}: ${matchedSources.join(", ")} changed, but none of ${rule.narrative.join(", ")} changed.`);
  }
}

const exceptionRequested = process.env.DOCS_NOT_NEEDED === "true";
const pullRequestBody = process.env.DOCS_IMPACT_EXPLANATION ?? "";
const impactExplanation = pullRequestBody.match(/Documentation-impact explanation[^:]*:\s*\n+([^\n].*)/i)?.[1]?.trim() ?? "";
if (failures.length && exceptionRequested && impactExplanation.length < 20) failures.push("The docs-not-needed exception requires a documentation-impact explanation of at least 20 characters.");

console.log(`Documentation impact report (${changedFiles.size} changed files)`);
for (const impact of impacts) {
  console.log(`- ${impact.rule.id}: ${impact.matchedSources.join(", ")}`);
  console.log(`  narrative: ${impact.changedNarrative.length ? impact.changedNarrative.join(", ") : "not updated"}`);
}

if (failures.length && !(exceptionRequested && impactExplanation.length >= 20)) {
  console.error(`Documentation impact check failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else if (failures.length) {
  console.log(`Documentation update exempted by maintainer label: ${impactExplanation}`);
} else {
  console.log("Documentation impact check passed.");
}
