"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { lookupOrderOrTryOn } from "@/app/actions/public";

const initialState = { ok: false, message: undefined, redirectTo: undefined } as {
  ok: boolean;
  message?: string;
  redirectTo?: string;
};

export default function LookupPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(lookupOrderOrTryOn, initialState);

  useEffect(() => {
    if (state.ok && state.redirectTo) router.push(state.redirectTo);
  }, [state, router]);

  return (
    <div className="container-narrow py-20 max-w-lg">
      <p className="eyebrow mb-3">TomQ Bridal</p>
      <h1 className="font-heading text-3xl mb-4 text-[var(--color-dark)] flex items-center gap-3">
        <Search className="w-7 h-7 text-[var(--color-accent)]" />
        Tra cứu đơn hàng
      </h1>
      <p className="text-[var(--color-muted)] mb-8">
        Nhập mã đơn hàng (bắt đầu bằng <strong>BA...</strong>) hoặc mã yêu cầu thử đồ AI (bắt đầu bằng{" "}
        <strong>TO...</strong>) cùng số điện thoại đã dùng khi đặt để xem tình trạng.
      </p>

      <form action={formAction} className="space-y-5 bg-[var(--color-ivory)] border border-[var(--color-line)] p-8">
        <div>
          <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">Mã đơn hàng / mã yêu cầu</label>
          <input name="code" required className="w-full border border-[var(--color-line)] px-4 py-3 text-sm uppercase" placeholder="BA260915-AB12" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">Số điện thoại</label>
          <input name="phone" required className="w-full border border-[var(--color-line)] px-4 py-3 text-sm" />
        </div>
        {!state.ok && state.message && <p className="text-sm text-[var(--color-danger)]">{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-60">
          {pending ? "Đang tra cứu..." : "Tra cứu"}
        </button>
      </form>
    </div>
  );
}
