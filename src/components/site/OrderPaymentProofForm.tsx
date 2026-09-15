"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { uploadOrderPaymentProof } from "@/app/actions/public";

export default function OrderPaymentProofForm({ orderId, hasProof }: { orderId: string; hasProof: boolean }) {
  const [submitted, setSubmitted] = useState(hasProof);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
        <CheckCircle2 className="w-5 h-5" />
        Đã gửi minh chứng chuyển khoản. Cửa hàng sẽ xác nhận và liên hệ với bạn sớm.
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const formData = new FormData(e.currentTarget);
        const result = await uploadOrderPaymentProof(orderId, formData);
        setMessage(result.message || "");
        if (result.ok) setSubmitted(true);
        setPending(false);
      }}
      className="space-y-3"
    >
      <label className="text-sm font-medium block">
        Đã chuyển khoản? Tải lên ảnh chụp màn hình giao dịch để chúng tôi xác nhận nhanh hơn:
      </label>
      <input
        type="file"
        name="proof"
        accept="image/*"
        required
        className="block w-full text-sm border border-[var(--color-line)] p-2"
      />
      {message && <p className="text-xs text-[var(--color-danger)]">{message}</p>}
      <button type="submit" disabled={pending} className="btn-outline !py-2.5 disabled:opacity-60">
        <Upload className="w-4 h-4" />
        {pending ? "Đang gửi..." : "Gửi minh chứng chuyển khoản"}
      </button>
    </form>
  );
}
