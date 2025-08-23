import React from "react";
import Header from "@/components/Header";
import LeftPanel from "@/components/LeftPanel";
import PreviewPanel from "@/components/PreviewPanel";
import PublishPanel from "@/components/PublishPanel";

export default function App() {
  return (
    <div className="min-h-svh bg-neutral-900 text-white">
      <Header />
      <main className="max-w-[1400px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)_360px] gap-6">
          <div className="space-y-4">
            <LeftPanel />
          </div>

          <div className="space-y-4">
            <PreviewPanel />
          </div>

          <div className="space-y-4">
            <PublishPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
