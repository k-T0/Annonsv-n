import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import PreviewPanel from "./components/PreviewPanel";
import PublishPanel from "./components/PublishPanel";
import { ToastProvider } from "./components/ui/toast";
import { formatSEK } from "./lib/format";

type Mode = "quick" | "pro";

export default function App() {
  const [mode, setMode] = useState<Mode>("pro");

  const [title, setTitle] = useState("iPhone 12 - Bra skick");
  const [price, setPrice] = useState("1299");
  const [condition, setCondition] = useState("Begagnad");

  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  // keep URLs tidy
  useEffect(() => {
    return () => {
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
    };
  }, []);

  const handleFiles = (files: File[]) => {
    if (!files?.length) return;
    const url = URL.createObjectURL(files[0]);
    if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
    lastUrlRef.current = url;
    setHeroUrl(url);
  };

  const priceDisplay = useMemo(() => {
    const n = Number(String(price).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? formatSEK(n) : "—";
  }, [price]);

  return (
    <ToastProvider>
      <div className="min-h-svh bg-neutral-900 text-white">
        <Header mode={mode} onModeChange={setMode} />

        <main className="max-w-[1400px] mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)_360px] gap-6">
            <div className="space-y-4">
              <LeftPanel
                title={title}
                price={price}
                condition={condition}
                onTitleChange={setTitle}
                onPriceChange={setPrice}
                onConditionChange={setCondition}
                onFilesSelected={handleFiles}
              />
            </div>

            <div className="space-y-4">
              <PreviewPanel
                title={title}
                priceDisplay={priceDisplay}
                heroUrl={heroUrl}
              />
            </div>

            <div className="space-y-4">
              <PublishPanel />
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}