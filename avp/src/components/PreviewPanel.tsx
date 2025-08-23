import React from "react";
import { Button } from "@/components/ui/button";

const PreviewPanel: React.FC = () => {
  return (
    <section className="bg-neutral-850 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">Förhandsvisning</h3>
        <div className="text-sm text-neutral-400">Preview / Live</div>
      </div>

      <div className="mt-6 max-w-xl">
        <div className="bg-neutral-800 rounded-lg overflow-hidden shadow">
          <div className="h-44 bg-neutral-700 flex items-center justify-center text-neutral-400">Huvudbild</div>
          <div className="p-4">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-bold">iPhone 12 - Bra skick</h4>
              <div className="text-xl font-semibold">1 299 kr</div>
            </div>
            <p className="mt-2 text-sm text-neutral-300">
              Det här är en statisk förhandsvisning. Beskrivning här visar hur text bryts och ser ut i kortet.
            </p>

            <div className="mt-4 flex gap-2">
              <Button className="px-3 py-1 text-sm">Kopiera titel</Button>
              <Button className="px-3 py-1 text-sm">Kopiera beskrivning</Button>
              <Button className="px-3 py-1 text-sm">Markera som Såld</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewPanel;
