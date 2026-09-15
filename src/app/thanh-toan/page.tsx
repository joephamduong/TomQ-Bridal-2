"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMoneyFormatter, useSiteSettings } from "@/lib/settings-context";
import { useCartStore } from "@/store/cart";
import { submitOrder } from "@/app/actions/public";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const formatMoney = useMoneyFormatter();
  const settings = useSiteSettings();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    shippingAddress: "",
    shippingCity: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shippingFee = subtotal >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.defaultShippingFee;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.phone || !form.shippingAddress) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (lines.length === 0) {
      setError("Giỏ hàng của bạn đang trống.");
      return;
    }
    setSubmitting(true);
    try {
      await submitOrder({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        shippingAddress: form.shippingAddress,
        shippingCity: form.shippingCity || undefined,
        note: form.note || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          productName: l.name,
          variantLabel: l.variantLabel,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
        })),
      });
      clear();
    } catch (err) {
      // redirect() từ server action ném lỗi đặc biệt NEXT_REDIRECT để điều hướng — không phải lỗi thật
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError("Có lỗi xảy ra, vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container-narrow py-24 text-center">
        <p className="text-[var(--color-muted)] mb-6">{t.cart.empty}</p>
        <Link href="/san-pham/co-dau" className="btn-primary">
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
      {/* LEFT 50% — Thông tin khách hàng */}
      <div className="px-6 sm:px-12 lg:px-16 py-14">
        <Link href="/gio-hang" className="text-xs uppercase tracking-widest text-[var(--color-muted)] hover:underline">
          ← {t.cart.title}
        </Link>
        <h1 className="font-heading text-3xl mt-4 mb-8 text-[var(--color-dark)]">{t.checkout.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <h2 className="text-sm uppercase tracking-widest text-[var(--color-accent)]">{t.checkout.customerInfo}</h2>
          <Field label={t.checkout.fullName} required value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label={t.checkout.phone} required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label={t.checkout.email} value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Field label={t.checkout.address} required value={form.shippingAddress} onChange={(v) => setForm({ ...form, shippingAddress: v })} />
          <Field label={t.checkout.city} value={form.shippingCity} onChange={(v) => setForm({ ...form, shippingCity: v })} />
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">{t.checkout.note}</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="w-full border border-[var(--color-line)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60">
            {submitting ? t.common.loading : t.checkout.submitOrder}
          </button>
        </form>
      </div>

      {/* RIGHT 50% — Tóm tắt đơn hàng + thanh toán */}
      <div className="bg-[var(--color-secondary)] px-6 sm:px-12 lg:px-16 py-14">
        <h2 className="font-heading text-xl mb-6">{t.checkout.orderSummary}</h2>
        <div className="divide-y divide-black/10 mb-6">
          {lines.map((l) => (
            <div key={l.key} className="flex gap-4 py-4">
              <div className="w-16 h-20 bg-white overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.imageUrl && <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{l.name}</p>
                {l.variantLabel && <p className="text-xs text-[var(--color-muted)]">{l.variantLabel}</p>}
                <p className="text-xs text-[var(--color-muted)]">SL: {l.quantity}</p>
              </div>
              <p className="text-sm">{formatMoney(l.unitPrice * l.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm border-t border-black/10 pt-4">
          <div className="flex justify-between">
            <span>{t.cart.subtotal}</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.checkout.shippingFee}</span>
            <span>{shippingFee === 0 ? "Miễn phí" : formatMoney(shippingFee)}</span>
          </div>
          <div className="flex justify-between font-heading text-lg pt-2 border-t border-black/10 mt-2">
            <span>{t.checkout.total}</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
        {settings.freeShippingThreshold > 0 && (
          <p className="text-xs text-[var(--color-muted)] mt-3">
            {t.checkout.freeShippingNote} {formatMoney(settings.freeShippingThreshold)}
          </p>
        )}

        <div className="mt-8 bg-[var(--color-ivory)] p-6">
          <h3 className="text-sm uppercase tracking-widest text-[var(--color-accent)] mb-3">
            {t.checkout.paymentMethod}: {t.checkout.bankTransfer}
          </h3>
          <p className="text-xs text-[var(--color-muted)] mb-4">
            Sau khi đặt hàng, bạn sẽ nhận được thông tin chuyển khoản đầy đủ và mã đơn hàng để tự chuyển khoản. Đơn
            hàng sẽ được xử lý sau khi cửa hàng xác nhận đã nhận thanh toán.
          </p>
          <BankInfoRow label="Ngân hàng" value={settings.bankName || "—"} />
          <BankInfoRow label="Chủ tài khoản" value={settings.bankAccountName} />
          <BankInfoRow label="Số tài khoản" value={settings.bankAccountNumber} />
          {settings.bankBsb && <BankInfoRow label="BSB" value={settings.bankBsb} />}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-[var(--color-line)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}

function BankInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-[var(--color-line)] last:border-0">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
