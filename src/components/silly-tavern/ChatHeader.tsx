'use client';

import { Menu, BookOpen, Settings, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ChatHeaderProps {
  partner: any;
  onToggleCharacterPanel: () => void;
  onToggleKnowledgePanel: () => void;
  showCharacterPanel: boolean;
  showKnowledgePanel: boolean;
}

export function ChatHeader({
  partner,
  onToggleCharacterPanel,
  onToggleKnowledgePanel,
  showCharacterPanel,
  showKnowledgePanel,
}: ChatHeaderProps) {
  return (
    <header className="h-16 bg-tavern-panel border-b border-tavern-border flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCharacterPanel}
          className={`text-gray-400 hover:text-white hover:bg-tavern-border ${
            showCharacterPanel ? 'bg-tavern-border text-white' : ''
          }`}
        >
          <User className="w-5 h-5" />
        </Button>

        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-love-500/50">
            <AvatarImage src={partner?.avatar} />
            <AvatarFallback className="bg-love-500 text-white">
              {partner?.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-white">{partner?.name || 'AI伴侣'}</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                在线
              </span>
              <span>·</span>
              <span>{partner?.modelType === 'local' ? '本地模型' : '云端模型'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleKnowledgePanel}
          className={`text-gray-400 hover:text-white hover:bg-tavern-border ${
            showKnowledgePanel ? 'bg-tavern-border text-white' : ''
          }`}
          title="知识库"
        >
          <BookOpen className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-tavern-border"
          title="设置"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-tavern-border"
          title="菜单"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
