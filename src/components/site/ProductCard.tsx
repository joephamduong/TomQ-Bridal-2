"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMoneyFormatter } from "@/lib/settings-context";
import type { Product, ProductImage } from "@/lib/types";

export default function ProductCard({
  product,
  image,
}: {
  product: Product;
  image?: ProductImage | null;
}) {
  const { t } = useLanguage();
  const formatMoney = useMoneyFormatter();
  return (
    <Link href={`/san-pham/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-secondary)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image?.url || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=800&auto=format&fit=crop"}
          alt={image?.alt || product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isNew && (
            <span className="bg-[var(--color-dark)] text-white text-[10px] tracking-widest uppercase px-2.5 py-1">
              {t.product.new}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[var(--color-accent)] text-white text-[10px] tracking-widest uppercase px-2.5 py-1">
              {t.product.featured}
            </span>
          )}
        </div>
      </div>
      <div className="pt-4 pb-1">
        {product.categoryName && (
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted)] mb-1">
            {product.categoryName}
          </p>
        )}
        <h3 className="font-heading text-lg text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-[var(--color-muted)] mt-1">{formatMoney(product.price)}</p>
      </div>
    </Link>
  );
}
