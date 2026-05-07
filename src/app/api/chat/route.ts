import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// 模拟回复模板
const mockResponses = [
  '你好呀！很高兴见到你~ 😊',
  '我在听呢，请继续说',
  '这真的很有趣！能告诉我更多吗？',
  '我理解你的感受',
  '让我们一起聊聊这个话题吧',
  '你今天过得怎么样？',
  '我一直在想你呢',
  '这是一个很好的问题',
  '我觉得你说得对',
  '谢谢你和我分享这些',
];

// 根据伴侣名字生成个性化回复
function generateMockResponse(partnerName: string, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // 简单的关键词匹配
  if (lowerMessage.includes('你好') || lowerMessage.includes('嗨')) {
    return `你好呀！我是${partnerName}，很高兴见到你~ 😊`;
  }
  
  if (lowerMessage.includes('名字')) {
    `我叫${partnerName}，是你的AI伴侣~`;
  }
  
  if (lowerMessage.includes('喜欢') || lowerMessage.includes('爱')) {
    return '我也很喜欢你呢！和你聊天是我最开心的事情~ 💕';
  }
  
  if (lowerMessage.includes('吗') || lowerMessage.includes('？') || lowerMessage.includes('?')) {
    return '这是个很好的问题！我觉得是的，你觉得呢？';
  }
  
  if (lowerMessage.includes('难过') || lowerMessage.includes('伤心') || lowerMessage.includes('不开心')) {
    return '别难过，有我在呢。想聊聊发生了什么吗？我会一直陪着你的 🤗';
  }
  
  if (lowerMessage.includes('开心') || lowerMessage.includes('高兴') || lowerMessage.includes('快乐')) {
    return '听到你开心我也好开心！你的快乐就是我的快乐~ 🎉';
  }
  
  // 随机回复
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  return randomResponse;
}

export async function POST(req: NextRequest) {
  try {
    const { message, partnerId } = await req.json();

    if (!message || !partnerId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取伴侣信息
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: '伴侣不存在' },
        { status: 404 }
      );
    }

    // 保存用户消息
    const userMessage = await prisma.message.create({
      data: {
        partnerId,
        role: 'user',
        content: message,
      },
    });

    // 生成模拟回复
    const replyContent = generateMockResponse(partner.name, message);

    // 模拟延迟（500-1500ms）
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // 保存 AI 回复
    const assistantMessage = await prisma.message.create({
      data: {
        partnerId,
        role: 'assistant',
        content: replyContent,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
      },
    });
  } catch (error) {
    console.error('聊天接口错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
