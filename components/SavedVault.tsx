'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SavedSetup, UserStats } from '@/lib/types';
import { deleteSavedSetup, loadSavedSetups, renameSavedSetup } from '@/lib/savedSetups';
import { BookmarkIcon, CheckIcon, PencilIcon, RefreshIcon, TrashIcon, XIcon } from './Icons';

/** Viewport margin the flyout must always keep clear on every side. */
const SAFE_PADDING = 16;
const PANEL_WIDTH = 352; // 22rem
const GAP = 8; // matches the old `mt-2`

interface Placement {
  top: number;
  left: number;
  maxHeight: number;
}

function computePlacement(trigger: HTMLElement): Placement {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const width = Math.min(PANEL_WIDTH, viewportWidth - SAFE_PADDING * 2);
  let left = rect.right - width;
  left = Math.max(SAFE_PADDING, Math.min(left, viewportWidth - width - SAFE_PADDING));

  const spaceBelow = viewportHeight - rect.bottom - GAP - SAFE_PADDING;
  const spaceAbove = rect.top - GAP - SAFE_PADDING;

  let top: number;
  let maxHeight: number;
  if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
    top = rect.bottom + GAP;
    maxHeight = Math.max(160, spaceBelow);
  } else {
    maxHeight = Math.max(160, spaceAbove);
    top = rect.top - GAP - maxHeight;
  }

  return { top, left, maxHeight: Math.min(maxHeight, 416) };
}

interface SavedVaultProps {
  onLoad: (stats: UserStats) => void;
  /** Bump this after saving a new setup so the vault (even while closed) refreshes its badge count. */
  refreshToken?: number;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SavedVault({ onLoad, refreshToken }: SavedVaultProps) {
  const [open, setOpen] = useState(false);
  const [setups, setSetups] = useState<SavedSetup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSetups(loadSavedSetups());
  }, [refreshToken]);

  useEffect(() => {
    if (open) setSetups(loadSavedSetups());
  }, [open]);

  // Portaled to <body> and positioned in fixed coordinates so the panel can
  // never be clipped by an ancestor's `overflow-hidden` (e.g. the profile
  // summary card), regardless of where this trigger is mounted.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const reposition = () => {
      if (triggerRef.current) setPlacement(computePlacement(triggerRef.current));
    };
    reposition();

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, setups.length]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
        setEditingId(null);
        setConfirmDeleteId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const startEdit = (setup: SavedSetup) => {
    setEditingId(setup.id);
    setEditValue(setup.name);
    setConfirmDeleteId(null);
  };

  const commitEdit = () => {
    if (!editingId) return;
    setSetups(renameSavedSetup(editingId, editValue));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setSetups(deleteSavedSetup(id));
    setConfirmDeleteId(null);
  };

  const handleLoad = (setup: SavedSetup) => {
    onLoad(setup.stats);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((value) => !value)}
        className="btn-ghost !py-2.5"
        aria-expanded={open}
      >
        <BookmarkIcon className="h-4 w-4" />
        Saved Vault
        {setups.length > 0 && (
          <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-frost-400/20 px-1 text-[10px] font-bold text-frost-200">
            {setups.length}
          </span>
        )}
      </button>

      {open &&
        placement &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100] w-[22rem] max-w-[calc(100vw-2rem)] animate-fade-up"
            style={{ top: placement.top, left: placement.left }}
          >
            <div
              className="overflow-y-auto rounded-2xl border border-white/15 bg-glacier-950 p-3 shadow-glass"
              style={{ maxHeight: placement.maxHeight }}
            >
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Saved configurations
              </p>

              {setups.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <BookmarkIcon className="h-6 w-6 text-slate-600" />
                  <p className="text-xs text-slate-500">
                    Nothing saved yet. Use &ldquo;Save Configuration&rdquo; to bookmark this loadout.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {setups.map((setup) => (
                    <li
                      key={setup.id}
                      className="rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/15"
                    >
                      {editingId === setup.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(event) => setEditValue(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') commitEdit();
                              if (event.key === 'Escape') setEditingId(null);
                            }}
                            maxLength={60}
                            className="focus-ring min-w-0 flex-1 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1.5 text-sm text-white"
                          />
                          <button
                            type="button"
                            onClick={commitEdit}
                            aria-label="Confirm rename"
                            className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-300 hover:bg-emerald-400/10"
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel rename"
                            className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10"
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{setup.name}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {formatTimestamp(setup.timestamp)} · {setup.recommendations.length} items · $
                                {setup.totalBestPrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(setup)}
                                aria-label={`Rename ${setup.name}`}
                                className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(setup.id)}
                                aria-label={`Delete ${setup.name}`}
                                className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-400/15 hover:text-rose-300"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {confirmDeleteId === setup.id ? (
                            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-rose-400/25 bg-rose-400/[0.06] px-2.5 py-1.5">
                              <span className="text-[11px] text-rose-200">Delete this setup?</span>
                              <span className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(setup.id)}
                                  className="rounded-md bg-rose-400/20 px-2 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-400/30"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleLoad(setup)}
                              className="focus-ring mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-frost-400/25 bg-frost-500/[0.08] py-1.5 text-xs font-semibold text-frost-200 transition-colors hover:border-frost-400/50 hover:bg-frost-500/15"
                            >
                              <RefreshIcon className="h-3.5 w-3.5" />
                              Reload this setup
                            </button>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
