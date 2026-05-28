'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Upload,
  FileText,
  Sparkles,
  Zap,
  MessageCircle,
  BookOpen,
  FileCheck,
  Clock,
  Crown,
  Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { PricingPlan } from '@/types';

// ---- Pricing Data ----
const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: '免费体验',
    price: 0,
    period: '',
    description: '新用户前 2 次免费',
    features: ['2 次免费分析', '支持所有文件格式', 'AI 总结 + 关键词'],
    highlighted: false,
  },
  {
    id: 'monthly',
    name: '月会员',
    price: 29.9,
    period: '/月',
    description: '适合考试周集中使用',
    features: [
      '无限次分析',
      '全部 AI 功能',
      '背诵卡片导出',
      '截图分享',
      '优先处理队列',
    ],
    highlighted: true,
  },
  {
    id: 'quarterly',
    name: '季度会员',
    price: 79.9,
    originalPrice: 89.7,
    period: '/季',
    description: '适合整个学期使用',
    features: [
      '月会员全部权益',
      '更长有效期',
      '专属客服通道',
    ],
    highlighted: false,
  },
  {
    id: 'yearly',
    name: '年会员',
    price: 199.9,
    originalPrice: 358.8,
    period: '/年',
    description: '适合长期深度使用',
    features: [
      '季度会员全部权益',
      '最低日均成本',
      '新功能优先体验',
    ],
    highlighted: false,
  },
];

// ---- Feature Cards Data ----
const features = [
  {
    icon: FileText,
    title: 'AI 全文总结',
    description: '自动提炼核心观点，说人话，不官腔',
  },
  {
    icon: BookOpen,
    title: '考试周模式',
    description: '提炼学习重点、生成背诵卡片、熬夜复习版',
  },
  {
    icon: Zap,
    title: '5 分钟速读',
    description: '极简版总结，适合临时抱佛脚',
  },
  {
    icon: MessageCircle,
    title: '人话翻译',
    description: '复杂内容翻译成大白话，作者真正想说的是',
  },
  {
    icon: FileCheck,
    title: '多格式支持',
    description: 'PDF、Word、WPS、TXT、Markdown',
  },
  {
    icon: Clock,
    title: '超大文件',
    description: '支持 2GB 文件，流式上传，不卡顿',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [showPricing, setShowPricing] = useState(false);

  const handleUpload = useCallback(() => {
    router.push('/upload');
  }, [router]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ---- Hero Section ---- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#f6d878] opacity-[0.02] rounded-full blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-3xl text-center relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] mb-8"
          >
            <Sparkles size={14} className="text-[#f6d878]" />
            <span className="text-sm text-[#a1a1aa]">AI 文件阅读总结工具</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f5f5f5] mb-6"
          >
            ReadLess
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-xl sm:text-2xl text-[#a1a1aa] mb-4 leading-relaxed"
          >
            少读一点，也能度过考试周和工作日。
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-[#71717a] max-w-lg mx-auto mb-12 leading-relaxed"
          >
            凌晨一点，还有很多资料没看。
            <br />
            但至少这个网站，能帮你轻松一点。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={handleUpload} className="btn-accent flex items-center gap-2">
              <Upload size={18} />
              上传文件
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="btn-secondary flex items-center gap-2"
            >
              <Crown size={18} />
              查看会员
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center justify-center gap-8 mt-16 text-sm text-[#71717a]"
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-[#f5f5f5]">PDF</div>
              <div>+ Word</div>
            </div>
            <div className="w-px h-8 bg-[rgba(255,255,255,0.08)]" />
            <div className="text-center">
              <div className="text-lg font-semibold text-[#f5f5f5]">2GB</div>
              <div>大文件</div>
            </div>
            <div className="w-px h-8 bg-[rgba(255,255,255,0.08)]" />
            <div className="text-center">
              <div className="text-lg font-semibold text-[#f5f5f5]">9</div>
              <div>种 AI 分析</div>
            </div>
          </motion.div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-[10%] hidden lg:block opacity-20"
        >
          <FileText size={24} className="text-[#f6d878]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/3 right-[12%] hidden lg:block opacity-15"
        >
          <BookOpen size={20} className="text-[#f6d878]" />
        </motion.div>
      </section>

      {/* ---- Features Grid ---- */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-[#f5f5f5] mb-3">
              不只是总结
            </h2>
            <p className="text-[#a1a1aa]">
              9 种 AI 分析，覆盖学习与工作的每个场景
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="card group cursor-default"
              >
                <feature.icon
                  size={28}
                  className="text-[#f6d878] mb-4 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-base font-semibold text-[#f5f5f5] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Pricing Section ---- */}
      {showPricing && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="py-16 px-6 border-t border-[rgba(255,255,255,0.06)]"
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#f5f5f5] mb-3">
                简单定价
              </h2>
              <p className="text-[#a1a1aa]">
                新用户前 2 次免费，无需绑定支付方式
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`card relative ${
                    plan.highlighted
                      ? 'border-[rgba(246,216,120,0.2)] bg-[rgba(246,216,120,0.03)]'
                      : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#f6d878] text-[#111] text-xs font-semibold">
                      推荐
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-[#f5f5f5] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#71717a] mb-4">{plan.description}</p>

                  <div className="mb-5">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-[#f5f5f5]">
                        免费
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-[#a1a1aa]">¥</span>
                        <span className="text-3xl font-bold text-[#f5f5f5]">
                          {plan.price}
                        </span>
                        <span className="text-sm text-[#71717a]">
                          {plan.period}
                        </span>
                      </div>
                    )}
                    {plan.originalPrice && (
                      <p className="text-xs text-[#71717a] line-through mt-1">
                        ¥{plan.originalPrice}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm text-[#a1a1aa]"
                      >
                        <Check
                          size={14}
                          className="text-[#f6d878] mt-0.5 shrink-0"
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ---- Bottom CTA ---- */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center card py-16"
        >
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-3">
            准备好少读一点了吗？
          </h2>
          <p className="text-[#a1a1aa] mb-8">
            上传你的文件，让 AI 帮你读完。
          </p>
          <button onClick={handleUpload} className="btn-accent inline-flex items-center gap-2">
            <Upload size={18} />
            开始使用
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
