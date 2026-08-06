'use client';

import { useEffect, useState } from 'react';
import { SaveIcon, XIcon } from './Icons';

interface SaveConfigurationModalProps {
  open: boolean;
  itemCount: number;
  totalPrice: number;
  onClose: () => void;
  onSave: (name: string) => void;
}

const SUGGESTIONS = ['Deep Powder Rig', 'Park & Rails', 'Groomer Carver', 'One-Boot Quiver'];

export default function SaveConfigurationModal({
  open,
  itemCount,
  totalPrice,
  onClose,
  onSave,
}: SaveConfigurationModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = name.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-glacier-1000/75 p-4 backdrop-blur-sm animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-config-title"
      onClick={onClose}
    >
      <div
        className="glass-strong relative w-full max-w-sm p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-frost-400/25 bg-frost-500/10 text-frost-300">
          <SaveIcon className="h-5 w-5" />
        </div>

        <h3 id="save-config-title" className="mt-3 font-display text-lg font-bold text-white">
          Save this configuration
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          Name your setup so you can reload it later — e.g. &ldquo;Deep Powder Rig&rdquo; or &ldquo;Park &amp;
          Rails&rdquo;.
        </p>

        <input
          autoFocus
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && trimmed) onSave(trimmed);
          }}
          placeholder={SUGGESTIONS[0]}
          maxLength={60}
          className="focus-ring mt-4 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600"
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setName(suggestion)}
              className="pill focus-ring transition-colors hover:border-frost-400/40 hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {itemCount} items · ${totalPrice.toFixed(2)} best-price total
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost !px-4 !py-2.5 text-xs">
            Cancel
          </button>
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => onSave(trimmed)}
            className="btn-primary !px-4 !py-2.5 text-xs"
          >
            <SaveIcon className="h-3.5 w-3.5" />
            Save configuration
          </button>
        </div>
      </div>
    </div>
  );
}
