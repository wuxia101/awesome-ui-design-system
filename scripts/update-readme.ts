import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type LocaleText = {
  zh: string;
  en: string;
};

type DesignSystem = {
  title: string;
  description: LocaleText;
  website: string;
  github: string;
  tags: LocaleText[];
};

const projectRoot = resolve(import.meta.dir, "..");
const dataPath = resolve(projectRoot, "src/data/designSystems.json");
const readmePath = resolve(projectRoot, "README.md");
const startMarker = "<!-- DESIGN_SYSTEMS:START -->";
const endMarker = "<!-- DESIGN_SYSTEMS:END -->";

function formatTags(tags: LocaleText[]) {
  return tags.map((tag) => `\`${tag.zh} / ${tag.en}\``).join(" ");
}

function buildGeneratedSection(designSystems: DesignSystem[]) {
  const lines = [
    "## Collected Design Systems",
    "",
    ...designSystems.flatMap((system) => [
      `### ${system.title}`,
      "",
      `- Website: ${system.website}`,
      `- GitHub: ${system.github}`,
      `- 中文说明: ${system.description.zh}`,
      `- English: ${system.description.en}`,
      `- Tags: ${formatTags(system.tags)}`,
      "",
    ]),
  ];

  return `${startMarker}\n${lines.join("\n").trimEnd()}\n${endMarker}`;
}

async function main() {
  const [rawData, rawReadme] = await Promise.all([
    readFile(dataPath, "utf8"),
    readFile(readmePath, "utf8"),
  ]);

  const designSystems = JSON.parse(rawData) as DesignSystem[];
  const generatedSection = buildGeneratedSection(designSystems);

  const markerPattern = new RegExp(
    `${startMarker}[\\s\\S]*?${endMarker}`,
    "m",
  );

  const nextReadme = markerPattern.test(rawReadme)
    ? rawReadme.replace(markerPattern, generatedSection)
    : `${rawReadme.trimEnd()}\n\n${generatedSection}\n`;

  await writeFile(readmePath, nextReadme);
  console.log(`Updated README from ${designSystems.length} design systems.`);
}

await main();
