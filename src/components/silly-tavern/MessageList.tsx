'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import type { Message } from './ChatInterface';

interface MessageListProps {
  messages: Message[];
  partner: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, partner, messagesEndRef }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">开始你们的对话吧</p>
            <p className="text-sm">发送一条消息，{partner?.name || 'AI伴侣'}会回复你</p>
          </div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* 头像 */}
              <div className="flex-shrink-0 mx-2">
                {message.role === 'user' ? (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                ) : (
                  <Avatar className="w-10 h-10 ring-2 ring-love-500/50">
                    <AvatarImage src={partner?.avatar} />
                    <AvatarFallback className="bg-love-500 text-white text-sm">
                      {partner?.name?.[0] || 'AI'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* 消息内容 */}
              <div
                className={`relative px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-love-600 text-white rounded-br-md'
                    : 'bg-tavern-panel text-gray-100 rounded-bl-md border border-tavern-border'
                }`}
              >
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="m-0 leading-relaxed">{children}</p>,
                      code: ({ children }) => (
                        <code className="bg-black/30 px-1 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {message.content || (message.isStreaming ? '思考中...' : '')}
                  </ReactMarkdown>
                </div>

                {/* 打字指示器 */}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                )}

                {/* 时间戳 */}
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-love-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
