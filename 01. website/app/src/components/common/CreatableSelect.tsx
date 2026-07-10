import { useState } from "react";
import { X } from "lucide-react";

export interface Option {
  id: string;
  name: string;
}

interface CreatableSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: Option[];
  onCreated: (option: Option) => void;
  create: (name: string) => Promise<Option>;
  placeholder: string;
  createLabel: string;
  error?: string;
}

const NEW_OPTION_VALUE = "__new__";

// A <select> that also lets the user create a new option inline (name-only, active by
// default) instead of leaving the current form to manage that lookup table separately.
export default function CreatableSelect({ value, onChange, options, onCreated, create, placeholder, createLabel, error }: CreatableSelectProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreate() {
    if (!newName.trim()) return;
    setSubmitting(true);
    setCreateError("");
    try {
      const created = await create(newName.trim());
      onCreated(created);
      onChange(created.id);
      setCreating(false);
      setNewName("");
    } catch {
      setCreateError("Gagal membuat data baru.");
    } finally {
      setSubmitting(false);
    }
  }

  if (creating) {
    return (
      <div>
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder={createLabel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting || !newName.trim()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#5B5FC7] hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName("");
              setCreateError("");
            }}
            className="px-3 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {createError && <p className="mt-1 text-xs text-rose-500 font-medium">{createError}</p>}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === NEW_OPTION_VALUE) {
          setCreating(true);
          return;
        }
        onChange(e.target.value);
      }}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
        error ? "border-rose-400" : "border-gray-300"
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
      <option value={NEW_OPTION_VALUE}>+ {createLabel}</option>
    </select>
  );
}
