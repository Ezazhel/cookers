import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  /** Called when the backdrop is tapped (only if `dismissible`). */
  onClose?: () => void;
  /** Allow closing by tapping the backdrop. Defaults to true. */
  dismissible?: boolean;
}

export const Modal = ({
  open,
  title,
  children,
  onClose,
  dismissible = true,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-center text-lg font-black text-gray-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};
