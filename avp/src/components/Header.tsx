import React from "react";
import { Button } from "./ui/button";

type Props = {
  mode: "quick" | "pro";
  onModeChange: (m: "quick" | "pro") => void;
};

const Header: React.FC<Props> = ({ mode, onModeChange }) => {
  const pill =
    "rounded-full px-4 py-2 border transition";
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
          <button
            className={`${pill} ${mode === "quick" ? "bg-white/10 border-white/20" : "bg-transparent border-neutral-600"}`}
            onClick={() => onModeChange("quick")}
          >
            Quick Sell
          </button>
          <Button
            className={`${mode === "pro" ? "bg-rose-600" : "bg-transparent border border-neutral-600"}`}
            onClick={() => onModeChange("pro")}
          >
            Pro Mode
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
