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
const designSystemTableRowPattern =
  /^\|.+\|\s+\*\*(?<title>[^*]+)\*\*\s+\|\s+(?<description>.*?)\s+\|\s+\[(?<linkLabel>[^\]]+)\]\((?<website>[^)]+)\)\s+\|$/;

function normalizeText(value: string | undefined) {
  const next = value?.trim() ?? "";
  return next.length > 0 ? next : null;
}

function extractItems(markdown: string, sourceUrl: string) {
  const legacyItems = extractLegacyListItems(markdown, sourceUrl);
  const tableItems = extractDesignSystemTableItems(markdown, sourceUrl);

  const merged = [...legacyItems, ...tableItems];
  const deduped = new Map<string, ExtractedSourceItem>();

  for (const item of merged) {
    const existing = deduped.get(item.title);

    if (!existing) {
      deduped.set(item.title, item);
      continue;
    }

    const existingScore = scoreItem(existing);
    const nextScore = scoreItem(item);

    if (nextScore > existingScore) {
      deduped.set(item.title, item);
    }
  }

  return Array.from(deduped.values());
}

function scoreItem(item: ExtractedSourceItem) {
  return [
    item.repositoryUrl ? 1 : 0,
    item.owner ? 1 : 0,
    item.description ? 1 : 0,
  ].reduce((total, current) => total + current, 0);
}

function extractLegacyListItems(markdown: string, sourceUrl: string) {
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

function extractDesignSystemTableItems(markdown: string, sourceUrl: string) {
  const lines = markdown.split("\n");
  const items: ExtractedSourceItem[] = [];
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith("## 🎨 Design Systems")) {
      inSection = true;
      continue;
    }

    if (inSection && line.startsWith("## ")) {
      break;
    }

    if (!inSection || !line.startsWith("|")) {
      continue;
    }

    const match = line.match(designSystemTableRowPattern);

    if (!match?.groups) {
      continue;
    }

    items.push({
      title: match.groups.title.trim(),
      website: match.groups.website.trim(),
      repositoryLabel: null,
      repositoryUrl: null,
      owner: null,
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

  const items = dedupeItems(sourceItems.flat());
  await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`);
  console.log(`Extracted ${items.length} design system entries from ${sourceUrls.length} source link(s).`);
}

function dedupeItems(items: ExtractedSourceItem[]) {
  const deduped = new Map<string, ExtractedSourceItem>();

  for (const item of items) {
    const key = normalizeKey(item);
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, item);
      continue;
    }

    deduped.set(key, mergeItems(existing, item));
  }

  return Array.from(deduped.values()).sort((a, b) => a.title.localeCompare(b.title));
}

function normalizeKey(item: ExtractedSourceItem) {
  const normalizedWebsite = item.website
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .toLowerCase();

  return normalizedWebsite || item.title.trim().toLowerCase();
}

function mergeItems(current: ExtractedSourceItem, incoming: ExtractedSourceItem): ExtractedSourceItem {
  const preferred = scoreItem(incoming) > scoreItem(current) ? incoming : current;
  const fallback = preferred === incoming ? current : incoming;

  return {
    title: preferred.title,
    website: preferred.website,
    repositoryLabel: preferred.repositoryLabel ?? fallback.repositoryLabel,
    repositoryUrl: preferred.repositoryUrl ?? fallback.repositoryUrl,
    owner: preferred.owner ?? fallback.owner,
    description: preferred.description ?? fallback.description,
    sourceUrl: preferred.sourceUrl,
  };
}

await main();
