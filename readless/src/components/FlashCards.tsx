'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import type { FlashCard } from '@/types';

interface FlashCardsProps {
  cards: FlashCard[];
}

export default function FlashCards({ cards }: FlashCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setFlipped(false);
      setCurrentIndex(index);
    },
    []
  );

  const next = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      goTo(currentIndex + 1);
    }
  }, [currentIndex, cards.length, goTo]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }, [currentIndex, goTo]);

  const toggleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  if (!cards || cards.length === 0) return null;

  const card = cards[currentIndex];

  return (
    <div>
      {/* Card */}
      <div
        onClick={toggleFlip}
        className="relative cursor-pointer select-none mb-4"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateX: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full min-h-[180px]"
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-xs text-[#71717a] mb-3 block">
              {card.topic} · 点击翻转查看答案
            </span>
            <p className="text-base font-medium text-[#f5f5f5] leading-relaxed">
              {card.question}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: 'rgba(246,216,120,0.05)',
              border: '1px solid rgba(246,216,120,0.15)',
            }}
          >
            <span className="text-xs text-[#f6d878] mb-3 block">
              答案 · 点击翻转回问题
            </span>
            <p className="text-base text-[#f5f5f5] leading-relaxed">
              {card.answer}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} className="text-[#a1a1aa]" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFlip}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all text-sm text-[#a1a1aa]"
          >
            <RotateCw size={14} />
            翻转
          </button>
          <span className="text-sm text-[#71717a]">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <button
          onClick={next}
          disabled={currentIndex === cards.length - 1}
          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={20} className="text-[#a1a1aa]" />
        </button>
      </div>
    </div>
  );
}
