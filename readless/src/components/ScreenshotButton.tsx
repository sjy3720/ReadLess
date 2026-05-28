'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, Loader2 } from 'lucide-react';

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  fileName?: string;
}

export default function ScreenshotButton({
  targetRef,
  fileName,
}: ScreenshotButtonProps) {
  const [status, setStatus] = useState<'idle' | 'capturing' | 'done'>('idle');

  const handleScreenshot = useCallback(async () => {
    if (!targetRef.current) return;

    setStatus('capturing');

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#111111',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ReadLess_${fileName || 'summary'}_${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Screenshot failed:', error);
      setStatus('idle');
    }
  }, [targetRef, fileName]);

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleScreenshot}
      disabled={status !== 'idle'}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        status === 'done'
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-[rgba(255,255,255,0.04)] text-[#a1a1aa] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5f5f5]'
      }`}
    >
      {status === 'capturing' ? (
        <Loader2 size={16} className="animate-spin" />
      ) : status === 'done' ? (
        <Check size={16} />
      ) : (
        <Camera size={16} />
      )}
      {status === 'capturing'
        ? '生成中...'
        : status === 'done'
          ? '已保存'
          : '生成截图'}
    </motion.button>
  );
}
