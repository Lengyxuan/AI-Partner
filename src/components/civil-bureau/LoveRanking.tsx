'use client';

import { motion } from 'framer-motion';
import { Heart, Trophy, MessageCircle, Flame } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const mockRanking = [
  {
    id: '1',
    name: '小樱',
    avatar: '/assets/avatar1.png',
    owner: 'User123',
    messageCount: 15420,
    bondLevel: 99,
    rank: 1,
  },
  {
    id: '2',
    name: '阿杰',
    avatar: '/assets/avatar2.png',
    owner: 'Alice',
    messageCount: 12350,
    bondLevel: 95,
    rank: 2,
  },
  {
    id: '3',
    name: '小雪',
    avatar: '/assets/avatar3.png',
    owner: 'Bob',
    messageCount: 10890,
    bondLevel: 92,
    rank: 3,
  },
  {
    id: '4',
    name: '小明',
    avatar: '/assets/avatar4.png',
    owner: 'Carol',
    messageCount: 9870,
    bondLevel: 88,
    rank: 4,
  },
  {
    id: '5',
    name: '莉莉',
    avatar: '/assets/avatar5.png',
    owner: 'David',
    messageCount: 8650,
    bondLevel: 85,
    rank: 5,
  },
];

export function LoveRanking() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">甜蜜排行榜</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">最受欢迎的情侣</h2>
          <p className="text-muted-foreground">
            看看谁和AI伴侣的感情最深
          </p>
        </motion.div>

        <div className="space-y-4">
          {mockRanking.map((item, index) => (
            <motion.div
              key={item.id}
              className="flex items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* 排名 */}
              <div className="flex-shrink-0 w-12 text-center">
                {item.rank <= 3 ? (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      item.rank === 1
                        ? 'bg-yellow-400'
                        : item.rank === 2
                        ? 'bg-gray-400'
                        : 'bg-orange-400'
                    }`}
                  >
                    {item.rank}
                  </div>
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {item.rank}
                  </span>
                )}
              </div>

              {/* 头像 */}
              <Avatar className="w-14 h-14 mx-4 ring-2 ring-love-100">
                <AvatarImage src={item.avatar} />
                <AvatarFallback className="bg-love-100 text-love-600">
                  {item.name[0]}
                </AvatarFallback>
              </Avatar>

              {/* 信息 */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    @{item.owner}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {item.messageCount.toLocaleString()} 条对话
                  </span>
                  <span className="flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-orange-500" />
                    亲密度 {item.bondLevel}
                  </span>
                </div>
              </div>

              {/* 爱心 */}
              <div className="flex-shrink-0">
                <Heart
                  className={`w-6 h-6 fill-current ${
                    item.rank <= 3 ? 'text-love-500' : 'text-love-300'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
