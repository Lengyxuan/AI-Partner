'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, MessageSquare, Send, ChevronLeft,
  Sparkles, Heart, BookOpen, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatLayoutProps {
  partnerId: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string;
  avatar: string | null;
  backstory: string | null;
  personality: string | null;
}

export function ChatLayout({ partnerId }: ChatLayoutProps) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载伴侣信息和历史消息
  useEffect(() => {
    loadPartner();
  }, [partnerId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPartner = async () => {
    try {
      const response = await fetch(`/api/partners/${partnerId}`);
      if (response.ok) {
        const data = await response.json();
        setPartner(data.data);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('加载伴侣信息失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          partnerId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.data.message]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionSuccess('');
      setConnectionError('请输入 API Key');
      return;
    }

    if (!baseUrl.trim()) {
      setConnectionSuccess('');
      setConnectionError('请输入接口 URL');
      return;
    }

    if (!modelName.trim()) {
      setConnectionSuccess('');
      setConnectionError('请输入模型名称');
      return;
    }

    setIsTestingConnection(true);
    setConnectionSuccess('');
    setConnectionError('');

    try {
      const response = await fetch('/api/test-llm-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          baseUrl,
          model: modelName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionSuccess(data.message || '连接成功');
      } else {
        setConnectionError(data.error || '连接失败');
      }
    } catch (error) {
      setConnectionError('请求失败，请检查服务是否启动');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="h-full flex bg-slate-900 text-slate-100">
      {/* 左侧面板 - 角色信息 */}
      <AnimatePresence>
        {leftPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-slate-700 bg-slate-800/50 flex flex-col overflow-hidden"
          >
            {/* 返回按钮 */}
            <div className="p-4 border-b border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                返回首页
              </Button>
            </div>

            {/* 角色信息 */}
            <ScrollArea className="flex-1 p-4">
              {partner && (
                <div className="text-center">
                  {/* 头像 */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    {partner.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>

                  {/* 名称 */}
                  <h2 className="text-xl font-bold text-white mb-1">
                    {partner.name}
                  </h2>

                  {/* 状态 */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-400 mb-6">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>在线</span>
                  </div>

                  {/* 性格 */}
                  {partner.personality && (
                    <div className="text-left mb-4">
                      <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        性格特点
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {partner.personality}
                      </p>
                    </div>
                  )}

                  {/* 背景故事 */}
                  {partner.backstory && (
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        背景故事
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {partner.backstory}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 中间聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-14 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="text-slate-400 hover:text-white"
            >
              {leftPanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            {partner && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-white text-sm">{partner.name}</h1>
                  <p className="text-xs text-slate-400">AI 伴侣</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* 消息列表 */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-2">开始你们的对话吧</p>
                <p className="text-slate-500 text-sm">
                  发送一条消息，{partner?.name || 'AI伴侣'}会回复你
                </p>
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
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center">
                        {partner?.avatar ? (
                          <img
                            src={partner.avatar}
                            alt={partner.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <Heart className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/60' : 'text-slate-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* 加载中 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex flex-row">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center mx-2">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 输入框 */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-2 bg-slate-800 rounded-xl p-2 border border-slate-700">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`输入消息... (按 Enter 发送)`}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-slate-100 placeholder:text-slate-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              按 Enter 发送 · Shift + Enter 换行
            </p>
          </div>
        </div>
      </div>

      {/* 右侧面板 - 设置 */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-slate-700 bg-slate-800/50 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">设置</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">模型设置</h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                      <p className="text-sm text-slate-300">当前模型</p>
                      <p className="text-xs text-slate-500 mt-1">模拟回复模式</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-2">API Key</p>
                        <Input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="请输入 API Key"
                          className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-2">接口 URL</p>
                        <Input
                          value={baseUrl}
                          onChange={(e) => setBaseUrl(e.target.value)}
                          placeholder="例如 https://api.openai.com/v1"
                          className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-2">模型名称</p>
                        <Input
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          placeholder="例如 gpt-4o-mini"
                          className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <Button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {isTestingConnection ? '检测中...' : '检测 API 是否连接成功'}
                      </Button>
                      {connectionSuccess ? (
                        <p className="text-xs text-emerald-400">{connectionSuccess}</p>
                      ) : null}
                      {connectionError ? (
                        <p className="text-xs text-rose-400">{connectionError}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">对话统计</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                      <p className="text-lg font-semibold text-white">{messages.length}</p>
                      <p className="text-xs text-slate-500">消息总数</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                      <p className="text-lg font-semibold text-white">
                        {messages.filter(m => m.role === 'assistant').length}
                      </p>
                      <p className="text-xs text-slate-500">回复数</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
