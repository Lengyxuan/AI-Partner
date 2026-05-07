'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { CharacterPanel } from './CharacterPanel';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';

interface ChatInterfaceProps {
  partnerId: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatInterface({ partnerId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCharacterPanel, setShowCharacterPanel] = useState(true);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [partner, setPartner] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载伴侣信息
  useEffect(() => {
    const loadPartner = async () => {
      try {
        const response = await fetch(`/api/partners/${partnerId}`);
        if (response.ok) {
          const data = await response.json();
          setPartner(data.data);
          // 加载历史消息
          if (data.data.messages) {
            setMessages(data.data.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.createdAt),
            })));
          }
        }
      } catch (error) {
        console.error('加载伴侣信息失败:', error);
      }
    };
    loadPartner();
  }, [partnerId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 创建 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          partnerId,
          modelType: partner?.modelType || 'cloud',
          modelName: partner?.modelName,
        }),
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullContent += content;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      // 标记流式传输完成
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: '抱歉，发生了错误，请重试。', isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex bg-tavern-dark text-foreground">
      {/* 左侧角色面板 */}
      {showCharacterPanel && (
        <CharacterPanel
          partner={partner}
          onClose={() => setShowCharacterPanel(false)}
        />
      )}

      {/* 中间聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          partner={partner}
          onToggleCharacterPanel={() => setShowCharacterPanel(!showCharacterPanel)}
          onToggleKnowledgePanel={() => setShowKnowledgePanel(!showKnowledgePanel)}
          showCharacterPanel={showCharacterPanel}
          showKnowledgePanel={showKnowledgePanel}
        />

        <MessageList
          messages={messages}
          partner={partner}
          messagesEndRef={messagesEndRef}
        />

        <MessageInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* 右侧知识库面板 */}
      {showKnowledgePanel && (
        <KnowledgeBaseManager
          partnerId={partnerId}
          onClose={() => setShowKnowledgePanel(false)}
        />
      )}
    </div>
  );
}
