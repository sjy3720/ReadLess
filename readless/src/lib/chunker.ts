// ==========================================
// ReadLess - Text Chunker
// Handles splitting large documents for AI processing
// ==========================================

import { TextChunk, HeadingItem, DocumentStructure } from '@/types';

const CHARS_PER_TOKEN_ESTIMATE = 2.5;
const MAX_CHUNK_TOKENS = 4000;
const MAX_CHUNK_CHARS = Math.floor(MAX_CHUNK_TOKENS * CHARS_PER_TOKEN_ESTIMATE);
const OVERLAP_CHARS = 200;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
}

export function createTextChunks(
  text: string,
  structure: DocumentStructure
): TextChunk[] {
  const chunks: TextChunk[] = [];

  if (text.length <= MAX_CHUNK_CHARS) {
    chunks.push({
      index: 0,
      text: text.trim(),
      charCount: text.length,
      estimatedTokens: estimateTokens(text),
    });
    return chunks;
  }

  // Split by headings first
  if (structure.headings.length > 0) {
    const sections = splitByHeading(text, structure.headings);
    let currentChunk = '';
    let chunkIndex = 0;
    let currentHeading = '';

    for (const section of sections) {
      const sectionText = section.text;
      const estimatedNewTokens = estimateTokens(currentChunk + sectionText);

      if (
        estimatedNewTokens > MAX_CHUNK_TOKENS &&
        currentChunk.length > 0
      ) {
        chunks.push({
          index: chunkIndex++,
          text: currentChunk.trim(),
          charCount: currentChunk.length,
          estimatedTokens: estimateTokens(currentChunk),
          heading: currentHeading || undefined,
        });
        currentChunk = sectionText;
        currentHeading = section.heading || '';
      } else {
        if (!currentHeading && section.heading) {
          currentHeading = section.heading;
        }
        currentChunk += (currentChunk ? '\n\n' : '') + sectionText;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        index: chunkIndex,
        text: currentChunk.trim(),
        charCount: currentChunk.length,
        estimatedTokens: estimateTokens(currentChunk),
        heading: currentHeading || undefined,
      });
    }

    return chunks;
  }

  // Fallback: split by paragraphs with overlap
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (
      estimateTokens(currentChunk + '\n\n' + trimmedPara) > MAX_CHUNK_TOKENS &&
      currentChunk.length > 0
    ) {
      chunks.push({
        index: chunkIndex++,
        text: currentChunk.trim(),
        charCount: currentChunk.length,
        estimatedTokens: estimateTokens(currentChunk),
      });

      // Overlap: keep last part of previous chunk for context
      const words = currentChunk.split(/\s+/);
      const overlapText = words.slice(-Math.floor(OVERLAP_CHARS / 5)).join(' ');
      currentChunk = overlapText + '\n\n' + trimmedPara;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      index: chunkIndex,
      text: currentChunk.trim(),
      charCount: currentChunk.length,
      estimatedTokens: estimateTokens(currentChunk),
    });
  }

  return chunks;
}

interface HeadingSection {
  heading: string;
  text: string;
}

function splitByHeading(
  text: string,
  headings: HeadingItem[]
): HeadingSection[] {
  const sections: HeadingSection[] = [];

  if (headings.length === 0) {
    sections.push({ heading: '', text });
    return sections;
  }

  // Sort headings by position
  const sorted = [...headings].sort((a, b) => a.position - b.position);

  // Text before first heading
  if (sorted[0].position > 0) {
    sections.push({
      heading: '',
      text: text.slice(0, sorted[0].position).trim(),
    });
  }

  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i].position;
    const end = i < sorted.length - 1 ? sorted[i + 1].position : text.length;
    sections.push({
      heading: sorted[i].text,
      text: text.slice(start, end).trim(),
    });
  }

  return sections.filter((s) => s.text.length > 0);
}

export function filterNoiseContent(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{3,}/g, '  ')
    .replace(/^\s*[•●○▪▸►▻■□◆◇○◙◘◈◉◊]\s*/gm, '')
    .replace(/Page\s+\d+\s*(of\s+\d+)?/gi, '')
    .replace(/^\s*\d+\s*$/gm, '')
    .trim();
}

export function extractStructure(text: string): DocumentStructure {
  const lines = text.split('\n');
  const headings: HeadingItem[] = [];
  let title = '';
  let pos = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      pos += line.length + 1;
      continue;
    }

    // Detect heading patterns
    const headingMatch = detectHeading(trimmed);
    if (headingMatch) {
      headings.push({
        level: headingMatch.level,
        text: headingMatch.text,
        position: pos,
      });
      if (!title && headingMatch.level <= 2) {
        title = headingMatch.text;
      }
    }

    pos += line.length + 1;
  }

  // Fallback title
  if (!title) {
    const firstNonEmpty = lines.find((l) => l.trim().length > 0);
    title = firstNonEmpty?.trim().slice(0, 100) || 'Untitled Document';
  }

  return {
    title,
    headings,
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length,
    hasTableOfContents: /目录|目次|contents|table\s+of\s+contents/i.test(
      text.slice(0, 2000)
    ),
  };
}

function detectHeading(line: string): { level: number; text: string } | null {
  // Markdown headings: # ## ### etc
  const mdMatch = line.match(/^(#{1,6})\s+(.+)/);
  if (mdMatch) {
    return { level: mdMatch[1].length, text: mdMatch[2].trim() };
  }

  // Numbered headings: 1. 1.1 1.1.1 第一章 第一节
  const numMatch = line.match(
    /^((?:第[一二三四五六七八九十百千]+[章节]|[\d.]+\s*)+)\s*(.+)/
  );
  if (numMatch && line.length < 120) {
    const level = (numMatch[1].match(/\./g) || []).length + 1;
    return { level: Math.min(level, 4), text: line.trim() };
  }

  // All-caps short line = likely heading
  if (
    line === line.toUpperCase() &&
    line.length > 3 &&
    line.length < 80 &&
    /[A-Z一-鿿]/.test(line)
  ) {
    return { level: 2, text: line };
  }

  return null;
}
