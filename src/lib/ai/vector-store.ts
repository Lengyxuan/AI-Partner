import { ChromaClient } from 'chromadb';
import { Pool } from 'pg';

export type VectorStoreType = 'pgvector' | 'chroma' | 'pinecone';

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export class VectorStore {
  private type: VectorStoreType;
  private pgPool: Pool | null = null;
  private chromaClient: ChromaClient | null = null;
  private chromaCollection: any = null;

  constructor(type?: VectorStoreType) {
    this.type = type || (process.env.VECTOR_STORE_TYPE as VectorStoreType) || 'chroma';
    this.initialize();
  }

  private async initialize() {
    switch (this.type) {
      case 'pgvector':
        await this.initPgVector();
        break;
      case 'chroma':
        await this.initChroma();
        break;
      case 'pinecone':
        // Pinecone 初始化
        break;
    }
  }

  private async initPgVector() {
    this.pgPool = new Pool({
      connectionString: process.env.PGVECTOR_URL,
    });

    // 创建扩展和表
    const client = await this.pgPool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      await client.query(`
        CREATE TABLE IF NOT EXISTS vectors (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          embedding vector(384),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS vectors_embedding_idx 
        ON vectors USING ivfflat (embedding vector_cosine_ops)
      `);
    } finally {
      client.release();
    }
  }

  private async initChroma() {
    this.chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000',
    });

    this.chromaCollection = await this.chromaClient.getOrCreateCollection({
      name: 'aipartner',
      metadata: { description: 'AI Partner Knowledge Base' },
    });
  }

  async upsert(documents: VectorDocument[]): Promise<void> {
    switch (this.type) {
      case 'pgvector':
        await this.upsertPgVector(documents);
        break;
      case 'chroma':
        await this.upsertChroma(documents);
        break;
      case 'pinecone':
        await this.upsertPinecone(documents);
        break;
    }
  }

  private async upsertPgVector(documents: VectorDocument[]): Promise<void> {
    if (!this.pgPool) throw new Error('PgVector 未初始化');

    const client = await this.pgPool.connect();
    try {
      for (const doc of documents) {
        await client.query(
          `INSERT INTO vectors (id, content, embedding, metadata)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
           content = EXCLUDED.content,
           embedding = EXCLUDED.embedding,
           metadata = EXCLUDED.metadata`,
          [doc.id, doc.content, `[${doc.embedding.join(',')}]`, JSON.stringify(doc.metadata)]
        );
      }
    } finally {
      client.release();
    }
  }

  private async upsertChroma(documents: VectorDocument[]): Promise<void> {
    if (!this.chromaCollection) throw new Error('Chroma 未初始化');

    await this.chromaCollection.upsert({
      ids: documents.map((d) => d.id),
      documents: documents.map((d) => d.content),
      embeddings: documents.map((d) => d.embedding),
      metadatas: documents.map((d) => d.metadata),
    });
  }

  private async upsertPinecone(documents: VectorDocument[]): Promise<void> {
    // Pinecone 实现
    throw new Error('Pinecone 实现待完成');
  }

  async search(
    queryEmbedding: number[],
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    switch (this.type) {
      case 'pgvector':
        return this.searchPgVector(queryEmbedding, topK, filter);
      case 'chroma':
        return this.searchChroma(queryEmbedding, topK, filter);
      case 'pinecone':
        return this.searchPinecone(queryEmbedding, topK, filter);
      default:
        throw new Error(`不支持的向量存储类型: ${this.type}`);
    }
  }

  private async searchPgVector(
    queryEmbedding: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.pgPool) throw new Error('PgVector 未初始化');

    const client = await this.pgPool.connect();
    try {
      let query = `
        SELECT id, content, metadata,
               1 - (embedding <=> $1::vector) as score
        FROM vectors
      `;
      const params: any[] = [`[${queryEmbedding.join(',')}]`];

      if (filter && Object.keys(filter).length > 0) {
        const conditions = Object.entries(filter).map(([key, value], index) => {
          params.push(value);
          return `metadata->>'${key}' = $${index + 2}`;
        });
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
      params.push(topK);

      const result = await client.query(query, params);
      return result.rows.map((row) => ({
        id: row.id,
        content: row.content,
        metadata: row.metadata,
        score: row.score,
      }));
    } finally {
      client.release();
    }
  }

  private async searchChroma(
    queryEmbedding: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.chromaCollection) throw new Error('Chroma 未初始化');

    const results = await this.chromaCollection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: filter,
    });

    const searchResults: SearchResult[] = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        searchResults.push({
          id: results.ids[0][i],
          content: results.documents?.[0]?.[i] || '',
          metadata: results.metadatas?.[0]?.[i] || {},
          score: results.distances?.[0]?.[i] || 0,
        });
      }
    }

    return searchResults;
  }

  private async searchPinecone(
    queryEmbedding: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    // Pinecone 实现
    throw new Error('Pinecone 实现待完成');
  }

  async delete(ids: string[]): Promise<void> {
    switch (this.type) {
      case 'pgvector':
        if (!this.pgPool) throw new Error('PgVector 未初始化');
        await this.pgPool.query('DELETE FROM vectors WHERE id = ANY($1)', [ids]);
        break;
      case 'chroma':
        if (!this.chromaCollection) throw new Error('Chroma 未初始化');
        await this.chromaCollection.delete({ ids });
        break;
      case 'pinecone':
        throw new Error('Pinecone 实现待完成');
    }
  }
}
