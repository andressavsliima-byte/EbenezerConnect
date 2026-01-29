import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const variantStyles = {
  success: {
    gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white',
    ring: 'ring-emerald-300/40',
    progress: 'bg-emerald-300/70',
    Icon: CheckCircle,
  },
  error: {
    gradient: 'bg-gradient-to-br from-red-600 to-red-500 text-white',
    ring: 'ring-red-300/40',
    progress: 'bg-red-300/70',
    Icon: AlertCircle,
  },
  info: {
    gradient: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white',
    ring: 'ring-gray-300/25',
    progress: 'bg-gray-300/50',
    Icon: Info,
  },
};

export default function Toast({ type = 'info', message, onClose, duration = 5000 }) {
  const [visible, setVisible] = useState(Boolean(message));
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      setProgress(0);
      cancelAnimationFrame(rafRef.current);
      return;
    }
    setVisible(true);
    startRef.current = performance.now();
    const step = (now) => {
      if (hovered) {
        // Pause timer when hovered
        startRef.current = now - elapsedRef.current;
      } else {
        elapsedRef.current = now - startRef.current;
        const pct = Math.min(100, (elapsedRef.current / duration) * 100);
        setProgress(pct);
        if (pct >= 100) {
          setVisible(false);
          setTimeout(() => onClose?.(), 200);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      elapsedRef.current = 0;
    };
  }, [message, duration, hovered, onClose]);

  if (!message || !visible) return null;

  const { gradient, ring, progress: progressClass, Icon } = variantStyles[type] || variantStyles.info;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 pointer-events-auto`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`min-w-[280px] max-w-[380px] px-4 py-3 rounded-2xl shadow-2xl ${gradient} ring-1 ${ring} backdrop-blur-sm 
        transition transform duration-300 ease-out 
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm font-medium leading-snug">
            {message}
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 200); }}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className={`h-full ${progressClass}`}
            style={{ width: `${progress}%`, transition: 'width 120ms linear' }}
          />
        </div>
      </div>
    </div>
  );
}
