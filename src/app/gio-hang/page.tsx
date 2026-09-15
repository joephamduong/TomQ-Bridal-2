"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMoneyFormatter } from "@/lib/settings-context";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const { t } = useLanguage();
  const formatMoney = useMoneyFormatter();
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <div className="container-narrow py-14 md:py-20">
      <h1 className="font-heading text-3xl md:text-4xl mb-10 text-[var(--color-dark)]">{t.cart.title}</h1>

      {lines.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--color-muted)] mb-6">{t.cart.empty}</p>
          <Link href="/san-pham/co-dau" className="btn-primary">
            {t.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 divide-y divide-[var(--color-line)]">
            {lines.map((line) => (
              <div key={line.key} className="flex gap-5 py-6">
                <div className="w-24 h-28 bg-[var(--color-secondary)] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {line.imageUrl && <img src={line.imageUrl} alt={line.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/san-pham/${line.slug}`} className="font-heading text-lg hover:text-[var(--color-primary)]">
                        {line.name}
                      </Link>
                      {line.variantLabel && (
                        <p className="text-xs text-[var(--color-muted)] mt-1">{line.variantLabel}</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(line.key)} className="text-[var(--color-muted)] hover:text-[var(--color-danger)]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-[var(--color-line)]">
                      <button
                        onClick={() => updateQuantity(line.key, line.quantity - 1)}
                        className="w-8 h-8 text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.key, line.quantity + 1)}
                        className="w-8 h-8 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-medium">{formatMoney(line.unitPrice * line.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-secondary)] p-8 h-fit">
            <h2 className="font-heading text-xl mb-6">{t.cart.subtotal}</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>{t.cart.subtotal}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <p className="text-xs text-[var(--color-muted)] mb-6">Phí vận chuyển sẽ được tính ở bước thanh toán.</p>
            <Link href="/thanh-toan" className="btn-primary w-full justify-center">
              {t.cart.checkout}
            </Link>
            <Link href="/san-pham/co-dau" className="block text-center text-sm mt-4 underline">
              {t.cart.continueShopping}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
