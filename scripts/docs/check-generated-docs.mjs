import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const changes = execFileSync("git", ["status", "--porcelain", "--", "docs/generated"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();

if (changes) {
  console.error("Generated documentation is stale or uncommitted:");
  console.error(changes);
  console.error("Run `npm run docs:generate` and commit the resulting docs/generated changes.");
  process.exitCode = 1;
} else {
  console.log("Generated documentation is current.");
}
