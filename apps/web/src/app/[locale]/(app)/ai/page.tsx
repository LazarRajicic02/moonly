
'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function AiPage() {
  const token = getAccessToken()!;
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!message.trim()) return;
    setLoading(true);
    setMessages((m) => [...m, { role: 'user', content: message }]);
    try {
      const res = await api.aiChat(token, { message, conversationId }) as any;
      setConversationId(res.conversationId);
      setMessages((m) => [...m, { role: 'assistant', content: res.message.content }]);
      setMessage('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-3xl text-lunar-bright">Luna assistant</h1>
      <div className="space-y-3">
        {messages.map((m, i) => (
          <Card key={i} className={m.role === 'assistant' ? 'border-tide/30' : ''}>
            <p className="text-xs uppercase text-lunar-dim">{m.role}</p>
            <p className="mt-1 whitespace-pre-wrap text-lunar-bright">{m.content}</p>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about your cycle…" aria-label="Message" />
        <Button onClick={send} disabled={loading}>Send</Button>
      </div>
    </main>
  );
}
