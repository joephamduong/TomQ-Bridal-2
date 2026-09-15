"use client";

import { useActionState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/lib/settings-context";
import { submitContact, type ActionState } from "@/app/actions/public";

const initialState: ActionState = { ok: false };

export default function ContactPage() {
  const settings = useSiteSettings();
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  return (
    <div className="container-narrow py-14 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <p className="eyebrow mb-3">TomQ Bridal</p>
          <h1 className="font-heading text-4xl mb-6 text-[var(--color-dark)]">Liên hệ với chúng tôi</h1>
          <p className="text-[var(--color-muted)] leading-relaxed mb-8">
            Có câu hỏi về sản phẩm, dịch vụ may đo hoặc trải nghiệm thử đồ AI? Hãy để lại lời nhắn, đội ngũ TomQ
            Bridal sẽ phản hồi bạn trong thời gian sớm nhất.
          </p>
          <div className="space-y-4 text-sm">
            <p className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-[var(--color-accent)]" /> {settings.address}</p>
            <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-[var(--color-accent)]" /> {settings.phone}</p>
            <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-[var(--color-accent)]" /> {settings.email}</p>
          </div>
        </div>

        <div className="bg-[var(--color-ivory)] border border-[var(--color-line)] p-8">
          {state.ok ? (
            <p className="text-center py-10 text-[var(--color-dark)]">{state.message}</p>
          ) : (
            <form action={formAction} className="space-y-5">
              <Field label="Họ và tên" name="name" required />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại" name="phone" />
                <Field label="Email" name="email" type="email" />
              </div>
              <Field label="Chủ đề" name="subject" />
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
                  Nội dung <span className="text-[var(--color-danger)]">*</span>
                </label>
                <textarea name="message" rows={5} required className="w-full border border-[var(--color-line)] px-4 py-3 text-sm" />
              </div>
              {!state.ok && state.message && <p className="text-sm text-[var(--color-danger)]">{state.message}</p>}
              <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-60">
                {pending ? "Đang gửi..." : "Gửi liên hệ"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, required, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full border border-[var(--color-line)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}
