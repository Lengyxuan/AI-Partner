import { NextRequest, NextResponse } from 'next/server';
import { DocumentLoader } from '@/lib/rag/document-loader';
import { TextSplitter } from '@/lib/rag/text-splitter';
import { EmbeddingGenerator } from '@/lib/ai/embeddings';
import { VectorStore } from '@/lib/ai/vector-store';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { knowledgeBaseId } = await req.json();

    if (!knowledgeBaseId) {
      return NextResponse.json(
        { error: '缺少知识库ID' },
        { status: 400 }
      );
    }

    // 获取知识库记录
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeBaseId },
    });

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: '知识库记录不存在' },
        { status: 404 }
      );
    }

    // 更新状态为处理中
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: { status: 'processing' },
    });

    try {
      // 1. 加载文档
      const filePath = join(process.cwd(), 'public', knowledgeBase.filePath);
      const documentLoader = new DocumentLoader();
      const documents = await documentLoader.load(filePath, knowledgeBase.fileType);

      // 2. 文本分割
      const textSplitter = new TextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await textSplitter.split(documents);

      // 3. 生成嵌入向量
      const embeddingGenerator = new EmbeddingGenerator();
      const embeddings = await embeddingGenerator.generate(
        chunks.map((chunk) => chunk.content)
      );

      // 4. 存储到向量数据库
      const vectorStore = new VectorStore();
      await vectorStore.upsert(
        chunks.map((chunk, index) => ({
          id: `${knowledgeBaseId}-${index}`,
          content: chunk.content,
          embedding: embeddings[index],
          metadata: {
            knowledgeBaseId,
            partnerId: knowledgeBase.partnerId,
            fileName: knowledgeBase.fileName,
            chunkIndex: index,
          },
        }))
      );

      // 更新状态为完成
      await prisma.knowledgeBase.update({
        where: { id: knowledgeBaseId },
        data: {
          status: 'completed',
          chunkCount: chunks.length,
          processedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          knowledgeBaseId,
          chunkCount: chunks.length,
          status: 'completed',
        },
      });
    } catch (error) {
      // 更新状态为失败
      await prisma.knowledgeBase.update({
        where: { id: knowledgeBaseId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误',
        },
      });
      throw error;
    }
  } catch (error) {
    console.error('向量化处理错误:', error);
    return NextResponse.json(
      { error: '向量化处理失败' },
      { status: 500 }
    );
  }
}

import { join } from 'path';
