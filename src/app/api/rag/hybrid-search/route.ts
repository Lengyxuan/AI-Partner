import { NextRequest, NextResponse } from 'next/server';
import { HybridRetriever } from '@/lib/rag/hybrid-search';

export async function POST(req: NextRequest) {
  try {
    const { query, partnerId, topK = 5, alpha = 0.5 } = await req.json();

    if (!query || !partnerId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const retriever = new HybridRetriever({
      topK,
      alpha,
    });

    const results = await retriever.retrieve(query, partnerId);

    return NextResponse.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
      },
    });
  } catch (error) {
    console.error('混合检索错误:', error);
    return NextResponse.json(
      { error: '检索失败' },
      { status: 500 }
    );
  }
}
