"use client";

import { useToastStore, ToastMessage } from "@/lib/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-emerald-500/30 dark:border-emerald-500/40";
      case "error":
        return "border-rose-500/30 dark:border-rose-500/40";
      case "warning":
        return "border-amber-500/30 dark:border-amber-500/40";
      case "info":
      default:
        return "border-blue-500/30 dark:border-blue-500/40";
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border ${getBorderColor()} bg-white/95 dark:bg-zinc-900/95 p-3.5 shadow-xl shadow-zinc-950/10 backdrop-blur transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
      role="status"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {toast.title}
          </span>
          {toast.description && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {toast.description}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="rounded-md p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
