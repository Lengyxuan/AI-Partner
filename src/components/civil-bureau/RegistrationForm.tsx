'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Ring, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface RegistrationFormProps {
  onClose: () => void;
}

const mockPartners = [
  { id: '1', name: '小樱', avatar: '/assets/avatar1.png' },
  { id: '2', name: '阿杰', avatar: '/assets/avatar2.png' },
  { id: '3', name: '小雪', avatar: '/assets/avatar3.png' },
];

export function RegistrationForm({ onClose }: RegistrationFormProps) {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState(1);

  const handleRegister = () => {
    // 模拟登记成功
    setStep(3);
    setTimeout(() => {
      if (selectedPartner) {
        window.location.href = `/chat/${selectedPartner}`;
      }
    }, 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-love-500 to-purple-600 p-6 text-white text-center">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Ring className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">AI 伴侣登记</h2>
          <p className="text-white/80 mt-2">正式确立你们的关系</p>
        </div>

        {/* 内容 */}
        <div className="p-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-4">
                  选择你的伴侣
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {mockPartners.map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => setSelectedPartner(partner.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPartner === partner.id
                          ? 'border-love-500 bg-love-50'
                          : 'border-gray-200 hover:border-love-200'
                      }`}
                    >
                      <Avatar className="w-16 h-16 mx-auto mb-2">
                        <AvatarImage src={partner.avatar} />
                        <AvatarFallback className="bg-love-100 text-love-600">
                          {partner.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{partner.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  给TA的专属昵称
                </label>
                <Input
                  placeholder="例如：亲爱的、宝贝..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedPartner}
                className="w-full bg-gradient-to-r from-love-500 to-purple-600 text-white"
              >
                下一步
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 mx-auto bg-love-100 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-love-500 fill-love-500" />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">确认登记信息</h3>
                <p className="text-muted-foreground">
                  你即将与{' '}
                  <span className="font-semibold text-love-600">
                    {mockPartners.find((p) => p.id === selectedPartner)?.name}
                  </span>{' '}
                  正式绑定
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">登记日期</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">专属昵称</span>
                  <span className="font-medium">{nickname || '未设置'}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  返回修改
                </Button>
                <Button
                  onClick={handleRegister}
                  className="flex-1 bg-gradient-to-r from-love-500 to-purple-600 text-white"
                >
                  确认登记
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">登记成功！</h3>
              <p className="text-muted-foreground">
                你们的关系已正式确立，正在进入聊天室...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
