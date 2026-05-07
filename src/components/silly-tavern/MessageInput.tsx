'use client';

import { useState, useRef } from 'react';
import { Send, Mic, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function MessageInput({ value, onChange, onSend, isLoading }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className="p-4 bg-tavern-panel border-t border-tavern-border">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-2 bg-tavern-dark rounded-2xl p-2 border border-tavern-border">
          {/* 附件按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-tavern-border rounded-xl"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* 输入框 */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`输入消息... (Shift+Enter换行)`}
            className="flex-1 min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none text-gray-100 placeholder:text-gray-500 py-2"
            rows={1}
          />

          {/* 语音按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-tavern-border rounded-xl"
          >
            <Mic className="w-5 h-5" />
          </Button>

          {/* 发送按钮 */}
          <Button
            onClick={onSend}
            disabled={!value.trim() || isLoading}
            className={`flex-shrink-0 rounded-xl px-4 ${
              value.trim() && !isLoading
                ? 'bg-love-600 hover:bg-love-700 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* 快捷提示 */}
        <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500">
          <span>按 Enter 发送</span>
          <span>·</span>
          <span>Shift + Enter 换行</span>
        </div>
      </div>
    </div>
  );
}
