import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - 获取单个伴侣详情
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: '伴侣不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error('获取伴侣详情错误:', error);
    return NextResponse.json(
      { error: '获取伴侣详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新伴侣信息
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    // 检查伴侣是否存在
    const existingPartner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: '伴侣不存在' },
        { status: 404 }
      );
    }

    const { name, personality, backstory } = body;

    const updatedPartner = await prisma.partner.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(personality !== undefined && { personality }),
        ...(backstory !== undefined && { backstory }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPartner,
    });
  } catch (error) {
    console.error('更新伴侣错误:', error);
    return NextResponse.json(
      { error: '更新伴侣失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除伴侣
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 检查伴侣是否存在
    const existingPartner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: '伴侣不存在' },
        { status: 404 }
      );
    }

    // 删除伴侣（级联删除相关记录）
    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '伴侣已删除',
    });
  } catch (error) {
    console.error('删除伴侣错误:', error);
    return NextResponse.json(
      { error: '删除伴侣失败' },
      { status: 500 }
    );
  }
}
