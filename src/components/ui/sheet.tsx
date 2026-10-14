'use client';

// Adapted from shadcn/ui Sheet (MIT); see docs/ui-components.md and THIRD_PARTY_NOTICES.md.
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

export function SheetContent({
  children,
  className = '',
  side = 'right',
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof Dialog.Content> & {
  children: ReactNode;
  side?: 'left' | 'right';
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="sheet-overlay" />
      <Dialog.Content
        {...props}
        className={`sheet-content sheet-${side} ${className}`}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {children}
        <Dialog.Close
          className="icon-button sheet-close"
          aria-label="Close panel"
        >
          <X size={20} />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
