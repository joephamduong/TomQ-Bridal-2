"use client";

import { useRef, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";

export default function MultiImageUpload({
  name,
  label,
  defaultValues = [],
  subdir = "products",
}: {
  name: string;
  label: string;
  defaultValues?: string[];
  subdir?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValues);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("subdir", subdir);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok) setUrls((prev) => [...prev, json.url]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs text-neutral-500 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, idx) => (
          <div key={idx} className="relative w-24 h-28 bg-neutral-100 border border-neutral-200 overflow-hidden group">
            <input type="hidden" name={name} value={url} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setUrls((prev) => prev.filter((_, i) => i !== idx))}
              className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-24 h-28 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-500"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <p className="text-xs text-neutral-400 mt-2">Ảnh đầu tiên sẽ là ảnh đại diện sản phẩm.</p>
    </div>
  );
}
