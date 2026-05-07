import { pipeline, PipelineType } from '@xenova/transformers';

export type EmbeddingProvider = 'local' | 'openai' | 'huggingface';

interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model?: string;
  apiKey?: string;
}

export class EmbeddingGenerator {
  private config: EmbeddingConfig;
  private pipeline: any = null;

  constructor(config?: EmbeddingConfig) {
    this.config = {
      provider: (process.env.EMBEDDING_PROVIDER as EmbeddingProvider) || 'local',
      model: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
      ...config,
    };
  }

  async generate(texts: string[]): Promise<number[][]> {
    switch (this.config.provider) {
      case 'local':
        return this.generateLocal(texts);
      case 'openai':
        return this.generateOpenAI(texts);
      case 'huggingface':
        return this.generateHuggingFace(texts);
      default:
        throw new Error(`不支持的嵌入提供商: ${this.config.provider}`);
    }
  }

  private async generateLocal(texts: string[]): Promise<number[][]> {
    if (!this.pipeline) {
      this.pipeline = await pipeline(
        'feature-extraction' as PipelineType,
        this.config.model
      );
    }

    const embeddings: number[][] = [];
    for (const text of texts) {
      const output = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true,
      });
      embeddings.push(Array.from(output.data));
    }

    return embeddings;
  }

  private async generateOpenAI(texts: string[]): Promise<number[][]> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API Key 未设置');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'text-embedding-ada-002',
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 错误: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  private async generateHuggingFace(texts: string[]): Promise<number[][]> {
    const apiKey = this.config.apiKey || process.env.HUGGINGFACE_TOKEN;
    if (!apiKey) {
      throw new Error('HuggingFace Token 未设置');
    }

    const model = this.config.model || 'sentence-transformers/all-MiniLM-L6-v2';
    const response = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ inputs: texts }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API 错误: ${response.statusText}`);
    }

    return await response.json();
  }
}
