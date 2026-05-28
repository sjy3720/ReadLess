// ==========================================
// ReadLess - Core Type Definitions
// ==========================================

/** Supported file types */
export type SupportedFileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'markdown' | 'wps';

/** File upload state */
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

/** File parse result */
export interface ParsedContent {
  text: string;
  pageCount?: number;
  wordCount: number;
  charCount: number;
  structure: DocumentStructure;
  chunks: TextChunk[];
}

/** Document structure */
export interface DocumentStructure {
  title: string;
  headings: HeadingItem[];
  paragraphs: number;
  hasTableOfContents: boolean;
}

/** Heading item */
export interface HeadingItem {
  level: number;
  text: string;
  position: number;
}

/** Text chunk for AI processing */
export interface TextChunk {
  index: number;
  text: string;
  charCount: number;
  estimatedTokens: number;
  heading?: string;
}

/** AI Analysis result */
export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  wordCount: number;
  summary: string;
  examMode: ExamMode | null;
  workFocus: WorkFocus | null;
  plainLanguage: string;
  speedRead: string;
  keywords: Keyword[];
  flashCards: FlashCard[];
  lateNight: string;
  processingTime: number;
  createdAt: string;
}

/** Exam mode result */
export interface ExamMode {
  keyPoints: string[];
  mustKnow: MustKnowItem[];
  highFrequencyTopics: string[];
  predictedQuestions: string[];
}

/** Must-know item */
export interface MustKnowItem {
  topic: string;
  importance: 'core' | 'key' | 'extend';
  explanation: string;
}

/** Work focus result */
export interface WorkFocus {
  keyTasks: string[];
  risks: string[];
  deadlines: string[];
  actionItems: string[];
  stakeholders: string[];
}

/** Keyword */
export interface Keyword {
  word: string;
  count: number;
  category: 'concept' | 'term' | 'person' | 'organization';
}

/** Flash card */
export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

/** Membership tier */
export type MembershipTier = 'free' | 'monthly' | 'quarterly' | 'yearly';

/** User membership info */
export interface Membership {
  tier: MembershipTier;
  remainingTrials: number;
  totalUsed: number;
  expiresAt: string | null;
}

/** Pricing plan */
export interface PricingPlan {
  id: MembershipTier;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

/** API error response */
export interface APIError {
  code: string;
  message: string;
  details?: string;
}
