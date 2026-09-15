"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({
  action,
  label,
  confirmText = "Bạn có chắc muốn xóa mục này?",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-neutral-400 hover:text-red-600 flex items-center gap-1 text-xs">
        <Trash2 className="w-3.5 h-3.5" /> {label}
      </button>
    </form>
  );
}
