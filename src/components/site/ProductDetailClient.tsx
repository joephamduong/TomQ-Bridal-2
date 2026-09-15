"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMoneyFormatter } from "@/lib/settings-context";
import { useCartStore } from "@/store/cart";
import ProductCard from "@/components/site/ProductCard";
import type { ProductDetail, Product, ProductImage } from "@/lib/types";

export default function ProductDetailClient({
  product,
  related,
}: {
  product: ProductDetail;
  related: (Product & { primaryImage: ProductImage | null })[];
}) {
  const { t } = useLanguage();
  const formatMoney = useMoneyFormatter();
  const addItem = useCartStore((s) => s.addItem);

  const [activeImage, setActiveImage] = useState(0);
  const [material, setMaterial] = useState(product.materials[0]?.id ?? "");
  const [style, setStyle] = useState(product.styles[0]?.id ?? "");
  const [color, setColor] = useState(product.colors[0]?.id ?? "");
  const [size, setSize] = useState(product.sizes[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const extraTotal = useMemo(() => {
    let sum = 0;
    const m = product.materials.find((x) => x.id === material);
    const s = product.styles.find((x) => x.id === style);
    const c = product.colors.find((x) => x.id === color);
    if (m) sum += m.extraPrice;
    if (s) sum += s.extraPrice;
    if (c) sum += c.extraPrice;
    return sum;
  }, [material, style, color, product]);

  const finalPrice = product.price + extraTotal;

  const variantLabel = useMemo(() => {
    const parts: string[] = [];
    const m = product.materials.find((x) => x.id === material);
    const s = product.styles.find((x) => x.id === style);
    const c = product.colors.find((x) => x.id === color);
    const sz = product.sizes.find((x) => x.id === size);
    if (s) parts.push(s.name);
    if (m) parts.push(m.name);
    if (c) parts.push(c.name);
    if (sz) parts.push(`Size ${sz.label}`);
    return parts.join(" / ");
  }, [material, style, color, size, product]);

  const handleAddToCart = () => {
    addItem(
      {
        key: `${product.id}-${material}-${style}-${color}-${size}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.images[0]?.url || "",
        unitPrice: finalPrice,
        variantLabel: variantLabel || undefined,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const tryOnHref = `/thu-do-ai/${product.slug}${
    material || style || color ? `?material=${material}&style=${style}&color=${color}` : ""
  }`;

  return (
    <div className="container-narrow py-10 md:py-16">
      <div className="text-xs text-[var(--color-muted)] mb-8 flex gap-2">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link href={product.type === "BRIDE" ? "/san-pham/co-dau" : "/san-pham/chu-re"} className="hover:underline">
          {product.type === "BRIDE" ? t.nav.brideProducts : t.nav.groomProducts}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-dark)]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* GALLERY */}
        <div>
          <div className="aspect-[3/4] bg-[var(--color-secondary)] overflow-hidden mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                product.images[activeImage]?.url ||
                "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=1000&auto=format&fit=crop"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square overflow-hidden border-2 ${
                    idx === activeImage ? "border-[var(--color-primary)]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          {product.categoryName && (
            <p className="eyebrow mb-3">{product.categoryName}</p>
          )}
          <h1 className="font-heading text-3xl md:text-4xl text-[var(--color-dark)] mb-3">{product.name}</h1>
          <p className="text-xl text-[var(--color-primary)] mb-6">{formatMoney(finalPrice)}</p>
          {product.shortDescription && (
            <p className="text-[var(--color-muted)] leading-relaxed mb-8">{product.shortDescription}</p>
          )}

          <div className="space-y-6 mb-8">
            {product.styles.length > 0 && (
              <OptionGroup
                label={t.product.style}
                options={product.styles.map((s) => ({ id: s.id, label: s.name, extra: s.extraPrice }))}
                value={style}
                onChange={setStyle}
                formatMoney={formatMoney}
              />
            )}
            {product.materials.length > 0 && (
              <OptionGroup
                label={t.product.material}
                options={product.materials.map((m) => ({ id: m.id, label: m.name, extra: m.extraPrice }))}
                value={material}
                onChange={setMaterial}
                formatMoney={formatMoney}
              />
            )}
            {product.colors.length > 0 && (
              <div>
                <p className="text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">{t.product.color}</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      title={c.name}
                      className={`w-9 h-9 rounded-full border-2 ${
                        color === c.id ? "border-[var(--color-primary)]" : "border-[var(--color-line)]"
                      }`}
                      style={{ backgroundColor: c.hexCode }}
                    />
                  ))}
                </div>
              </div>
            )}
            {product.sizes.length > 0 && (
              <div>
                <p className="text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">{t.product.size}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSize(s.id)}
                      className={`min-w-[42px] px-3 py-2 text-sm border ${
                        size === s.id
                          ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]"
                          : "border-[var(--color-line)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[var(--color-line)]">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10">
                −
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10">
                +
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              {added ? "Đã thêm!" : t.product.addToCart}
            </button>
          </div>

          {product.isTryOnEnabled && (
            <Link href={tryOnHref} className="btn-accent w-full justify-center mb-8">
              <Sparkles className="w-4 h-4" />
              {t.product.tryOnAi}
            </Link>
          )}

          {product.description && (
            <div>
              <h2 className="font-heading text-xl mb-4">{t.product.description}</h2>
              <div className="prose-bridal" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20 pt-16 border-t border-[var(--color-line)]">
          <h2 className="font-heading text-2xl mb-8">{t.product.relatedProducts}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} image={p.primaryImage} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
  formatMoney,
}: {
  label: string;
  options: { id: string; label: string; extra: number }[];
  value: string;
  onChange: (id: string) => void;
  formatMoney: (n: number) => string;
}) {
  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-4 py-2 text-sm border ${
              value === o.id ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]" : "border-[var(--color-line)]"
            }`}
          >
            {o.label}
            {o.extra > 0 && <span className="opacity-70"> (+{formatMoney(o.extra)})</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
