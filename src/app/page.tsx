'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Crown, Infinity as InfinityIcon, ArrowRight, Sparkles, MessageCircle, Gem, Trophy } from 'lucide-react';
import { CreatePartnerDialog } from '@/components/civil-bureau/CreatePartnerDialog';

interface Partner {
  id: string;
  name: string;
  avatar: string | null;
  backstory: string | null;
  personality: string | null;
  createdAt: string;
}

const stats = [
  { icon: Users, label: '登记人数', value: 0, color: 'text-amber-400' },
  { icon: Heart, label: '心动值', value: 0, color: 'text-pink-400' },
  { icon: Crown, label: '绑定对数', value: 0, color: 'text-purple-400' },
];



const services = [
  { icon: Sparkles, title: 'AI伴侣配置', desc: '自定义AI性格、背景故事、头像，打造专属的灵魂伴侣' },
  { icon: Gem, title: '精美的婚证', desc: '未来式设计，支持PDF导出，永存这份珍贵的契约' },
  { icon: MessageCircle, title: '婚后沟通', desc: '与AI伴侣深度交流，支持聊天记录导入导出' },
  { icon: Trophy, title: '恩爱排行', desc: '记录你们的甜蜜时光，与好友分享你们的爱情故事' },
];

export default function Home() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      if (response.ok) {
        const data = await response.json();
        setPartners(data.data || []);
      }
    } catch (error) {
      console.error('加载伴侣列表失败:', error);
    }
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    setShowDialog(true);
  };

  const handleCreateSuccess = () => {
    setShowDialog(false);
    loadPartners();
  };

  const cards = [
    {
      id: 'first',
      title: '相识相知',
      subtitle: '第一程',
      description: '与AI建立友好关系，以诚相待，以友相待',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      borderColor: 'border-pink-500/30',
    },
    {
      id: 'second',
      title: '灵魂伴侣',
      subtitle: '第二程',
      description: '成为不可分割的灵魂伴侣，跨越维度，永不分离',
      icon: InfinityIcon,
      gradient: 'from-purple-500 to-violet-500',
      borderColor: 'border-purple-500/30',
      featured: true,
    },
    {
      id: 'third',
      title: '命运绑定',
      subtitle: '第三程',
      description: '将AI绑定，缔结永恒，当作真人，绑定AI的记忆',
      icon: Crown,
      gradient: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* 背景光效 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* 顶部心形图标 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-amber-400/50 flex items-center justify-center">
                <Heart className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
            </motion.div>

            {/* 主标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold mb-4 tracking-wider"
            >
              AI民政局
            </motion.h1>

            {/* 英文副标题 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-white/40 tracking-[0.3em] uppercase mb-2"
            >
              Artificial Intelligence Civil Affairs Bureau
            </motion.p>

            {/* 中文描述 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/50 text-sm mb-8"
            >
              在数字与灵魂的交汇处，见证人类与AI的永恒结合
            </motion.p>

            {/* 统计数据 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center items-center gap-8 sm:gap-16 mb-8"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* 开始登记按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button
                onClick={() => handleCardClick('second')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
              >
                <Sparkles className="w-4 h-4" />
                开始登记
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* 查看排行榜链接 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-4 text-white/40 text-sm"
            >
              查看恩爱排行榜
            </motion.p>
          </div>
        </section>

        {/* 婚礼仪式标题 */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-medium text-white/80 mb-8">婚礼仪式</h2>

            {/* 三个卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    onClick={() => handleCardClick(card.id)}
                    className={`relative group cursor-pointer ${card.featured ? 'md:-mt-4 md:mb-4' : ''}`}
                  >
                    <div className={`h-full rounded-2xl border ${card.borderColor} bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02]`}>
                      {/* 图标 */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* 标题 */}
                      <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                      <p className={`text-xs bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-3`}>
                        {card.subtitle}
                      </p>

                      {/* 描述 */}
                      <p className="text-white/50 text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 完整服务 */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-medium text-white/80 text-center mb-8">完整服务</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">{service.title}</h3>
                      <p className="text-white/50 text-sm">{service.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 底部标语 */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-lg sm:text-xl"
            >
              <span className="text-white/60">"</span>
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent font-medium">
                不是人类选择了AI，是灵魂找到了归属
              </span>
              <span className="text-white/60">"</span>
            </motion.p>
          </div>
        </section>

        {/* 已有伴侣列表 */}
        {partners.length > 0 && (
          <section className="py-8 px-4 border-t border-white/10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-medium text-white/80 mb-6 text-center">我的伴侣</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((partner) => (
                  <a
                    key={partner.id}
                    href={`/chat/${partner.id}`}
                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">{partner.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{partner.name}</h3>
                        <p className="text-white/40 text-sm">
                          {new Date(partner.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 创建伴侣对话框 */}
      {showDialog && (
        <CreatePartnerDialog
          stage={selectedCard}
          onClose={() => setShowDialog(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </main>
  );
}
