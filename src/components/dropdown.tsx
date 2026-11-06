'use client';
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

/** Button + popover panel that closes on outside click and Escape. */
export function Dropdown({ label, active, children, align = 'left', className = 'pill', panelClass = 'w-64' }: {
  label: React.ReactNode; active?: boolean; children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: 'left' | 'right'; className?: string; panelClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <div ref={ref} className="relative">
      <button type="button" className={className} data-active={active ? 'true' : undefined} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        {label}
        <ChevronDown aria-hidden className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={panelId} onClick={(e) => { if ((e.target as HTMLElement).closest('a')) close(); }} className={`absolute z-40 mt-2 ${align === 'right' ? 'right-0' : 'left-0'} ${panelClass} rounded-2xl border border-line bg-white p-2 shadow-xl shadow-ink/5`}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}
