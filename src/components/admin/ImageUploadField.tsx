"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

// Trường tải ảnh dùng chung trong toàn bộ trang Admin. Sau khi upload thành công, giá trị URL
// được lưu vào 1 input ẩn (name={name}) để submit cùng phần còn lại của form (form thường dùng
// Server Action truyền thống, không phải AJAX).
export default function ImageUploadField({
  name,
  label,
  defaultValue,
  subdir = "admin",
  aspect = "aspect-square",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  subdir?: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("subdir", subdir);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi upload");
      setUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-neutral-500 block mb-2">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-4">
        <div className={`${aspect} w-32 bg-neutral-100 border border-neutral-200 overflow-hidden relative shrink-0`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <Upload className="w-6 h-6" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs border border-neutral-300 px-3 py-2 hover:bg-neutral-50"
          >
            {url ? "Đổi ảnh" : "Chọn ảnh"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-xs text-red-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Xóa ảnh
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
