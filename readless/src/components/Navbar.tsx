'use client';

import Link from 'next/link';
import { BookOpen, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BookOpen
            size={22}
            className="text-[#f6d878] group-hover:scale-105 transition-transform"
          />
          <span className="text-lg font-semibold tracking-tight text-[#f5f5f5]">
            ReadLess
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/upload"
            className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
          >
            上传文件
          </Link>
          <Link
            href="/?pricing=true"
            className="flex items-center gap-1.5 text-sm text-[#f6d878] hover:text-[#f8e08a] transition-colors"
          >
            <Crown size={14} />
            <span className="hidden sm:inline">会员</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
