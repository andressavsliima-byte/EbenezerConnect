import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    accent: 'bg-emerald-500/10 text-emerald-900 border-emerald-200',
    iconColor: 'text-emerald-500'
  },
  error: {
    icon: AlertTriangle,
    accent: 'bg-rose-500/10 text-rose-900 border-rose-200',
    iconColor: 'text-rose-500'
  },
  info: {
    icon: Info,
    accent: 'bg-sky-500/10 text-sky-900 border-sky-200',
    iconColor: 'text-sky-500'
  }
};

export default function FeedbackDialog({
  open,
  type = 'info',
  title = '',
  message = '',
  autoClose = 3000,
  onClose
}) {
  const variant = VARIANTS[type] || VARIANTS.info;
  const Icon = variant.icon;

  useEffect(() => {
    if (!open || !autoClose) return;
    const handle = setTimeout(() => {
      onClose?.();
    }, autoClose);
    return () => clearTimeout(handle);
  }, [open, autoClose, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div
        className={`w-full max-w-sm rounded-2xl border shadow-xl backdrop-blur-sm ${variant.accent}`}
      >
        <div className="flex flex-col gap-4 px-6 py-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-inner">
            <Icon className={`h-6 w-6 ${variant.iconColor}`} />
          </div>
          <div className="space-y-1">
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {message && <p className="text-sm leading-relaxed text-gray-700">{message}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mx-auto rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
