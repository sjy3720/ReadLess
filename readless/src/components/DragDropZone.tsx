'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, AlertCircle, ClipboardPaste,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
  onPasteText?: (text: string) => void;
  disabled?: boolean;
}

// Full mobile accept types covering WeChat/WPS/QQ/File managers (images temporarily disabled for OCR 2.0)
const MOBILE_ACCEPT = [
  '.pdf',
  '.docx', '.doc',
  '.wps',
  '.pptx', '.ppt',
  '.txt',
  '.md', '.markdown',
  '.xlsx', '.xls',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/plain',
  'text/markdown',
].join(',');

const ALLOWED_EXTENSIONS = [
  '.pdf', '.docx', '.doc', '.wps',
  '.pptx', '.ppt',
  '.txt', '.md', '.markdown',
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.heic', '.heif'];

export default function DragDropZone({ onFileSelect, onPasteText, disabled }: DragDropZoneProps) {
  const { isMobile } = useMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [hasClipboardText, setHasClipboardText] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB

  const validateFile = useCallback((file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) {
      setError('图片识别功能正在升级中，推荐上传 PDF / Word 获得最佳体验');
      return false;
    }
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`不支持的文件格式: ${ext}`);
      return false;
    }
    if (file.size > maxSize) {
      setError('文件大小超过 2GB 限制');
      return false;
    }
    if (file.size === 0) {
      setError('文件为空');
      return false;
    }
    setError(null);
    return true;
  }, [maxSize]);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const triggerFileInput = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
    if (inputRef.current) inputRef.current.value = '';
  }, [handleFile]);

  // ---- Desktop drag-and-drop handlers ----
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  }, [handleFile, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  }, []);

  // ---- Paste handler — fills textarea, doesn't auto-submit ----
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || !showPasteArea) return;
      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim().length >= 10) {
        e.preventDefault();
        setPastedText(text.trim());
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, showPasteArea]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedText(e.target.value);
  }, []);

  const handleQuickImport = useCallback(async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length >= 10) {
          setPastedText(text.trim());
          setHasClipboardText(false);
        }
      }
    } catch { /* clipboard not readable */ }
  }, []);

  const handlePasteSubmit = useCallback(() => {
    if (onPasteText && pastedText.trim().length >= 10) {
      onPasteText(pastedText.trim());
    }
  }, [onPasteText, pastedText]);

  const handleClosePaste = useCallback(() => {
    setShowPasteArea(false);
    setPastedText('');
  }, []);

  // ---- Clipboard auto-detection ----
  useEffect(() => {
    if (!onPasteText) return;
    const detect = async () => {
      try {
        if (navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          setHasClipboardText(!!(text && text.trim().length >= 10));
        }
      } catch {
        setHasClipboardText(false);
      }
    };
    detect();
  }, [onPasteText]);

  // ========================
  // MOBILE LAYOUT — Two cards: Upload File + Paste Text
  // ========================
  if (isMobile) {
    const hasContent = pastedText.trim().length >= 10;
    const wordCount = pastedText.replace(/\s/g, '').length;

    return (
      <div className="w-full space-y-4">
        {/* 1. Upload File — main entry */}
        {!showPasteArea && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={triggerFileInput}
            className="card p-5 cursor-pointer w-full flex items-center gap-4 hover:border-[rgba(246,216,120,0.2)] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[rgba(246,216,120,0.1)] flex items-center justify-center shrink-0">
              <Upload size={22} className="text-[#f6d878]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#f5f5f5]">上传文件</p>
              <p className="text-xs text-[#71717a] mt-0.5">
                支持 PDF / Word / WPS / TXT / Markdown
              </p>
            </div>
          </motion.button>
        )}

        {/* 2. Paste Text */}
        <AnimatePresence mode="wait">
          {!showPasteArea ? (
            // Collapsed card
            <motion.button
              key="paste-card"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!onPasteText) return;
                setShowPasteArea(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className={cn(
                'card p-5 cursor-pointer w-full flex items-center gap-4 transition-all',
                'hover:border-[rgba(246,216,120,0.2)]'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center shrink-0">
                <ClipboardPaste size={22} className="text-[#a1a1aa]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-[#f5f5f5]">粘贴文本</p>
                <p className="text-xs text-[#71717a] mt-0.5">
                  从微信 / 网页复制文本后直接粘贴
                </p>
              </div>
              {hasClipboardText && (
                <span className="text-xs px-2 py-1 rounded-full bg-[rgba(246,216,120,0.1)] text-[#f6d878] shrink-0">
                  可导入
                </span>
              )}
            </motion.button>
          ) : (
            // Expanded: textarea + hints + CTA
            <motion.div
              key="paste-expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-4 space-y-3 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#f5f5f5]">粘贴文本</p>
                <button onClick={handleClosePaste} className="text-xs text-[#71717a] hover:text-[#a1a1aa]">
                  收起
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={pastedText}
                onChange={handleTextChange}
                placeholder="在这里粘贴文本..."
                rows={6}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-sm text-[#f5f5f5] placeholder:text-[#52525b] resize-none focus:outline-none focus:border-[rgba(246,216,120,0.3)] transition-colors"
              />

              {hasContent ? (
                // Content pasted — show stats + CTA
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="px-2 py-1 rounded-full bg-[rgba(34,197,94,0.1)] text-green-400">
                      已导入 {wordCount.toLocaleString('zh-CN')} 字
                    </span>
                    <span className="text-[#71717a]">
                      {pastedText.split('\n').filter(Boolean).length} 个段落
                    </span>
                  </motion.div>

                  {/* Content preview */}
                  <div className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 max-h-24 overflow-hidden relative">
                    <p className="text-xs text-[#a1a1aa] leading-relaxed whitespace-pre-wrap break-all">
                      {pastedText.slice(0, 200)}
                      {pastedText.length > 200 && '...'}
                    </p>
                    {pastedText.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[rgba(17,17,17,0.9)] to-transparent" />
                    )}
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePasteSubmit}
                    className="btn-accent w-full flex items-center justify-center gap-2 py-3 text-base"
                  >
                    开始 AI 分析
                  </motion.button>
                </div>
              ) : (
                // No content yet — show hints + quick import
                <div className="space-y-3">
                  {hasClipboardText && (
                    <motion.button
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleQuickImport}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgba(246,216,120,0.08)] border border-[rgba(246,216,120,0.15)] text-sm text-[#f6d878] hover:bg-[rgba(246,216,120,0.12)] transition-colors"
                    >
                      检测到剪贴板内容，点击一键导入
                    </motion.button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {['微信文章', 'GPT 内容', '网页内容', '学习笔记'].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[#71717a]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#52525b]">
                    长按文本框选择「粘贴」，或从键盘粘贴
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload file card reappears when paste is expanded */}
        {showPasteArea && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerFileInput}
            className="card p-4 cursor-pointer w-full flex items-center gap-3 hover:border-[rgba(246,216,120,0.2)] transition-all"
          >
            <Upload size={18} className="text-[#71717a]" />
            <span className="text-sm text-[#a1a1aa]">或者上传文件</span>
          </motion.button>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={MOBILE_ACCEPT}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]"
            >
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ========================
  // DESKTOP LAYOUT (unchanged)
  // ========================
  return (
    <div className="w-full">
      <motion.div
        whileHover={{ borderColor: 'rgba(246,216,120,0.3)' }}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300',
          isDragging
            ? 'border-[#f6d878] bg-[rgba(246,216,120,0.04)]'
            : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <input
          ref={inputRef}
          type="file"
          accept={MOBILE_ACCEPT}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[rgba(246,216,120,0.1)] flex items-center justify-center">
                <FileText size={28} className="text-[#f6d878]" />
              </div>
              <p className="text-lg text-[#f6d878] font-medium">松开即可上传</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center"
              >
                <Upload size={28} className="text-[#a1a1aa]" />
              </motion.div>
              <div>
                <p className="text-base text-[#f5f5f5] font-medium mb-1">
                  拖拽文件到此处，或点击上传
                </p>
                <p className="text-sm text-[#71717a]">
                  支持 PDF、Word (.docx/.doc)、WPS、PPTX、TXT、Markdown
                </p>
                <p className="text-xs text-[#71717a] mt-1">单文件最大 2GB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Desktop paste area */}
      {onPasteText && (
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              setShowPasteArea(!showPasteArea);
              setPastedText('');
            }}
            className={cn(
              'text-xs transition-colors',
              showPasteArea ? 'text-[#f6d878]' : 'text-[#71717a] hover:text-[#a1a1aa]'
            )}
          >
            {showPasteArea ? '收起' : '或直接粘贴文本 (Ctrl+V)'}
          </button>
        </div>
      )}

      {/* Desktop paste textarea */}
      <AnimatePresence>
        {showPasteArea && onPasteText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 card p-4 space-y-3 overflow-hidden"
          >
            <textarea
              value={pastedText}
              onChange={handleTextChange}
              placeholder="在这里粘贴文本，或使用 Ctrl+V..."
              rows={5}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-sm text-[#f5f5f5] placeholder:text-[#52525b] resize-none focus:outline-none focus:border-[rgba(246,216,120,0.3)] transition-colors"
            />
            {pastedText.trim().length >= 10 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <p className="text-xs text-green-400">
                  已导入 {pastedText.replace(/\s/g, '').length.toLocaleString('zh-CN')} 字
                </p>
                <button onClick={handlePasteSubmit} className="btn-accent w-full py-2.5 text-sm">
                  开始 AI 分析
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]"
          >
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
