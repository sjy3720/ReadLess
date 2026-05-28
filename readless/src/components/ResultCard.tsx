'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export default function ResultCard({
  title,
  icon,
  children,
  className,
  delay = 0,
  id,
}: ResultCardProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('card', className)}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-[rgba(246,216,120,0.1)] flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-[#f5f5f5]">{title}</h2>
      </div>
      <div className="text-[#a1a1aa] leading-relaxed">{children}</div>
    </motion.section>
  );
}
