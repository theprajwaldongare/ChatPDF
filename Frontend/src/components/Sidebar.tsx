import { FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatContext } from '@/context/ChatContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  fileName?: string | null;
  setIsSidebarOpen?: (open: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, fileName, setIsSidebarOpen }: SidebarProps) {
  const { history } = useChatContext();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  return (
    <>
    {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
        />
      )}

    <aside className={`absolute z-50 h-full md:relative shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 transition-all duration-300 overflow-hidden ${ isSidebarOpen ? 'w-64 flex' : 'w-0 opacity-0'}`}>
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
        
        {fileName && (
          <div className="px-3 py-4">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-700">
              Current Document
            </p>
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3 transition-colors hover:border-zinc-700">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <FileText className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-300 text-wrap">
                  {fileName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Previous Documents */}
        {history.length > 0 && (
          <div className="px-3 pb-4 mt-2 border-t border-zinc-900 pt-4">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-700">
              Previous Documents
            </p>
            <div className="space-y-1">
              {history
                .filter((chat) => chat.id !== conversationId)
                .map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 transition-colors text-left"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={1.5} />
                    <span className="truncate flex-1">{chat.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  </>
  );
}