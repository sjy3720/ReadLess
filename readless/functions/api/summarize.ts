// ==========================================
// ReadLess - Cloudflare Pages Function
// AI Summarize API — DeepSeek/OpenAI chunked analysis
// ==========================================

interface Env {
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  FREE_TRIALS?: string;
}

interface ParsedContent {
  text: string;
  pageCount?: number;
  wordCount: number;
  charCount: number;
  structure: DocStructure;
  chunks: TextChunk[];
}

interface DocStructure {
  title: string;
  headings: { level: number; text: string; position: number }[];
  paragraphs: number;
  hasTableOfContents: boolean;
}

interface TextChunk {
  index: number;
  text: string;
  charCount: number;
  estimatedTokens: number;
  heading?: string;
}

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const CHARS_PER_TOKEN = 2.5;
const MAX_CONTEXT_CHARS = 12000;

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
    const aiConfig = getAIConfig(context.env);
    if (!aiConfig) {
      return new Response(JSON.stringify({
        code: 'NO_API_KEY',
        message: 'AI 服务未配置。请在 Cloudflare Dashboard 中设置环境变量。',
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const body = await context.request.json() as {
      content: ParsedContent;
      fileName: string;
      fileType: string;
      fileSize: number;
    };

    const { content, fileName, fileType, fileSize } = body;

    if (!content || !content.text) {
      return new Response(JSON.stringify({ code: 'NO_CONTENT', message: '缺少文件内容' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const result = await analyzeDocument(content, fileName, fileType, fileSize, aiConfig);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI 分析失败';
    console.error('Summarize error:', message);

    const isRateLimit = /rate|quota|429|insufficient/i.test(message);

    return new Response(JSON.stringify({
      code: isRateLimit ? 'RATE_LIMIT' : 'AI_ERROR',
      message: isRateLimit ? 'API 调用频率超限，请稍后重试。' : `AI 分析失败: ${message}`,
    }), {
      status: isRateLimit ? 429 : 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}

function getAIConfig(env: Env): AIConfig | null {
  const provider = env.AI_PROVIDER || 'deepseek';

  if (provider === 'openai') {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey || apiKey.startsWith('sk-your-')) return null;
    return {
      apiKey,
      baseUrl: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: env.AI_MODEL || 'gpt-4o-mini',
    };
  }

  // DeepSeek
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-your-')) return null;
  return {
    apiKey,
    baseUrl: env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: env.AI_MODEL || 'deepseek-chat',
  };
}

// ---- AI Analysis Orchestrator ----

async function analyzeDocument(
  content: ParsedContent,
  fileName: string,
  fileType: string,
  fileSize: number,
  config: AIConfig
) {
  const startTime = Date.now();

  // Build context within token budget
  const context = buildContext(content);

  // Run all analyses in parallel
  const [
    summary,
    examMode,
    workFocus,
    plainLanguage,
    speedRead,
    keywords,
    flashCards,
    lateNight,
  ] = await Promise.all([
    callAI(config, 'summary', context),
    callAI(config, 'examMode', context, content),
    callAI(config, 'workFocus', context, content),
    callAI(config, 'plainLanguage', context),
    callAI(config, 'speedRead', context),
    callAI(config, 'keywords', context),
    callAI(config, 'flashCards', context),
    callAI(config, 'lateNight', context),
  ]);

  return {
    id: `rl_${Date.now().toString(36)}`,
    fileName,
    fileType,
    fileSize,
    wordCount: content.wordCount,
    summary,
    examMode,
    workFocus,
    plainLanguage,
    speedRead,
    keywords,
    flashCards,
    lateNight,
    processingTime: Math.round((Date.now() - startTime) / 1000),
    createdAt: new Date().toISOString(),
  };
}

function buildContext(content: ParsedContent): string {
  const parts: string[] = [];

  parts.push(`文档标题: ${content.structure.title}`);
  parts.push(`总字数: ${content.wordCount}`);

  if (content.structure.headings.length > 0) {
    const headings = content.structure.headings
      .slice(0, 30)
      .map((h) => `- ${h.text}`)
      .join('\n');
    parts.push(`章节结构:\n${headings}`);
  }

  // Include text within char limit
  const remainingChars = MAX_CONTEXT_CHARS - parts.join('\n').length;
  if (remainingChars > 0) {
    if (content.text.length <= remainingChars) {
      parts.push(`\n全文:\n${content.text}`);
    } else {
      const halfChars = Math.floor(remainingChars / 2);
      parts.push(`\n文档开头:\n${content.text.slice(0, halfChars)}`);
      parts.push(`\n文档结尾:\n${content.text.slice(-halfChars)}`);
    }
  }

  return parts.join('\n\n---\n\n');
}

// ---- AI Call ----

const PROMPTS: Record<string, string> = {
  summary: '你是一个专业内容总结助手。请用中文总结文档核心内容，语言要像人话，不要AI官腔。格式：先概括文档类型和目的，再列出3-5个核心观点（每个1-2句），最后给整体结论。',
  examMode: '你是学习辅导专家，帮助学生理解知识结构。基于文档内容提取学习重点，返回JSON：{"keyPoints":["学习重点"最多8个],"mustKnow":[{"topic":"主题","importance":"core|key|extend","explanation":"说明"}],"highFrequencyTopics":["常见考点"最多5个],"predictedQuestions":["思考题"最多5个]}。importance含义：core=核心概念(必须理解), key=关键问题(值得掌握), extend=延伸知识(拓宽视野)。如果是学术内容则生成，否则返回null。',
  workFocus: '你是工作效率专家。提取工作重点，返回JSON：{"keyTasks":[""最多6个],"risks":[""最多4个],"deadlines":[""最多4个],"actionItems":[""最多5个],"stakeholders":[""最多3个]}。如果是工作文档则生成，学术内容返回null。',
  plainLanguage: '你是"人话翻译器"。把复杂内容翻译成大白话，用"作者真正想说的是："开头，像朋友在给你讲解。',
  speedRead: '你是速读提炼专家。生成"5分钟速读版"，极简要点列表，最多15个要点，每个不超过2行，适合快速扫读。',
  keywords: '你是文本分析专家。提取15-20个最重要关键词，返回JSON：{"keywords":[{"word":"词","count":数字,"category":"concept|term|person|organization"}]}。',
  flashCards: '你是记忆卡片专家。生成8-12张背诵卡片，返回JSON：{"cards":[{"id":"1","question":"问题","answer":"答案","topic":"知识点"}]}。',
  lateNight: '你是学习辅导专家。生成"熬夜复习版总结"，极度压缩，提取3-5个最核心的知识点，用⭐标记最重要的1-2个，开头结尾用鼓励语气。帮助用户在短时间内梳理关键内容。',
};

async function callAI(
  config: AIConfig,
  type: string,
  context: string,
  content?: ParsedContent
): Promise<unknown> {
  const systemPrompt = PROMPTS[type] || PROMPTS.summary;

  // Special handling for exam/work mode detection
  let userPrompt = context.slice(0, 6000);
  if (type === 'examMode' && content) {
    const isAcademic = detectAcademic(content);
    if (!isAcademic) return null;
  }
  if (type === 'workFocus' && content) {
    const isAcademic = detectAcademic(content);
    if (isAcademic) return null;
  }

  const isJsonMode = ['examMode', 'workFocus', 'keywords', 'flashCards'].includes(type);

  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: isJsonMode ? 0.2 : 0.5,
    max_tokens: isJsonMode ? 1500 : 1200,
  };

  if (isJsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const rawContent = data.choices?.[0]?.message?.content || '';

  if (isJsonMode) {
    try {
      const parsed = JSON.parse(rawContent);
      switch (type) {
        case 'keywords':
          return (parsed.keywords || []).slice(0, 20);
        case 'flashCards':
          return (parsed.cards || []).slice(0, 12);
        case 'examMode':
          return {
            keyPoints: parsed.keyPoints || [],
            mustKnow: parsed.mustKnow || [],
            highFrequencyTopics: parsed.highFrequencyTopics || [],
            predictedQuestions: parsed.predictedQuestions || [],
          };
        case 'workFocus':
          return {
            keyTasks: parsed.keyTasks || [],
            risks: parsed.risks || [],
            deadlines: parsed.deadlines || [],
            actionItems: parsed.actionItems || [],
            stakeholders: parsed.stakeholders || [],
          };
      }
    } catch {
      return type === 'keywords' ? [] : null;
    }
  }

  return rawContent;
}

function detectAcademic(content: ParsedContent): boolean {
  const patterns = /参考文献|摘要|关键词|绪论|研究|实验|理论|学术|论文|教材|考试|定义|概念|公式|定理|课程|章节|习题|abstract|introduction|method|result|conclusion|discussion/i;
  const textSample = content.text.slice(0, 5000);
  const matches = textSample.match(new RegExp(patterns, 'gi'));
  return (matches?.length || 0) >= 3;
}
