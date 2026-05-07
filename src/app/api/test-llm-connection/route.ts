import { NextRequest, NextResponse } from 'next/server';

function normalizeBaseUrl(baseUrl?: string) {
  const trimmed = (baseUrl || 'https://api.openai.com/v1').trim();
  return trimmed.replace(/\/+$/, '');
}

function buildChatCompletionsUrl(baseUrl?: string) {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized.endsWith('/chat/completions')
    ? normalized
    : `${normalized}/chat/completions`;
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, baseUrl, model } = await req.json();

    if (!apiKey?.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入 API Key' },
        { status: 400 }
      );
    }

    if (!baseUrl?.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入接口 URL' },
        { status: 400 }
      );
    }

    if (!model?.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入模型名称' },
        { status: 400 }
      );
    }

    const response = await fetch(buildChatCompletionsUrl(baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model.trim(),
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error?.message || `连接失败 (${response.status})`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API、URL 和模型连接成功',
    });
  } catch (error) {
    console.error('LLM connection test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '连接检测失败，请检查 URL 是否可达',
      },
      { status: 500 }
    );
  }
}
