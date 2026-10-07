import { useCallback, useRef, useState } from 'react';
import { FileText, UploadCloud, X, Sparkles, Search, ShieldCheck, Zap } from 'lucide-react';

interface UploadScreenProps {
  onUpload: (fileName: string) => void;
}

const FEATURES = [
  { icon: Search, label: 'Semantic Retrieval' },
  { icon: Zap, label: 'Instant Answers' },
  { icon: ShieldCheck, label: 'Private by Design' },
];

export default function UploadScreen({ onUpload }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only .pdf files are accepted.');
      setFileName(null);
      return;
    }
    setError(null);
    setFileName(file.name);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onProceed = () => {
    if (fileName) onUpload(fileName);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Background layers */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(244 244 245) 1px, transparent 1px), linear-gradient(90deg, rgb(244 244 245) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 35%, rgb(244 244 245), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-xl flex flex-col items-center animate-fade-in-up">
        {/* Logo mark */}
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-zinc-900/80 rounded-lg">
            <FileText className="h-4 w-4 text-zinc-300" strokeWidth={1.75} />
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-100">
            Chat<span className="text-zinc-600">Pdf</span>
          </span>
        </div>

        {/* Hero */}
        <div className="mb-2 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1">
          <Sparkles className="h-3 w-3 text-zinc-500" strokeWidth={1.5} />
          <span className="text-[11px] font-medium tracking-wide text-zinc-500">
            Retrieval-Augmented Generation
          </span>
        </div>
        <h1 className="mt-5 text-center text-[3.25rem] font-bold tracking-tight text-white leading-[1.05] sm:text-7xl">
          ChatPdf
        </h1>
        <p className="mt-5 max-w-md text-center text-[15px] leading-relaxed text-zinc-400">
          A scalable AI-powered platform to understand documents, retrieve relevant context,
          and deliver accurate answers.
        </p>

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <f.icon className="h-3.5 w-3.5 text-zinc-600" strokeWidth={1.5} />
              <span className="text-xs font-medium text-zinc-500">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div className="mt-10 w-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={onDrop}
            className={`
              group relative flex flex-col items-center justify-center
              rounded-2xl border-2 border-dashed px-6 py-14
              cursor-pointer transition-all duration-300
              ${
                isDragging
                  ? 'border-zinc-600 bg-zinc-900/50 scale-[1.01]'
                  : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/30'
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
            />

            {fileName ? (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg">
                  <FileText className="h-7 w-7 text-zinc-300" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="max-w-[240px] truncate text-sm font-medium text-zinc-200">
                      {fileName}
                    </span>
                    <button
                      onClick={clearFile}
                      className="text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-600">PDF ready · Click to change</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300
                    ${
                      isDragging
                        ? 'border-zinc-600 bg-zinc-800/50 scale-110'
                        : 'border-zinc-800 bg-zinc-900 group-hover:border-zinc-700'
                    }
                  `}
                >
                  <UploadCloud
                    className={`h-7 w-7 transition-all duration-300 ${
                      isDragging ? 'text-zinc-300 scale-110' : 'text-zinc-500 group-hover:text-zinc-400'
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-300">
                    {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF'}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-600">
                    or <span className="text-zinc-500 underline underline-offset-2 decoration-zinc-700">browse files</span> — only .pdf accepted
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-center text-xs text-amber-600/90 animate-fade-in">{error}</p>
          )}

          {/* Upload button */}
          <button
            onClick={onProceed}
            disabled={!fileName}
            className={`
              mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5
              text-sm font-semibold transition-all duration-200
              ${
                fileName
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg shadow-zinc-100/5 cursor-pointer'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
              }
            `}
          >
            <UploadCloud className="h-4 w-4" strokeWidth={2} />
            Upload & Start Chatting
          </button>
        </div>

        <p className="mt-8 text-[11px] text-zinc-700">
          Documents are processed locally — no data leaves your session.
        </p>
      </div>
    </div>
  );
}
