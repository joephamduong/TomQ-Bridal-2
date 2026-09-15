import type { Metadata } from "next";
import Link from "next/link";
import { listBlogPosts, listBlogCategories } from "@/lib/repo/blog";
import { formatDateVi } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Góc chia sẻ cưới hỏi TomQ Bridal — tư vấn thời trang, xu hướng váy cưới, ý tưởng phong cách cho ngày trọng đại.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = listBlogCategories();
  const { items } = listBlogPosts({ categorySlug: category, limit: 30 });

  return (
    <div className="container-narrow py-14 md:py-20">
      <p className="eyebrow mb-3">TomQ Bridal</p>
      <h1 className="font-heading text-4xl mb-4 text-[var(--color-dark)]">Bridal Tips Blog</h1>
      <p className="text-[var(--color-muted)] max-w-2xl mb-10">
        Kiến thức thời trang, xu hướng váy cưới và những gợi ý phong cách được tuyển chọn dành riêng cho cô dâu chú
        rể.
      </p>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-12 border-b border-[var(--color-line)] pb-6">
          <Link
            href="/blog"
            className={`text-xs tracking-widest uppercase px-4 py-2 border ${
              !category ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]" : "border-[var(--color-line)]"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?category=${c.slug}`}
              className={`text-xs tracking-widest uppercase px-4 py-2 border ${
                category === c.slug ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]" : "border-[var(--color-line)]"
              }`}
            >
              {c.name} {c.postCount ? `(${c.postCount})` : ""}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-20">Chưa có bài viết nào trong chủ đề này.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {items.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-[var(--color-secondary)] mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.coverImageUrl || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {p.categoryName && (
                <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-accent)] mb-2">{p.categoryName}</p>
              )}
              <h2 className="font-heading text-xl mb-2 group-hover:text-[var(--color-primary)] transition-colors">{p.title}</h2>
              {p.excerpt && <p className="text-sm text-[var(--color-muted)] mb-2 line-clamp-2">{p.excerpt}</p>}
              <p className="text-xs text-[var(--color-muted)]">
                {formatDateVi(p.publishedAt)} · {p.readingMinutes} phút đọc
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
