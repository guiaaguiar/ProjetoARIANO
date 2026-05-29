import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2, Sparkles } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  isLoading = false,
  placeholder = 'Adicione uma tag e pressione Enter...',
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Tag color palette — cycles through a set of vibrant but contained hues
  const TAG_COLORS = [
    { bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.4)', text: '#38bdf8' },
    { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#a78bfa' },
    { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
    { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#818cf8' },
    { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#f472b6' },
    { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.4)', text: '#22d3ee' },
  ];

  return (
    <div
      className="min-h-[120px] p-3 rounded-2xl border transition-all cursor-text"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: isLoading ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)',
        boxShadow: isLoading ? '0 0 0 2px rgba(139,92,246,0.15)' : 'none',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header hint */}
      <div className="flex items-center gap-2 mb-3">
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#a78bfa' }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
              IA extraindo suas competências...
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {tags.length > 0 ? `${tags.length} competência${tags.length > 1 ? 's' : ''} identificada${tags.length > 1 ? 's' : ''}` : 'Nenhuma tag ainda'}
            </span>
          </>
        )}
      </div>

      {/* Loading shimmer */}
      {isLoading && (
        <div className="flex flex-wrap gap-2 mb-3">
          {[80, 110, 70, 95, 60].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded-full animate-pulse"
              style={{ width: w, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {!isLoading && (
        <div className="flex flex-wrap gap-2 mb-2">
          <AnimatePresence>
            {tags.map((tag, i) => {
              const color = TAG_COLORS[i % TAG_COLORS.length];
              return (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.7, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold select-none"
                  style={{
                    background: color.bg,
                    border: `1px solid ${color.border}`,
                    color: color.text,
                  }}
                >
                  {tag}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                      className="ml-0.5 hover:opacity-70 transition-opacity rounded-full"
                      aria-label={`Remover tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Text input */}
      {!isLoading && !disabled && (
        <div className="flex items-center gap-2 mt-1">
          <Plus className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim()) addTag(input); }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/20"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </div>
      )}
    </div>
  );
};
