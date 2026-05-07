'use client';

import { motion } from 'framer-motion';
import { MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Partner {
  id: string;
  name: string;
  avatar: string | null;
  backstory: string | null;
  personality: string | null;
  createdAt: string;
}

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const handleChat = () => {
    window.location.href = `/chat/${partner.id}`;
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start space-x-4">
        {/* 头像 */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          {partner.avatar ? (
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-slate-400" />
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 truncate">
            {partner.name}
          </h3>
          {partner.personality && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
              {partner.personality}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            创建于 {new Date(partner.createdAt).toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Button
          onClick={handleChat}
          className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:opacity-90"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          开始聊天
        </Button>
      </div>
    </motion.div>
  );
}
