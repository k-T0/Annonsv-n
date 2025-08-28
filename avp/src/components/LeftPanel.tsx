import React, { ChangeEvent } from "react";
import { Button } from "./ui/button";

type Props = {
  title: string;
  price: string;
  condition: string;
  onTitleChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onConditionChange: (v: string) => void;
  onFilesSelected: (files: File[]) => void;
};

const LeftPanel: React.FC<Props> = ({
  title, price, condition,
  onTitleChange, onPriceChange, onConditionChange, onFilesSelected
}) => {
  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    onFilesSelected(files);
  };

  return (
    <aside className="bg-neutral-850 rounded-2xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Annons & Utkast</h3>

      <div className="space-y-3">
        <label className="block text-sm text-neutral-300">Titel</label>
        <input
          className="w-full rounded p-2 bg-neutral-800 border border-neutral-700"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Exempel: iPhone 12 - Bra skick"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-neutral-300">Pris (SEK)</label>
            <input
              className="w-full rounded p-2 bg-neutral-800 border border-neutral-700"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              inputMode="numeric"
              placeholder="1299"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300">Skick</label>
            <select
              className="w-full rounded p-2 bg-neutral-800 border border-neutral-700"
              value={condition}
              onChange={(e) => onConditionChange(e.target.value)}
            >
              <option>Begagnad</option>
              <option>Nyskick</option>
              <option>Oanvänd</option>
              <option>Defekt</option>
            </select>
          </div>
        </div>

        <label className="block text-sm text-neutral-300">Bilder</label>
        <label className="h-36 rounded border-2 border-dashed border-neutral-700 flex items-center justify-center text-neutral-500 cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          Dra & släpp eller klicka för att lägga till bilder
        </label>

        <div className="flex gap-2 mt-2">
          <Button>Spara utkast</Button>
          <Button className="bg-transparent border border-red-500">Rensa</Button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-neutral-300 mb-2">Utkast</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li className="px-3 py-2 bg-neutral-800 rounded">Utkast: iPhone 12 — 1299 kr</li>
            <li className="px-3 py-2 bg-neutral-800 rounded">Utkast: Soffa — 4000 kr</li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel;
