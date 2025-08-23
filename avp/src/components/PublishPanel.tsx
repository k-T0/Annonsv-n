import React from "react";
import { Button } from "./ui/button"; // use relative path to avoid alias issues

const MarketCard: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="bg-neutral-800 rounded-lg p-3 flex items-center justify-between">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-neutral-400">Status: Ej publicerad</div>
      </div>
      <div className="flex flex-col gap-2">
        <Button className="px-3 py-1 text-sm">Öppna</Button>
        <Button className="px-3 py-1 text-sm bg-emerald-600">Klar</Button>
      </div>
    </div>
  );
};

const PublishPanel: React.FC = () => {
  return (
    <aside className="bg-neutral-850 rounded-2xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Publicera</h3>

      <div className="space-y-3">
        <MarketCard name="Tradera" />
        <MarketCard name="Blocket" />
        <MarketCard name="Facebook Marketplace" />
        <MarketCard name="eBay" />
      </div>

      <div className="mt-6">
        <div className="text-sm text-neutral-400 mb-2">Total progress</div>
        <div className="w-full h-3 bg-neutral-800 rounded">
          <div className="h-3 w-[22%] bg-emerald-600 rounded" />
        </div>
      </div>
    </aside>
  );
};

export default PublishPanel;
