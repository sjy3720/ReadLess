'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DragDropZone from '@/components/DragDropZone';
import ProgressBar from '@/components/ProgressBar';
import { parseFile } from '@/lib/parser';
import { formatFileSize, getFileTypeFromName, getFileTypeName } from '@/lib/utils';
import type { ParsedContent } from '@/types';

type UploadStage = 'select' | 'parsing' | 'ready' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const [stage, setStage] = useState<UploadStage>('select');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setStage('parsing');
    setProgress(0);
    setError(null);
    abortRef.current = false;

    try {
      const result = await parseFile(selectedFile, (p) => setProgress(p));
      if (abortRef.current) return;

      if (result.success && result.content) {
        setParsedContent(result.content);
        setStage('ready');
        setProgress(100);
        sessionStorage.setItem('readless_parsed', JSON.stringify({
          content: result.content,
          fileName: selectedFile.name,
          fileType: getFileTypeFromName(selectedFile.name),
          fileSize: selectedFile.size,
        }));
      } else {
        setError(result.error || '文件解析失败，请重试');
        setStage('error');
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : '文件读取失败，请检查文件是否损坏');
        setStage('error');
      }
    }
  }, []);

  // Handle pasted text: convert to a TXT file and process
  const handlePasteText = useCallback(async (text: string) => {
    if (!text || text.trim().length < 10) return;

    const textFile = new File([text], 'pasted-text.txt', { type: 'text/plain' });
    setFile(textFile);
    setStage('parsing');
    setProgress(0);
    setError(null);
    abortRef.current = false;

    try {
      const result = await parseFile(textFile, (p) => setProgress(p));
      if (abortRef.current) return;

      if (result.success && result.content) {
        setParsedContent(result.content);
        setStage('ready');
        setProgress(100);
        sessionStorage.setItem('readless_parsed', JSON.stringify({
          content: result.content,
          fileName: '粘贴文本.txt',
          fileType: 'txt',
          fileSize: textFile.size,
        }));
      } else {
        setError(result.error || '文本解析失败');
        setStage('error');
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : '文本处理失败');
        setStage('error');
      }
    }
  }, []);

  const handleStartAnalysis = useCallback(() => {
    if (parsedContent && file) {
      router.push('/result');
    }
  }, [parsedContent, file, router]);

  const handleReset = useCallback(() => {
    abortRef.current = true;
    setFile(null);
    setParsedContent(null);
    setProgress(0);
    setError(null);
    setStage('select');
  }, []);

  const fileType = file ? getFileTypeFromName(file.name) : '';
  const fileTypeName = file ? getFileTypeName(fileType) : '';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors mb-8">
            <ArrowLeft size={16} />返回首页
          </Link>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">上传文件</h1>
            <p className="text-[#a1a1aa]">支持 PDF、Word (.docx/.doc)、WPS、TXT、Markdown，最大 2GB</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {stage === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DragDropZone onFileSelect={handleFileSelect} onPasteText={handlePasteText} />
              </motion.div>
            )}

            {stage === 'parsing' && file && (
              <motion.div key="parsing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card space-y-4">
                <ProgressBar progress={progress} status={progress < 50 ? 'uploading' : 'parsing'} fileName={file.name}
                  statusText={progress < 50 ? '正在读取文件...' : '正在解析内容...'} />
                <button onClick={handleReset} className="text-sm text-[#71717a] hover:text-[#a1a1aa] transition-colors">取消</button>
              </motion.div>
            )}

            {stage === 'ready' && file && parsedContent && (
              <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[rgba(246,216,120,0.1)] flex items-center justify-center shrink-0">
                        <FileText size={22} className="text-[#f6d878]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#f5f5f5] mb-1 break-all">{file.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-[#71717a]">
                          <span>{fileTypeName}</span>
                          <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                          <span>{formatFileSize(file.size)}</span>
                          <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                          <span>{parsedContent.wordCount.toLocaleString('zh-CN')} 词</span>
                        </div>
                        {parsedContent.structure.headings.length > 0 && (
                          <p className="text-xs text-[#71717a] mt-2">检测到 {parsedContent.structure.headings.length} 个章节标题</p>
                        )}
                      </div>
                    </div>
                    <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                      <X size={18} className="text-[#71717a]" />
                    </button>
                  </div>
                </div>
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  onClick={handleStartAnalysis} className="btn-accent w-full flex items-center justify-center gap-2 py-4 text-lg">
                  <Sparkles size={20} />开始 AI 分析
                </motion.button>
                <p className="text-center text-xs text-[#71717a]">分析将调用 AI 模型处理你的文件内容</p>
              </motion.div>
            )}

            {stage === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="card text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(239,68,68,0.08)] flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">文件解析失败</h3>
                <p className="text-sm text-[#a1a1aa] mb-6 max-w-md mx-auto">
                  {error || '文件无法解析，请确认文件格式是否正确、未加密、且包含可提取的文字内容。'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={handleReset} className="btn-accent">重新上传</button>
                  <Link href="/" className="text-sm text-[#71717a] hover:text-[#a1a1aa] transition-colors">返回首页</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
