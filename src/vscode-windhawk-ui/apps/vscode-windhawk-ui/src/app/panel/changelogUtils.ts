export type ChangelogSection = {
  heading: string;
  markdown: string;
  body: string;
  bulletCount: number;
};

function countBulletLines(markdown: string): number {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\s*[-*+]\s+/.test(line))
    .length;
}

function finalizeSection(lines: string[]): ChangelogSection | null {
  const markdown = lines.join('\n').trim();
  if (!markdown) {
    return null;
  }

  const [firstLine, ...restLines] = markdown.split(/\r?\n/);
  const headingMatch = firstLine.match(/^(#{1,6})\s+(.*)$/);
  const heading = headingMatch?.[2]?.trim() || '';
  const body = headingMatch ? restLines.join('\n').trim() : markdown;

  return {
    heading,
    markdown,
    body,
    bulletCount: countBulletLines(markdown),
  };
}

export function parseChangelogSections(markdown: string): ChangelogSection[] {
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalizedMarkdown) {
    return [];
  }

  const lines = normalizedMarkdown.split('\n');
  const sections: ChangelogSection[] = [];
  let currentLines: string[] = [];

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line) && currentLines.length > 0) {
      const section = finalizeSection(currentLines);
      if (section) {
        sections.push(section);
      }
      currentLines = [line];
      continue;
    }

    currentLines.push(line);
  }

  const lastSection = finalizeSection(currentLines);
  if (lastSection) {
    sections.push(lastSection);
  }

  return sections;
}

export function filterChangelogSections(
  sections: ChangelogSection[],
  query: string
): ChangelogSection[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return sections;
  }

  return sections.filter((section) => (
    `${section.heading}\n${section.body}`.toLowerCase().includes(normalizedQuery)
  ));
}

export function selectChangelogSections(
  sections: ChangelogSection[],
  options: {
    latestOnly?: boolean;
    sectionIndex?: number | null;
  }
): ChangelogSection[] {
  const { latestOnly = false, sectionIndex = null } = options;

  if (latestOnly) {
    return sections.length > 0 ? [sections[0]] : [];
  }

  if (
    sectionIndex !== null &&
    Number.isInteger(sectionIndex) &&
    sectionIndex >= 0 &&
    sectionIndex < sections.length
  ) {
    return [sections[sectionIndex]];
  }

  return sections;
}
