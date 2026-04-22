'use client';

import { useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export default function GrowthChatbot({ routePath }: { routePath: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask about pricing, pickup, turnaround, or what service fits your pair best.',
    },
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setQuery('');

    try {
      const response = await fetch('/api/growth/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, routePath }),
      });
      const json = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: json.answer ?? 'The best next step is to start your order so we can review the pair and recommend the right service.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'The best next step is to start your order so the team can review your pair and recommend the right service.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] rounded-[1.6rem] border border-ink/12 bg-white/90 p-4 shadow-[0_24px_80px_rgba(10,15,31,0.16)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-glitch/80">
                AI assistant
              </div>
              <div className="text-sm text-ink/60">Answers from site content</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-xl text-ink/55 transition hover:border-glitch hover:text-glitch"
            >
              ×
            </button>
          </div>

          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-[1.2rem] px-4 py-3 text-sm leading-6 ${
                  message.role === 'assistant'
                    ? 'bg-bone text-ink'
                    : 'bg-glitch text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              className="input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask about turnaround, pickup, or pricing"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
            <button type="button" onClick={() => void submit()} className="btn-glitch shrink-0">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-glitch shadow-[0_20px_50px_rgba(30,144,255,0.28)]"
          data-growth-cta="chat-open"
        >
          Ask Shoe Glitch AI
        </button>
      )}
    </div>
  );
}
