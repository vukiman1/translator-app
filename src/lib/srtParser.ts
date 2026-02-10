import type { SubtitleEntry } from "@/types";

/**
 * Parse SRT file content thành array of subtitle entries
 */
export function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    if (isNaN(index)) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\S+)\s+-->\s+(\S+)/);
    if (!timeMatch) continue;

    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const text = lines.slice(2).join("\n");

    entries.push({
      index,
      startTime,
      endTime,
      text,
    });
  }

  return entries;
}

/**
 * Convert subtitle entries thành SRT format string
 */
export function stringifySRT(entries: SubtitleEntry[]): string {
  return entries
    .map((entry) => {
      return `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`;
    })
    .join("\n\n");
}

/**
 * Split subtitle entries thành 2 parts (để tránh API limit)
 */
export function splitEntries(
  entries: SubtitleEntry[],
): [SubtitleEntry[], SubtitleEntry[]] {
  const midpoint = Math.ceil(entries.length / 2);
  const part1 = entries.slice(0, midpoint);
  const part2 = entries.slice(midpoint);
  return [part1, part2];
}

/**
 * Extract text từ subtitle entries để gửi lên API
 */
export function extractTexts(entries: SubtitleEntry[]): string[] {
  return entries.map((entry) => entry.text);
}

/**
 * Merge translated texts vào subtitle entries
 */
export function mergeTranslatedTexts(
  entries: SubtitleEntry[],
  translatedTexts: string[],
): SubtitleEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    text: translatedTexts[index] || entry.text,
  }));
}
