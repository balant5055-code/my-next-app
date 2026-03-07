"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Props {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}

export default function InclusionBuilder({ title, items, onChange }: Props) {
  const addItem = () => {
    onChange([...items, ""]);
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3 border border-slate-600 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>

      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder="Enter inclusion"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
          />

          <button type="button" onClick={() => removeItem(index)}>
            <TrashIcon className="w-4 h-4 text-red-400" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-indigo-400"
      >
        <PlusIcon className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
}
