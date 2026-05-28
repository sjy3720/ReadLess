'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingSpinner({
  message = 'AI 正在分析你的文件...',
  subMessage = '这可能需要几秒钟',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="mb-8"
      >
        <BookOpen size={40} className="text-[#f6d878]" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium text-[#f5f5f5] mb-2"
      >
        {message}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-[#71717a]"
      >
        {subMessage}
      </motion.p>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#f6d878]"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
