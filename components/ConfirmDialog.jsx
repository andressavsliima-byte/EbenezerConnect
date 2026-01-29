import { X, XCircle, AlertTriangle, Info } from 'lucide-react';

const VARIANTS = {
  danger: {
    icon: XCircle,
    iconWrapper: 'bg-rose-50',
    iconColor: 'text-rose-500',
    confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white'
  },
  warning: {
    icon: AlertTriangle,
    iconWrapper: 'bg-amber-50',
    iconColor: 'text-amber-500',
    confirmButton: 'bg-amber-500 hover:bg-amber-600 text-white'
  },
  info: {
    icon: Info,
    iconWrapper: 'bg-sky-50',
    iconColor: 'text-sky-500',
    confirmButton: 'bg-sky-500 hover:bg-sky-600 text-white'
  }
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  const tone = destructive ? 'danger' : variant;
  const config = VARIANTS[tone] || VARIANTS.danger;
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!loading) onCancel?.();
      }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-[0_24px_60px_-18px_rgba(15,118,110,0.35)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-6 px-8 pb-8 pt-10 text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${config.iconWrapper}`}>
            <Icon className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          <div className="space-y-3">
            {title && <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>}
            {message && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{message}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${config.confirmButton}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
