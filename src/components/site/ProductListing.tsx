import Link from "next/link";
import { listProductsWithPrimaryImage, listCategories } from "@/lib/repo/catalog";
import ProductCard from "@/components/site/ProductCard";
import type { ProductType } from "@/lib/types";

export default function ProductListing({
  type,
  title,
  subtitle,
  categorySlug,
}: {
  type: ProductType;
  title: string;
  subtitle: string;
  categorySlug?: string;
}) {
  const categories = listCategories(type);
  const { items } = listProductsWithPrimaryImage({ type, categorySlug, limit: 60 });
  const basePath = type === "BRIDE" ? "/san-pham/co-dau" : "/san-pham/chu-re";

  return (
    <div>
      <section className="relative h-[42vh] min-h-[320px] flex items-end bg-[var(--color-dark)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            type === "BRIDE"
              ? "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=1800&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop"
          }
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="container-narrow relative pb-12 text-white">
          <p className="eyebrow !text-white/80 mb-3">TomQ Bridal</p>
          <h1 className="font-heading text-4xl md:text-5xl mb-3">{title}</h1>
          <p className="text-white/85 max-w-xl">{subtitle}</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-narrow">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10 border-b border-[var(--color-line)] pb-6">
              <Link
                href={basePath}
                className={`text-xs tracking-widest uppercase px-4 py-2 border ${
                  !categorySlug ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]" : "border-[var(--color-line)]"
                }`}
              >
                Tất cả
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`${basePath}?category=${c.slug}`}
                  className={`text-xs tracking-widest uppercase px-4 py-2 border ${
                    categorySlug === c.slug
                      ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]"
                      : "border-[var(--color-line)]"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <p className="text-center text-[var(--color-muted)] py-20">
              Chưa có sản phẩm nào trong danh mục này. Vui lòng quay lại sau.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} image={p.primaryImage} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
