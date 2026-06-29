import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const STYLES = {
    success: { icon: CheckCircle, iconClass: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" },
    error: { icon: XCircle, iconClass: "text-red-600", border: "border-red-200", bg: "bg-red-50" },
    info: { icon: AlertCircle, iconClass: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50" },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              className={`${s.bg} border ${s.border} rounded-lg p-3.5 flex items-start gap-3 animate-slide-up shadow-sm`}
            >
              <Icon className={`${s.iconClass} shrink-0 mt-0.5`} size={15} />
              <p className="text-sm text-gray-800 flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
