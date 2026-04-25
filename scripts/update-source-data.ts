import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type ExtractedSourceItem = {
  title: string;
  website: string;
  repositoryLabel: string | null;
  repositoryUrl: string | null;
  owner: string | null;
  description: string | null;
  sourceUrl: string;
};

const projectRoot = resolve(import.meta.dir, "..");
const sourcePath = resolve(projectRoot, "SOURCE.md");
const outputPath = resolve(projectRoot, "src/data/sourceDesignSystems.json");

const designSystemLinePattern =
  /^- \[(?<title>[^\]]+)\]\((?<website>[^)]+)\)(?: \[\[(?<repositoryLabel>[^\]]+)\]\((?<repositoryUrl>[^)]+)\)\])?(?: - (?<owner>[^-][^-]*?))?(?: - (?<description>.+))?$/;

function normalizeText(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next.length > 0 ? next : null;
}

function extractItems(markdown: string, sourceUrl: string) {
  const lines = markdown.split("\n");
  const items: ExtractedSourceItem[] = [];
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith("#### React UI libraries & Based Design Systems")) {
      inSection = true;
      continue;
    }

    if (inSection && line.startsWith("#### ")) {
      break;
    }

    if (!inSection || !line.startsWith("- [")) {
      continue;
    }

    const match = line.match(designSystemLinePattern);
    if (!match?.groups) {
      continue;
    }

    items.push({
      title: match.groups.title.trim(),
      website: match.groups.website.trim(),
      repositoryLabel: normalizeText(match.groups.repositoryLabel),
      repositoryUrl: normalizeText(match.groups.repositoryUrl),
      owner: normalizeText(match.groups.owner),
      description: normalizeText(match.groups.description),
      sourceUrl,
    });
  }

  return items;
}

async function readSourceUrls() {
  const raw = await readFile(sourcePath, "utf8");

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^https?:\/\//.test(line));
}

async function fetchMarkdown(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function main() {
  const sourceUrls = await readSourceUrls();
  const sourceItems = await Promise.all(
    sourceUrls.map(async (sourceUrl) => {
      const markdown = await fetchMarkdown(sourceUrl);
      return extractItems(markdown, sourceUrl);
    }),
  );

  const items = sourceItems.flat();
  await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`);
  console.log(`Extracted ${items.length} design system entries from ${sourceUrls.length} source link(s).`);
}

await main();
