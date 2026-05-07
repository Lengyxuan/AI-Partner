import { EmbeddingGenerator } from '../ai/embeddings';
import { VectorStore } from '../ai/vector-store';

export interface HybridSearchOptions {
  topK?: number;
  alpha?: number;
  similarityThreshold?: number;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
  vectorScore: number;
  keywordScore: number;
}

export class HybridRetriever {
  private topK: number;
  private alpha: number;
  private similarityThreshold: number;
  private embeddingGenerator: EmbeddingGenerator;
  private vectorStore: VectorStore;

  constructor(options: HybridSearchOptions = {}) {
    this.topK = options.topK || parseInt(process.env.RAG_TOP_K || '5');
    this.alpha = options.alpha || parseFloat(process.env.RAG_HYBRID_ALPHA || '0.5');
    this.similarityThreshold =
      options.similarityThreshold || parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.7');
    this.embeddingGenerator = new EmbeddingGenerator();
    this.vectorStore = new VectorStore();
  }

  async retrieve(query: string, partnerId: string): Promise<SearchResult[]> {
    // 并行执行向量检索和关键词检索
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch(query, partnerId),
      this.keywordSearch(query, partnerId),
    ]);

    // 融合结果
    const fusedResults = this.fuseResults(vectorResults, keywordResults);

    // 过滤和排序
    return fusedResults
      .filter((result) => result.score >= this.similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK);
  }

  private async vectorSearch(query: string, partnerId: string): Promise<SearchResult[]> {
    try {
      // 生成查询向量
      const embeddings = await this.embeddingGenerator.generate([query]);
      const queryEmbedding = embeddings[0];

      // 向量检索
      const results = await this.vectorStore.search(queryEmbedding, this.topK * 2, {
        partnerId,
      });

      return results.map((result) => ({
        ...result,
        vectorScore: result.score,
        keywordScore: 0,
      }));
    } catch (error) {
      console.error('向量检索失败:', error);
      return [];
    }
  }

  private async keywordSearch(query: string, partnerId: string): Promise<SearchResult[]> {
    // 简单的关键词匹配实现
    // 在实际生产环境中，可以使用 Elasticsearch、Meilisearch 等搜索引擎
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 1);

    // 这里简化处理，实际应该从数据库中检索
    // 返回空数组作为占位
    return [];
  }

  private fuseResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[]
  ): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();

    // 归一化向量分数
    const maxVectorScore = Math.max(...vectorResults.map((r) => r.vectorScore), 1);

    // 处理向量检索结果
    for (const result of vectorResults) {
      const normalizedScore = result.vectorScore / maxVectorScore;
      resultMap.set(result.id, {
        ...result,
        score: this.alpha * normalizedScore,
      });
    }

    // 归一化关键词分数
    const maxKeywordScore = Math.max(...keywordResults.map((r) => r.keywordScore), 1);

    // 处理关键词检索结果
    for (const result of keywordResults) {
      const normalizedScore = result.keywordScore / maxKeywordScore;
      const existing = resultMap.get(result.id);

      if (existing) {
        // 如果已存在，融合分数
        existing.keywordScore = result.keywordScore;
        existing.score += (1 - this.alpha) * normalizedScore;
      } else {
        // 如果不存在，添加新结果
        resultMap.set(result.id, {
          ...result,
          score: (1 - this.alpha) * normalizedScore,
        });
      }
    }

    return Array.from(resultMap.values());
  }

  // RRF (Reciprocal Rank Fusion) 融合算法
  private rrfFusion(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    k: number = 60
  ): SearchResult[] {
    const scores = new Map<string, { result: SearchResult; score: number }>();

    // 处理向量检索结果
    vectorResults.forEach((result, index) => {
      const rank = index + 1;
      const rrfScore = 1 / (k + rank);
      const existing = scores.get(result.id);

      if (existing) {
        existing.score += this.alpha * rrfScore;
      } else {
        scores.set(result.id, {
          result: { ...result, vectorScore: result.score, keywordScore: 0 },
          score: this.alpha * rrfScore,
        });
      }
    });

    // 处理关键词检索结果
    keywordResults.forEach((result, index) => {
      const rank = index + 1;
      const rrfScore = 1 / (k + rank);
      const existing = scores.get(result.id);

      if (existing) {
        existing.score += (1 - this.alpha) * rrfScore;
        existing.result.keywordScore = result.score;
      } else {
        scores.set(result.id, {
          result: { ...result, vectorScore: 0, keywordScore: result.score },
          score: (1 - this.alpha) * rrfScore,
        });
      }
    });

    return Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .map((item) => ({ ...item.result, score: item.score }));
  }
}
