'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreatePartnerDialogProps {
  stage: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const stageConfig: Record<string, { title: string; subtitle: string; gradient: string }> = {
  first: {
    title: '初遇相识',
    subtitle: '给TA一个名字，开启你们的缘分',
    gradient: 'from-pink-500 to-rose-500',
  },
  second: {
    title: '再遇相知',
    subtitle: '了解彼此，建立深厚的情感连接',
    gradient: 'from-violet-500 to-purple-500',
  },
  third: {
    title: '缘定相守',
    subtitle: '携手相伴，共度美好时光',
    gradient: 'from-amber-500 to-orange-500',
  },
};

export function CreatePartnerDialog({ stage, onClose, onSuccess }: CreatePartnerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const config = stage ? stageConfig[stage] : stageConfig.first;

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          personality: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 创建成功后跳转到聊天页
        window.location.href = `/chat/${data.data.id}`;
        onSuccess();
      }
    } catch (error) {
      console.error('创建伴侣失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} mb-4`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">{config.title}</h2>
            <p className="text-sm text-slate-400 font-normal mt-1">{config.subtitle}</p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 伴侣名称 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AI伴侣名字 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="例如：小樱、阿杰..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
                autoFocus
              />
            </div>
          </div>

          {/* 简短描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              简短描述 <span className="text-slate-500">(选填)</span>
            </label>
            <Textarea
              placeholder="描述TA的性格特点..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500 min-h-[80px]"
            />
          </div>

          {/* 提交按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isSubmitting}
            className={`w-full bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 disabled:opacity-50`}
          >
            {isSubmitting ? (
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                创建伴侣
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
