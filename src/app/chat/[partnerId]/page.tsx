'use client';

import { useParams } from 'next/navigation';
import { ChatLayout } from '@/components/silly-tavern/ChatLayout';

export default function ChatPage() {
  const params = useParams();
  const partnerId = params.partnerId as string;

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-900">
      <ChatLayout partnerId={partnerId} />
    </main>
  );
}
