import { useRef, useState, useEffect } from 'react';
import { ArrowUp, FileText, Plus, MessageSquare, Sparkles, Zap, Search, Loader2 } from 'lucide-react';

interface ChatScreenProps {
  fileName: string;
  onReset: () => void;
}

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'user',
    text: 'What is this document about?',
  },
  {
    id: 2,
    role: 'ai',
    text: 'This document is a technical research paper on scalable retrieval-augmented generation (RAG) architectures. It covers chunking strategies, vector store indexing, and latency optimization techniques for production-level deployment.',
  },
  {
    id: 3,
    role: 'user',
    text: 'Can you summarize the key findings?',
  },
  {
    id: 4,
    role: 'ai',
    text: 'The paper identifies three core findings:\n\n1. Semantic chunking outperforms fixed-size chunking by 23% in retrieval accuracy.\n2. Hybrid search combining dense and sparse vectors reduces hallucination rates significantly.\n3. Caching intermediate embeddings cuts p99 latency by 40% under concurrent load.',
  },
];

const SUGGESTED_QUESTIONS = [
  'Summarize the abstract',
  'What methodology was used?',
  'List the key limitations',
];

let nextId = 100;

export default function ChatScreen({ fileName, onReset }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const sendQuery = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { id: nextId++, role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: 'ai',
          text: 'Based on the retrieved context from your document, here is a relevant excerpt that addresses your query. The system identified matching passages and synthesized the response from multiple sections.',
        },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 md:flex animate-slide-in-left">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-zinc-900 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <FileText className="h-4 w-4 text-zinc-300" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-200">
            Chat<span className="text-zinc-600">Pdf</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Current Document */}
          <div className="px-3 py-4">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-700">
              Current Document
            </p>
            <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3 transition-colors hover:border-zinc-700">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <FileText className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-300">{fileName}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600/80 animate-status-pulse" />
                  <span className="text-[11px] text-zinc-600">Indexed & ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="px-3 pb-4">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-700">
              Conversation
            </p>
            <div className="flex items-center gap-2.5 rounded-lg bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300 cursor-default">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-600" strokeWidth={1.5} />
              <span>Current session</span>
              <span className="ml-auto text-[10px] text-zinc-700">{messages.length} msgs</span>
            </div>
          </div>

          {/* Stats footer in sidebar */}
          <div className="px-3 pb-4">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-700">
              Session Stats
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs">
                <span className="text-zinc-600">Queries</span>
                <span className="font-mono text-zinc-400">
                  {messages.filter((m) => m.role === 'user').length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs">
                <span className="text-zinc-600">Retrievals</span>
                <span className="font-mono text-zinc-400">
                  {messages.filter((m) => m.role === 'ai').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* New Document button */}
        <div className="border-t border-zinc-900 p-3">
          <button
            onClick={onReset}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 transition-colors"
          >
            <Plus className="h-4 w-4 text-zinc-600" strokeWidth={1.5} />
            New Document
          </button>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-sm px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 md:hidden">
              <FileText className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-200">{fileName}</p>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] text-zinc-600">
                  Retrieval-augmented chat
                </span>
                <span className="hidden sm:inline h-1 w-1 rounded-full bg-zinc-700" />
                <span className="text-[11px] text-zinc-600 font-mono">RAG v2</span>
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">New</span>
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-3xl px-5 py-8">
            {/* System context banner */}
            <div className="mb-8 flex items-center gap-2.5 rounded-xl border border-zinc-900 bg-zinc-900/30 px-4 py-3 animate-fade-in">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <Sparkles className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">
                Document <span className="text-zinc-400 font-medium">{fileName}</span> has been
                indexed and chunked. Ask questions to retrieve relevant context.
              </p>
            </div>

            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${
                  idx === 0 ? '' : 'mt-7'
                } animate-message-in`}
              >
                {msg.role === 'ai' && (
                  <div className="mr-3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <Sparkles className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
                  </div>
                )}
                <div className={`max-w-[78%] ${msg.role === 'user' ? '' : ''}`}>
                  {msg.role === 'ai' && (
                    <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-zinc-600">
                      ChatPdf
                    </span>
                  )}
                  <div
                    className={
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-tr-md bg-zinc-800/80 px-4 py-3 text-sm leading-relaxed text-zinc-100'
                        : 'rounded-2xl rounded-tl-md border border-zinc-900 bg-zinc-900/30 px-4 py-3 text-sm leading-relaxed text-zinc-300'
                    }
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mt-7 flex justify-start animate-message-in">
                <div className="mr-3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                  <Loader2 className="h-4 w-4 text-zinc-500 animate-spin" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-zinc-600">
                    ChatPdf
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-zinc-900 bg-zinc-900/30 px-4 py-3.5">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-500" style={{ animationDelay: '0s' }} />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-500" style={{ animationDelay: '0.15s' }} />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-500" style={{ animationDelay: '0.3s' }} />
                    <span className="ml-1 text-[11px] text-zinc-600">Retrieving context…</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions when idle */}
            {!isTyping && messages.length <= 4 && (
              <div className="mt-8 flex flex-col items-start gap-2 animate-fade-in">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-700">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendQuery(q)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-zinc-300 transition-all duration-200"
                    >
                      <Search className="h-3 w-3 text-zinc-600" strokeWidth={1.5} />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-900 bg-zinc-950 px-5 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition-all duration-200 focus-within:border-zinc-700 focus-within:bg-zinc-900/60">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask a question about your document…"
                className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none scrollbar-thin"
                style={{ maxHeight: '160px' }}
              />
              <button
                onClick={() => sendQuery(input)}
                disabled={!input.trim() || isTyping}
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200
                  ${
                    input.trim() && !isTyping
                      ? 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-md shadow-zinc-100/5'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }
                `}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-3">
              <span className="text-[11px] text-zinc-700">
                Press <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-500">Enter</kbd> to send · <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-500">Shift+Enter</kbd> for newline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
