// ==========================================
// ReadLess - Cloudflare Pages Function
// File Parse API — DOCX/PDF/TXT/Markdown/Image OCR
// ==========================================

import JSZip from 'jszip';

interface Env {
  OCR_SPACE_API_KEY?: string;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'];

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ code: 'METHOD_NOT_ALLOWED', message: '仅支持 POST' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ code: 'NO_FILE', message: '未找到上传文件' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const fileName = file.name.toLowerCase();
    let text = '';

    // Check if it's an image that needs OCR
    const isImage = IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (isImage) {
      return new Response(JSON.stringify({
        code: 'IMAGE_UPGRADING',
        message: '图片识别功能正在升级中，推荐上传 PDF / Word 获得最佳体验',
      }), {
        status: 503,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } else if (fileName.endsWith('.pdf')) {
      text = await parsePdf(file);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || fileName.endsWith('.wps')) {
      text = await parseDocx(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
      text = await file.text();
    } else {
      return new Response(JSON.stringify({
        code: 'UNSUPPORTED_FORMAT',
        message: `不支持的文件格式: ${fileName.split('.').pop()}`,
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!text || text.trim().length < 10) {
      return new Response(JSON.stringify({
        code: 'EMPTY_CONTENT',
        message: isImage
          ? '图片中未识别到文字内容，请确认图片清晰且包含文字。'
          : '文件内容为空或无法解析。请确认文件未加密且包含文字内容。',
      }), {
        status: 422,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ text, charCount: text.length }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '文件解析失败';
    console.error('Parse error:', message);
    return new Response(JSON.stringify({ code: 'PARSE_ERROR', message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}

// ---- Image OCR via OCR.space API ----
// Flow: Image → OCR.space → extracted text → returned to client → client sends text to DeepSeek for summarization
// DeepSeek never receives images — only the OCR-extracted plain text.
async function performOCR(file: File, env: Env): Promise<string> {
  const ocrApiKey = env.OCR_SPACE_API_KEY || 'helloworld';

  // Convert image to base64
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    Array.from(new Uint8Array(arrayBuffer))
      .map((b) => String.fromCharCode(b))
      .join('')
  );

  // Determine file type for OCR.space
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filetypeMap: Record<string, string> = {
    jpg: 'jpg', jpeg: 'jpg', png: 'png',
    webp: 'webp', bmp: 'bmp', gif: 'gif',
  };
  const filetype = filetypeMap[ext] || 'png';

  const formData = new FormData();
  formData.append('base64Image', `data:image/${filetype};base64,${base64}`);
  formData.append('language', 'chs,eng');
  formData.append('isTable', 'true');
  formData.append('OCREngine', '2');
  formData.append('filetype', filetype);

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: ocrApiKey },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('图片文字识别失败，请尝试更清晰的图片');
  }

  const data = (await response.json()) as {
    ParsedResults?: { ParsedText?: string }[];
    ErrorMessage?: string;
    IsErroredOnProcessing?: boolean;
  };

  if (data.IsErroredOnProcessing || !data.ParsedResults?.length) {
    throw new Error('图片文字识别失败，请尝试更清晰的图片');
  }

  const extractedText = data.ParsedResults[0]?.ParsedText?.trim() || '';
  if (!extractedText || extractedText.length < 5) {
    throw new Error('图片中未识别到文字内容，请确认图片清晰且包含文字。');
  }

  return extractedText;
}

// ---- DOCX Parser ----
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('无法解析此文档，word/document.xml 未找到');
  }

  const xmlText = await docXmlFile.async('string');
  const paragraphs: string[] = [];
  const paraRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
  const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;

  let paraMatch: RegExpExecArray | null;
  while ((paraMatch = paraRegex.exec(xmlText)) !== null) {
    const paraContent = paraMatch[1];
    const texts: string[] = [];
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textRegex.exec(paraContent)) !== null) {
      texts.push(textMatch[1]);
    }
    const line = texts.join('').trim();
    if (line) paragraphs.push(line);
  }

  const result = paragraphs.join('\n');
  if (result.length < 10) {
    return xmlText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return result;
}

// ---- PDF Parser ----
async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8array = new Uint8Array(arrayBuffer);

  let text = '';
  for (let i = 0; i < uint8array.length; i++) {
    const byte = uint8array[i];
    if (byte >= 32 && byte < 127) text += String.fromCharCode(byte);
    else if (byte >= 0x80) text += String.fromCharCode(byte);
  }

  const streamRegex = /stream\s+([\s\S]*?)endstream/g;
  const streams: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(text)) !== null) {
    streams.push(match[1]);
  }

  if (streams.length > 0) {
    let extracted = '';
    for (const stream of streams) {
      const cleaned = extractReadableFromPDFStream(stream);
      if (cleaned.length > 20) extracted += cleaned + '\n';
    }
    if (extracted.trim().length > 50) return extracted.trim();
  }

  const readable = extractReadableFromBinary(text);
  if (readable.length > 100) return readable;

  throw new Error(
    '此 PDF 可能为扫描版图片格式，无法直接提取文字。请尝试：1) 截图后使用"相册导入"OCR 2) 使用带文字层的 PDF'
  );
}

function extractReadableFromPDFStream(stream: string): string {
  const textRegex = /\(([^)]*)\)\s*Tj/g;
  const texts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = textRegex.exec(stream)) !== null) {
    texts.push(match[1]);
  }
  return texts.join(' ');
}

function extractReadableFromBinary(raw: string): string {
  const cleaned = raw.replace(/[^\x20-\x7E一-鿿　-〿＀-￯\n\r\t]/g, '');
  const lines = cleaned.split(/[\n\r]+/).filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 5 && /[一-鿿\w]/.test(trimmed);
  });
  return lines.join('\n');
}
