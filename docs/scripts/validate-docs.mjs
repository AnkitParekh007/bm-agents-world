import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(docsRoot, "..");
const outputRoot = join(docsRoot, "_book");
const failures = [];
const generatedSourceReferences = new Set([
  "apps/agent-window/dist/client",
  "apps/agent-window/.playwright-auth/",
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return nested.flat();
}

async function walkSources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((entry) => !["_book", "node_modules"].includes(entry.name))
    .map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walkSources(path) : [path];
    }));
  return nested.flat();
}

function localTargets(html) {
  const targets = [];
  const pattern = /(?:href|src)=["']([^"']+)["']/g;
  for (const match of html.matchAll(pattern)) {
    const value = match[1];
    if (/^(?:[a-z]+:|#|\/\/|mailto:|javascript:)/i.test(value)) continue;
    targets.push(value.split("#")[0].split("?")[0]);
  }
  return targets.filter(Boolean);
}

const summary = await readFile(join(docsRoot, "SUMMARY.md"), "utf8");
const summaryPages = [...summary.matchAll(/\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)].map((match) => match[1]);
for (const page of summaryPages) {
  try { await stat(join(docsRoot, page)); } catch { failures.push(`SUMMARY source is missing: ${page}`); }
}

const sourceFiles = await walkSources(docsRoot);
const markdownSources = sourceFiles
  .filter((file) => extname(file) === ".md" && relative(docsRoot, file) !== "SUMMARY.md")
  .map((file) => relative(docsRoot, file).replaceAll("\\", "/"));
for (const page of markdownSources) {
  if (!summaryPages.includes(page)) failures.push(`Markdown source is missing from SUMMARY.md: ${page}`);
}

for (const page of markdownSources.filter((page) => page.startsWith("generated/"))) {
  const generated = await readFile(join(docsRoot, page), "utf8");
  if (!generated.startsWith("<!-- GENERATED FILE: DO NOT EDIT DIRECTLY.")) failures.push(`Generated page marker is missing: ${page}`);
}

for (const file of sourceFiles.filter((file) => extname(file) === ".json" && !["package.json", "package-lock.json", "book.json"].includes(relative(docsRoot, file).replaceAll("\\", "/")))) {
  try { JSON.parse(await readFile(file, "utf8")); }
  catch { failures.push(`Invalid JSON documentation asset: ${relative(docsRoot, file)}`); }
}

const rootPackage = JSON.parse(await readFile(join(repositoryRoot, "package.json"), "utf8"));
const bookConfig = JSON.parse(await readFile(join(docsRoot, "book.json"), "utf8"));
if (bookConfig.pluginsConfig?.["bm-theme"]?.projectVersion !== rootPackage.version) {
  failures.push("Documentation version does not match the root package version.");
}

for (const page of summaryPages) {
  const markdown = await readFile(join(docsRoot, page), "utf8");
  const references = [...markdown.matchAll(/`((?:apps|deploy|packs|\.github|docs)\/[^`\s,;)]+)/g)].map((match) => match[1]);
  for (const reference of references) {
    if (reference.includes("*") || reference.includes("<")) continue;
    const clean = reference.replace(/[.:]+$/, "");
    if (generatedSourceReferences.has(clean)) continue;
    try { await stat(join(repositoryRoot, clean)); }
    catch { failures.push(`Missing source reference in ${page}: ${reference}`); }
  }
}

const files = await walk(outputRoot);
const htmlFiles = files.filter((file) => extname(file) === ".html");
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const label = relative(outputRoot, file);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`Missing title: ${label}`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) failures.push(`Missing description: ${label}`);
  for (const target of localTargets(html)) {
    const destination = resolve(dirname(file), decodeURIComponent(target));
    try { await stat(destination.endsWith("/") ? join(destination, "index.html") : destination); }
    catch { failures.push(`Broken link in ${label}: ${target}`); }
  }
}

const searchIndex = join(outputRoot, "search_index.json");
try {
  const search = await stat(searchIndex);
  if (search.size < 1000) failures.push("Search index is unexpectedly small.");
} catch { failures.push("Search index is missing."); }

if (!files.some((file) => relative(outputRoot, file) === "404.html")) failures.push("404.html is missing.");
const themeCss = await readFile(join(outputRoot, "gitbook", "gitbook-plugin-bm-theme", "theme.css"), "utf8");
if (!themeCss.includes("@media print")) failures.push("Print stylesheet is missing.");

if (failures.length) {
  console.error(`Documentation validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Documentation validation passed: ${htmlFiles.length} pages, ${summaryPages.length} SUMMARY entries, links and metadata verified.`);
}
