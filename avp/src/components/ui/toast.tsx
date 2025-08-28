import React, { createContext, useContext, useState } from "react";

type Toast = { id: number; msg: string };
type Ctx = (msg: string) => void;

const ToastCtx = createContext<Ctx>(() => {});

export const useToast = () => useContext(ToastCtx);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push: Ctx = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    // auto-remove after 2s
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
  };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="px-4 py-2 rounded-lg bg-white text-black shadow">
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
