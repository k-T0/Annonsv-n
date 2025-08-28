import React from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/toast";

type Props = {
  title: string;
  priceDisplay: string;
  heroUrl: string | null;
};

const PreviewPanel: React.FC<Props> = ({ title, priceDisplay, heroUrl }) => {
  const toast = useToast();

  return (
    <section className="bg-neutral-850 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">Förhandsvisning</h3>
        <div className="text-sm text-neutral-400">Preview / Live</div>
      </div>

      <div className="mt-6 max-w-xl">
        <div className="bg-neutral-800 rounded-lg overflow-hidden shadow">
          <div className="h-44 bg-neutral-700 flex items-center justify-center text-neutral-400">
            {heroUrl ? (
              <img src={heroUrl} alt="Hero" className="h-full w-full object-cover" />
            ) : (
              "Huvudbild"
            )}
          </div>
          <div className="p-4">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-bold">{title || "—"}</h4>
              <div className="text-xl font-semibold">{priceDisplay}</div>
            </div>
            <p className="mt-2 text-sm text-neutral-300">
              Det här är en statisk förhandsvisning. Beskrivning här visar hur text bryts och ser ut i kortet.
            </p>

            <div className="mt-4 flex gap-2">
              <Button className="px-3 py-1 text-sm" onClick={() => toast("Titel kopierad!")}>Kopiera titel</Button>
              <Button className="px-3 py-1 text-sm" onClick={() => toast("Beskrivning kopierad!")}>Kopiera beskrivning</Button>
              <Button className="px-3 py-1 text-sm" onClick={() => toast("Markerad som såld")}>Markera som Såld</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewPanel;
