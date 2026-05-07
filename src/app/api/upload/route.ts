import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const partnerId = formData.get('partnerId') as string;

    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    if (!partnerId) {
      return NextResponse.json(
        { error: '缺少伴侣ID' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小超过50MB限制' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', partnerId);
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // 保存文件信息到数据库
    const { prisma } = await import('@/lib/db/prisma');
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        id: fileId,
        partnerId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `/uploads/${partnerId}/${fileName}`,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: knowledgeBase.id,
        fileName: knowledgeBase.fileName,
        fileType: knowledgeBase.fileType,
        fileSize: knowledgeBase.fileSize,
        status: knowledgeBase.status,
      },
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}
