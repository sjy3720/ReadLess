// ==========================================
// ReadLess - File Parser
// TXT/MD parsed client-side, PDF/DOCX via Cloudflare Functions API
// ==========================================

import { ParsedContent, SupportedFileType } from '@/types';
import { extractStructure, createTextChunks, filterNoiseContent } from './chunker';

interface ParseResult {
  success: boolean;
  content?: ParsedContent;
  error?: string;
}

export async function parseFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  const fileType = getFileType(file.name);

  try {
    onProgress?.(10);

    let text: string;

    switch (fileType) {
      case 'txt':
      case 'md':
      case 'markdown':
        text = await parseTextFile(file);
        break;

      case 'pdf':
      case 'docx':
      case 'doc':
      case 'wps':
        text = await parseViaServer(file);
        break;

      default:
        return { success: false, error: `不支持的文件格式: .${fileType}` };
    }

    onProgress?.(60);

    if (!text || text.trim().length < 20) {
      return { success: false, error: '文件内容为空或无法解析，请确认文件未加密且包含文字内容。' };
    }

    const cleaned = filterNoiseContent(text);
    const structure = extractStructure(cleaned);
    const chunks = createTextChunks(cleaned, structure);

    onProgress?.(90);

    const content: ParsedContent = {
      text: cleaned,
      pageCount: estimatePageCount(cleaned),
      wordCount: countChineseWords(cleaned),
      charCount: cleaned.length,
      structure,
      chunks,
    };

    onProgress?.(100);

    return { success: true, content };
  } catch (error) {
    console.error('File parse error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件解析失败，请重试',
    };
  }
}

async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'UTF-8');
  });
}

async function parseViaServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `服务器解析失败 (${response.status})`);
    }

    const data = await response.json();
    if (!data.text || data.text.trim().length < 20) {
      throw new Error('文件内容为空或无法提取文字，请确认文件不是扫描版图片。');
    }

    return data.text;
  } finally {
    clearTimeout(timeout);
  }
}

function estimatePageCount(text: string): number {
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.max(1, Math.ceil(chineseChars / 800 + otherChars / 3000));
}

function countChineseWords(text: string): number {
  const chineseCount = (text.match(/[一-鿿]/g) || []).length;
  const englishText = text.replace(/[一-鿿]/g, ' ');
  const englishWords = englishText.split(/\s+/).filter((w) => w.length > 0).length;
  return chineseCount + englishWords;
}

function getFileType(fileName: string): SupportedFileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, SupportedFileType> = {
    pdf: 'pdf', docx: 'docx', doc: 'doc', wps: 'wps',
    txt: 'txt', md: 'md', markdown: 'markdown',
  };
  return map[ext] || 'txt';
}

export { getFileType, countChineseWords };
