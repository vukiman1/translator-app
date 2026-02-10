import { invoke } from "@tauri-apps/api/core";
import {
  parseSRT,
  stringifySRT,
  splitEntries,
  extractTexts,
  mergeTranslatedTexts,
} from "./srtParser";
import type { SubtitleEntry } from "@/types";

const TRANSLATE_API_URL =
  "https://translate-pa.googleapis.com/v1/translateHtml";

interface TranslateApiResponse {
  translations: Array<{
    translatedText: string;
  }>;
}

/**
 * Call Google Translate API để dịch array of texts
 */
export async function translateTexts(
  texts: string[],
  apiKey: string,
  sourceLang: string = "auto",
  targetLang: string = "vi",
): Promise<string[]> {
  const requestBody = [[texts, sourceLang, targetLang], "te"];

  const response = await fetch(TRANSLATE_API_URL, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "content-type": "application/json+protobuf",
      origin: "https://translatesubtitles.co",
      "x-browser-validation": "KqmDAG1DH9OIy1zCqHPuTzvnaBc=",
      "x-browser-year": "2026",
      "x-browser-channel": "stable",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // API response format: [[["translated1", "original1", null, null, 3], ["translated2", ...], ...]]
  // We need to extract the first element of each inner array
  if (
    Array.isArray(data) &&
    Array.isArray(data[0]) &&
    Array.isArray(data[0][0])
  ) {
    return data[0][0].map((item: any) => {
      if (Array.isArray(item) && item.length > 0) {
        return item[0]; // First element is the translated text
      }
      return "";
    });
  }

  throw new Error("Unexpected API response format");
}

/**
 * Translate 1 SRT file hoàn chỉnh
 * - Read file
 * - Parse SRT
 * - Split thành 2 parts
 * - Translate từng part
 * - Merge results
 * - Save file mới
 * - Delete file gốc
 */
export async function translateSRTFile(
  filePath: string,
  apiKey: string,
  sourceLang: string = "auto",
  targetLang: string = "vi",
  onProgress?: (progress: number) => void,
): Promise<void> {
  try {
    // Step 1: Read file
    onProgress?.(10);
    const content = await invoke<string>("read_srt_file", { filePath });

    // Step 2: Parse SRT
    onProgress?.(20);
    const entries = parseSRT(content);

    if (entries.length === 0) {
      throw new Error("No subtitle entries found in file");
    }

    // Step 3: Split thành 2 parts
    onProgress?.(25);
    const [part1, part2] = splitEntries(entries);
    const texts1 = extractTexts(part1);
    const texts2 = extractTexts(part2);

    // Step 4: Translate part 1
    onProgress?.(30);
    const translated1 = await translateTexts(
      texts1,
      apiKey,
      sourceLang,
      targetLang,
    );
    onProgress?.(60);

    // Step 5: Translate part 2
    const translated2 = await translateTexts(
      texts2,
      apiKey,
      sourceLang,
      targetLang,
    );
    onProgress?.(85);

    // Step 6: Merge results
    const translatedPart1 = mergeTranslatedTexts(part1, translated1);
    const translatedPart2 = mergeTranslatedTexts(part2, translated2);
    const allTranslated = [...translatedPart1, ...translatedPart2];

    // Step 7: Convert back to SRT format
    const translatedContent = stringifySRT(allTranslated);

    // Step 8: Generate new file path
    const newFilePath = filePath.replace(/\.srt$/i, "_translated.srt");

    // Step 9: Save translated file
    onProgress?.(90);
    await invoke("write_srt_file", {
      filePath: newFilePath,
      content: translatedContent,
    });

    // Step 10: Delete original file
    onProgress?.(95);
    await invoke("delete_file", { filePath });

    onProgress?.(100);
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

/**
 * Translate nhiều files tuần tự
 */
export async function translateMultipleFiles(
  filePaths: string[],
  apiKey: string,
  sourceLang: string = "auto",
  targetLang: string = "vi",
  onFileProgress?: (fileIndex: number, progress: number) => void,
  onOverallProgress?: (completed: number, total: number) => void,
): Promise<{
  success: string[];
  failed: Array<{ path: string; error: string }>;
}> {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ path: string; error: string }>,
  };

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];

    try {
      await translateSRTFile(
        filePath,
        apiKey,
        sourceLang,
        targetLang,
        (progress) => onFileProgress?.(i, progress),
      );

      results.success.push(filePath);
    } catch (error) {
      results.failed.push({
        path: filePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    onOverallProgress?.(i + 1, filePaths.length);
  }

  return results;
}
