import { useRef, useState, useEffect } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, FileText, Plus, MessageSquare, Sparkles, Zap, Search, Loader2, PanelLeft } from 'lucide-react';

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

];

const SUGGESTED_QUESTIONS = [
  'Summarize the abstract',
  'What methodology was used?',
  'List the key limitations',
];

// let nextId = 100;

export default function ChatScreen() {
  const { history, refreshHistory } = useChatContext();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setIsInitialized(false);

    const savedChat = localStorage.getItem(`chat_${conversationId}`);
    if (savedChat) {
      const parsedChat = JSON.parse(savedChat);
      setFileName(parsedChat.name);

      if (parsedChat.messages) {
        setMessages(parsedChat.messages);
      } else {
        setMessages([]);
      }
    } else {
      navigate('/');
    }

    setTimeout(() => {
      setIsInitialized(true);
    }, 50);
  }, [conversationId, navigate]);



  useEffect(() => {
    if (!isInitialized) return;
    const savedChat = localStorage.getItem(`chat_${conversationId}`);
    if (savedChat) {
      const parsedChat = JSON.parse(savedChat);
      parsedChat.messages = messages;
      localStorage.setItem(`chat_${conversationId}`, JSON.stringify(parsedChat));

      refreshHistory();
    }
  }, [messages, conversationId, isInitialized, refreshHistory]);

  const onReset = () => {
    navigate('/');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const sendQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let responseChat = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: trimmed, conversation_id: conversationId }),
    });

    let data = await responseChat.json();

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          text: data.answer || 'Sorry, I could not retrieve an answer for that question.',
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
      
      <Sidebar isSidebarOpen={isSidebarOpen} fileName={fileName} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-sm px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <PanelLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>

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
                <span className="text-[11px] text-zinc-600 font-mono">RAG</span>
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${idx === 0 ? '' : 'mt-7'
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

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
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
                  ${input.trim() && !isTyping
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
