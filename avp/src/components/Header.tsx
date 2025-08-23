import React from "react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="border-b border-neutral-800 p-4 bg-neutral-900/60">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center font-bold">AV</div>
          <div>
            <div className="text-xl font-bold">AnnonsVän Pro</div>
            <div className="text-xs text-neutral-400">Studio</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-transparent border border-neutral-600">Quick Sell</Button>
          <Button className="bg-rose-600">Pro Mode</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
