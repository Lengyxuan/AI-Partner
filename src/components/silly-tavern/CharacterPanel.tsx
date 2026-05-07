'use client';

import { X, User, Heart, Brain, BookOpen, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterPanelProps {
  partner: any;
  onClose: () => void;
}

export function CharacterPanel({ partner, onClose }: CharacterPanelProps) {
  if (!partner) {
    return (
      <div className="w-80 bg-tavern-panel border-r border-tavern-border flex flex-col">
        <div className="p-4 text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-tavern-panel border-r border-tavern-border flex flex-col flex-shrink-0">
      {/* 头部 */}
      <div className="p-4 border-b border-tavern-border flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center">
          <User className="w-5 h-5 mr-2" />
          角色信息
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-tavern-border"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* 头像和名称 */}
        <div className="p-6 text-center border-b border-tavern-border">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-love-500/30">
            <AvatarImage src={partner.avatar} />
            <AvatarFallback className="bg-love-500 text-white text-2xl">
              {partner.name[0]}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold text-white mb-1">{partner.name}</h3>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Heart className="w-4 h-4 text-love-500 fill-love-500" />
            <span>亲密度: 85</span>
          </div>
        </div>

        {/* 性格设定 */}
        <div className="p-4 border-b border-tavern-border">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            性格特点
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {partner.personality || '暂无性格设定'}
          </p>
        </div>

        {/* 背景设定 */}
        <div className="p-4 border-b border-tavern-border">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            背景设定
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {partner.background || '暂无背景设定'}
          </p>
        </div>

        {/* 统计信息 */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            对话统计
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tavern-dark rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-love-400">
                {partner._count?.messages || 0}
              </div>
              <div className="text-xs text-gray-500">总消息数</div>
            </div>
            <div className="bg-tavern-dark rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {partner._count?.knowledgeBases || 0}
              </div>
              <div className="text-xs text-gray-500">知识库文件</div>
            </div>
          </div>
        </div>

        {/* 模型信息 */}
        <div className="p-4 border-t border-tavern-border">
          <h4 className="text-sm font-medium text-gray-300 mb-2">模型配置</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>类型:</span>
              <span className="text-gray-300">
                {partner.modelType === 'local' ? '本地模型' : '云端模型'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>模型:</span>
              <span className="text-gray-300">{partner.modelName || '默认'}</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
