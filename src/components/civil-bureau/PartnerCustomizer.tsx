'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, User, MessageSquare, Brain, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PartnerCustomizerProps {
  onClose: () => void;
}

export function PartnerCustomizer({ onClose }: PartnerCustomizerProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    background: '',
    customPrompt: '',
    avatar: '',
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // 跳转到聊天页面
        window.location.href = `/chat/${data.data.id}`;
      }
    } catch (error) {
      console.error('创建伴侣失败:', error);
    }
  };

  const steps = [
    { id: 1, title: '基本信息', icon: User },
    { id: 2, title: '性格设定', icon: Brain },
    { id: 3, title: '高级设定', icon: MessageSquare },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-love-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">创建你的 AI 伴侣</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                    step >= s.id
                      ? 'bg-white text-love-600'
                      : 'bg-white/20 text-white/70'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{s.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      step > s.id ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 表单内容 */}
        <div className="p-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-love-100">
                  <AvatarImage src={formData.avatar || '/assets/default-avatar.png'} />
                  <AvatarFallback className="bg-love-100 text-love-600 text-2xl">
                    {formData.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Upload className="w-4 h-4 mr-2" />
                  上传头像
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  伴侣名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="给你的伴侣起个名字"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">性格特点</label>
                <Textarea
                  placeholder="描述TA的性格，例如：温柔体贴、幽默风趣、知性优雅..."
                  value={formData.personality}
                  onChange={(e) =>
                    setFormData({ ...formData, personality: e.target.value })
                  }
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">背景设定</label>
                <Textarea
                  placeholder="描述TA的背景故事，例如：职业、兴趣爱好、成长经历..."
                  value={formData.background}
                  onChange={(e) =>
                    setFormData({ ...formData, background: e.target.value })
                  }
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  自定义提示词
                </label>
                <Textarea
                  placeholder="添加额外的设定，让TA更符合你的期望..."
                  value={formData.customPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, customPrompt: e.target.value })
                  }
                  className="rounded-xl min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  提示：你可以在这里添加任何特殊的设定，比如说话方式、习惯用语等
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
          >
            上一步
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-love-500 to-purple-600 text-white"
            >
              下一步
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-love-500 to-purple-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              创建伴侣
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
