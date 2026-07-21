"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type ToastType = "default" | "success" | "error" | "warning";
interface ToastState {
  msg: string;
  type: ToastType;
  visible: boolean;
}

const ToastContext = createContext<(msg: string, type?: ToastType) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ msg: "", type: "default", visible: false });

  const showToast = useCallback((msg: string, type: ToastType = "default") => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  }, []);

  const colors: Record<ToastType, string> = {
    default: "#0D0D0D",
    success: "#1A7A4A",
    error: "#CC3300",
    warning: "#C47B00",
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast ${toast.visible ? "show" : ""}`} style={{ background: colors[toast.type] }}>
        {toast.msg}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
