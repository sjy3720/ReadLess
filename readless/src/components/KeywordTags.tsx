'use client';

import { motion } from 'framer-motion';
import type { Keyword } from '@/types';

interface KeywordTagsProps {
  keywords: Keyword[];
}

const categoryColors: Record<string, string> = {
  concept: 'tag',
  term: 'bg-[rgba(147,197,253,0.08)] border-[rgba(147,197,253,0.15)] text-[#93c5fd]',
  person: 'bg-[rgba(167,139,250,0.08)] border-[rgba(167,139,250,0.15)] text-[#c4b5fd]',
  organization: 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.15)] text-[#fbbf24]',
};

const categoryLabels: Record<string, string> = {
  concept: '概念',
  term: '术语',
  person: '人物',
  organization: '组织',
};

export default function KeywordTags({ keywords }: KeywordTagsProps) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, index) => (
        <motion.span
          key={kw.word}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.04 }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-default ${
            categoryColors[kw.category] || categoryColors.concept
          }`}
          title={`${categoryLabels[kw.category] || '关键词'} · 出现约 ${kw.count} 次`}
        >
          {kw.word}
          <span className="opacity-50 text-[10px]">{kw.count}</span>
        </motion.span>
      ))}
    </div>
  );
}
