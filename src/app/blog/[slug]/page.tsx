import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/repo/blog";
import { extractToc, formatDateVi } from "@/lib/utils";
import { getSiteSettings } from "@/lib/repo/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post || !post.isPublished) notFound();

  const toc = extractToc(post.contentHtml);
  const related = getRelatedPosts(post.categoryId, post.id, 3);
  const settings = getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: settings.siteName },
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/blog/${post.slug}`,
  };

  return (
    <div className="container-narrow py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto mb-10">
        {post.categoryName && (
          <Link href={`/blog?category=${post.categorySlug}`} className="eyebrow mb-4 inline-block">
            {post.categoryName}
          </Link>
        )}
        <h1 className="font-heading text-3xl md:text-4xl mb-4 text-[var(--color-dark)]">{post.title}</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {post.author} · {formatDateVi(post.publishedAt)} · {post.readingMinutes} phút đọc
        </p>
      </div>

      {post.coverImageUrl && (
        <div className="max-w-4xl mx-auto aspect-[16/9] overflow-hidden mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 max-w-5xl mx-auto">
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-4">Mục lục</p>
              <nav className="space-y-2 text-sm">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block hover:text-[var(--color-primary)] ${
                      item.level === 3 ? "pl-4 text-[var(--color-muted)]" : "text-[var(--color-dark)]"
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article className="prose-bridal max-w-2xl" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </div>

      {related.length > 0 && (
        <div className="max-w-5xl mx-auto mt-20 pt-16 border-t border-[var(--color-line)]">
          <h2 className="font-heading text-2xl mb-8">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden bg-[var(--color-secondary)] mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.coverImageUrl || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="font-heading text-lg group-hover:text-[var(--color-primary)]">{p.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
