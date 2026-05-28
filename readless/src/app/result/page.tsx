'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, BookOpen, Zap, MessageCircle,
  Tag, Layers, Moon, Briefcase, AlertTriangle,
  Calendar, CheckCircle2, RotateCcw, Copy, Check, AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResultCard from '@/components/ResultCard';
import KeywordTags from '@/components/KeywordTags';
import FlashCards from '@/components/FlashCards';
import ScreenshotButton from '@/components/ScreenshotButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatFileSize, getFileTypeName } from '@/lib/utils';
import type { AnalysisResult, ParsedContent } from '@/types';

export default function ResultPage() {
  const screenshotRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('AI 正在分析你的文件...');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => { analyzeDocument(); }, []);

  const analyzeDocument = async () => {
    try {
      const stored = sessionStorage.getItem('readless_parsed');
      if (!stored) {
        setError('未找到文件内容，请先上传文件。');
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      const content: ParsedContent = parsed.content;
      const fileName: string = parsed.fileName;
      const fileType: string = parsed.fileType;
      const fileSize: number = parsed.fileSize;

      const messages = [
        '正在读取文件结构...',
        '正在提取关键章节...',
        '正在生成全文总结...',
        '正在提炼考试重点...',
        '正在制作背诵卡片...',
        '正在优化阅读体验...',
      ];
      let msgIndex = 0;
      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setLoadingMessage(messages[msgIndex]);
      }, 2500);

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, fileName, fileType, fileSize }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `AI 服务返回错误 (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
      clearInterval(msgInterval);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'AI 分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  }, []);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20 px-6">
          <div className="mx-auto max-w-2xl">
            <LoadingSpinner message={loadingMessage} subMessage="AI 正在逐章节分析，大文件可能需要 30-60 秒" />
          </div>
        </main>
      </div>
    );
  }

  // ---- Error ----
  if (error || !result) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg text-center card py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-[rgba(239,68,68,0.08)] flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-[#f5f5f5] mb-2">AI 分析失败</h2>
            <p className="text-sm text-[#a1a1aa] mb-8 max-w-md mx-auto">
              {error || 'AI 服务暂不可用，请稍后重试。'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/upload" className="btn-accent flex items-center gap-2">
                <RotateCcw size={16} />
                重新上传
              </Link>
              <Link href="/" className="btn-secondary">返回首页</Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ---- Success ----
  const isAcademic = !!result.examMode;
  const isWorkDoc = !!result.workFocus;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <Link href="/upload" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors">
              <ArrowLeft size={16} />重新上传
            </Link>
            <ScreenshotButton targetRef={screenshotRef} fileName={result.fileName} />
          </div>

          <div ref={screenshotRef}>
            {/* File Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(246,216,120,0.1)] flex items-center justify-center">
                  <FileText size={22} className="text-[#f6d878]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-[#f5f5f5] truncate">{result.fileName}</h1>
                  <div className="flex items-center gap-3 text-sm text-[#71717a] mt-0.5">
                    <span>{getFileTypeName(result.fileType)}</span>
                    <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                    <span>{formatFileSize(result.fileSize)}</span>
                    <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                    <span>{result.wordCount.toLocaleString('zh-CN')} 词</span>
                    <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                    <span>耗时 {result.processingTime}s</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Summary */}
            <ResultCard id="summary" title="AI 全文总结" icon={<BookOpen size={18} className="text-[#f6d878]" />} delay={0.05}>
              <MarkdownRenderer content={result.summary} />
              <CopySection text={result.summary} section="summary" copied={copiedSection} onCopy={handleCopy} />
            </ResultCard>

            {/* Exam Mode */}
            {isAcademic && result.examMode && (
              <ResultCard id="exam" title="考试周模式" icon={<BookOpen size={18} className="text-[#f6d878]" />} delay={0.1}>
                <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">学习重点</h3>
                <ul className="space-y-2.5 mb-6">
                  {result.examMode.keyPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-md bg-[rgba(246,216,120,0.1)] text-[#f6d878] text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-[#a1a1aa]">{p}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">推荐掌握</h3>
                <div className="space-y-3 mb-6">
                  {result.examMode.mustKnow.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          item.importance === 'core' ? 'bg-amber-500/10 text-amber-400' :
                          item.importance === 'key' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {item.importance === 'core' ? '核心概念' : item.importance === 'key' ? '关键问题' : '延伸知识'}
                        </span>
                        <span className="text-sm font-medium text-[#f5f5f5]">{item.topic}</span>
                      </div>
                      <p className="text-sm text-[#a1a1aa]">{item.explanation}</p>
                    </div>
                  ))}
                </div>
                {result.examMode.predictedQuestions.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">思考题</h3>
                    <ul className="space-y-2">
                      {result.examMode.predictedQuestions.map((q, i) => (
                        <li key={i} className="text-sm text-[#a1a1aa] flex items-start gap-2">
                          <span className="text-[#f6d878]">Q{i + 1}.</span>{q}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </ResultCard>
            )}

            {/* Work Focus */}
            {isWorkDoc && result.workFocus && (
              <ResultCard id="work" title="工作重点" icon={<Briefcase size={18} className="text-[#f6d878]" />} delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{
                    title: '关键任务', icon: CheckCircle2, color: 'text-green-400', items: result.workFocus.keyTasks
                  }, {
                    title: '风险点', icon: AlertTriangle, color: 'text-yellow-400', items: result.workFocus.risks
                  }, {
                    title: 'Deadline', icon: Calendar, color: 'text-red-400', items: result.workFocus.deadlines
                  }, {
                    title: '行动建议', icon: Zap, color: 'text-[#f6d878]', items: result.workFocus.actionItems
                  }].map((section) => (
                    <div key={section.title} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-[#f5f5f5] mb-2">
                        <section.icon size={14} className={section.color} />{section.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.items.map((t, i) => <li key={i} className="text-sm text-[#a1a1aa]">{t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Plain Language */}
            <ResultCard id="plain" title="人话翻译" icon={<MessageCircle size={18} className="text-[#f6d878]" />} delay={0.15}>
              <p className="text-[#a1a1aa] leading-relaxed whitespace-pre-wrap">{result.plainLanguage}</p>
              <CopySection text={result.plainLanguage} section="plain" copied={copiedSection} onCopy={handleCopy} />
            </ResultCard>

            {/* Speed Read */}
            <ResultCard id="speed" title="5分钟速读版" icon={<Zap size={18} className="text-[#f6d878]" />} delay={0.2}>
              <MarkdownRenderer content={result.speedRead} />
              <CopySection text={result.speedRead} section="speed" copied={copiedSection} onCopy={handleCopy} />
            </ResultCard>

            {/* Keywords */}
            <ResultCard id="keywords" title="关键词" icon={<Tag size={18} className="text-[#f6d878]" />} delay={0.25}>
              <KeywordTags keywords={result.keywords} />
            </ResultCard>

            {/* Flash Cards */}
            {result.flashCards.length > 0 && (
              <ResultCard id="flashcards" title="背诵卡片" icon={<Layers size={18} className="text-[#f6d878]" />} delay={0.3}>
                <p className="text-sm text-[#71717a] mb-5">点击卡片翻转查看答案，适合手机快速刷题</p>
                <FlashCards cards={result.flashCards} />
              </ResultCard>
            )}

            {/* Late Night */}
            <ResultCard id="latenight" title="熬夜复习版" icon={<Moon size={18} className="text-[#f6d878]" />} delay={0.35}>
              <MarkdownRenderer content={result.lateNight} />
              <CopySection text={result.lateNight} section="late" copied={copiedSection} onCopy={handleCopy} />
            </ResultCard>

            {/* Membership */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-8 card text-center py-10 border-[rgba(246,216,120,0.12)]">
              <p className="text-sm text-[#a1a1aa] mb-1">免费次数已用完？</p>
              <p className="text-lg font-semibold text-[#f5f5f5] mb-4">开通会员，无限次使用</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/?pricing=true" className="btn-accent text-sm px-6 py-2.5">查看会员方案</Link>
                <span className="text-xs text-[#71717a]">¥29.9/月起</span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ---- Copy Helper ----
function CopySection({ text, section, copied, onCopy }: {
  text: string; section: string; copied: string | null;
  onCopy: (text: string, section: string) => void;
}) {
  return (
    <button onClick={() => onCopy(text, section)}
      className="mt-4 flex items-center gap-2 text-xs text-[#71717a] hover:text-[#f5f5f5] transition-colors">
      {copied === section ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      {copied === section ? '已复制' : '复制内容'}
    </button>
  );
}

// ---- Markdown Renderer ----
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { i++; continue; }

    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-semibold text-[#f5f5f5] mt-5 mb-2">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-semibold text-[#f5f5f5] mt-6 mb-3">{trimmed.slice(3)}</h2>);
    } else {
      const processed = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#f5f5f5] font-semibold">$1</strong>');
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<li key={i} className="text-sm text-[#a1a1aa] ml-4 mb-1 list-disc" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />);
      } else {
        elements.push(<p key={i} className="text-sm text-[#a1a1aa] mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />);
      }
    }
    i++;
  }
  return <div>{elements}</div>;
}
