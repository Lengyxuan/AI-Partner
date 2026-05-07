// ============================================
// 伴侣 (Partner) 类型定义
// ============================================

export interface Partner {
  id: string;
  name: string;
  avatar: string;
  personality?: string;
  background?: string;
  customPrompt?: string;
  modelType: 'cloud' | 'local';
  modelName?: string;
  voice?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerInput {
  name: string;
  avatar?: string;
  personality?: string;
  background?: string;
  customPrompt?: string;
  modelType?: 'cloud' | 'local';
  modelName?: string;
  voice?: string;
}

export interface UpdatePartnerInput {
  name?: string;
  avatar?: string;
  personality?: string;
  background?: string;
  customPrompt?: string;
  modelType?: 'cloud' | 'local';
  modelName?: string;
  voice?: string;
}

// ============================================
// 消息 (Message) 类型定义
// ============================================

export interface Message {
  id: string;
  partnerId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreateMessageInput {
  partnerId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}

// ============================================
// 知识库 (KnowledgeBase) 类型定义
// ============================================

export interface KnowledgeBase {
  id: string;
  partnerId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunkCount?: number;
  error?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKnowledgeBaseInput {
  partnerId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
}

// ============================================
// 聊天相关类型定义
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatRequest {
  message: string;
  partnerId: string;
  modelType?: 'cloud' | 'local';
  modelName?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: Message;
  };
  error?: string;
}

// ============================================
// RAG 相关类型定义
// ============================================

export interface RetrievalResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
  vectorScore: number;
  keywordScore: number;
}

export interface HybridSearchRequest {
  query: string;
  partnerId: string;
  topK?: number;
  alpha?: number;
}

export interface HybridSearchResponse {
  success: boolean;
  data?: {
    query: string;
    results: RetrievalResult[];
    count: number;
  };
  error?: string;
}

// ============================================
// 文件上传相关类型定义
// ============================================

export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: string;
  };
  error?: string;
}

// ============================================
// API 响应类型定义
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// 用户设置类型定义
// ============================================

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultModelType: 'cloud' | 'local';
  defaultModelName?: string;
  embeddingProvider: 'local' | 'openai' | 'huggingface';
  vectorStoreType: 'pgvector' | 'chroma' | 'pinecone';
}

// ============================================
// 排行榜类型定义
// ============================================

export interface RankingItem {
  id: string;
  name: string;
  avatar: string;
  owner: string;
  messageCount: number;
  bondLevel: number;
  rank: number;
}
