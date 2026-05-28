'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  status: 'uploading' | 'parsing' | 'done' | 'error';
  fileName?: string;
  statusText?: string;
}

const statusConfig = {
  uploading: {
    icon: Loader2,
    text: '上传中...',
    color: 'text-[#f6d878]',
  },
  parsing: {
    icon: Loader2,
    text: '解析文件中...',
    color: 'text-[#f6d878]',
  },
  done: {
    icon: CheckCircle2,
    text: '就绪',
    color: 'text-green-400',
  },
  error: {
    icon: CheckCircle2,
    text: '出错',
    color: 'text-red-400',
  },
};

export default function ProgressBar({
  progress,
  status,
  fileName,
  statusText,
}: ProgressBarProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {fileName && (
        <p className="text-sm text-[#f5f5f5] font-medium mb-2 truncate">
          {fileName}
        </p>
      )}

      <div className="flex items-center gap-3 mb-2">
        <Icon
          size={16}
          className={`${config.color} ${status !== 'done' && status !== 'error' ? 'animate-spin' : ''}`}
        />
        <span className="text-sm text-[#a1a1aa]">
          {statusText || config.text}
        </span>
        <span className="text-xs text-[#71717a] ml-auto">{Math.round(progress)}%</span>
      </div>

      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
