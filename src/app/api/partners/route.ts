import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 获取所有伴侣列表
export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: partners,
    });
  } catch (error) {
    console.error('获取伴侣列表错误:', error);
    return NextResponse.json(
      { error: '获取伴侣列表失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// POST - 创建新伴侣
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, personality, backstory } = body;

    // 验证必填字段
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '伴侣名称不能为空' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name: name.trim(),
        personality: personality || '',
        backstory: backstory || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error('创建伴侣错误:', error);
    return NextResponse.json(
      { error: '创建伴侣失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
