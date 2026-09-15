"use client";

import Link from "next/link";
import { Sparkles, Ruler, HeartHandshake, Camera } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import ProductCard from "@/components/site/ProductCard";
import type { HomeContent } from "@/lib/types";
import type { Product, ProductImage } from "@/lib/types";
import type { BlogPost } from "@/lib/types";
import { formatDateVi } from "@/lib/utils";

type ProductWithImage = Product & { primaryImage: ProductImage | null };

export default function HomeClient({
  content,
  brideProducts,
  groomProducts,
  posts,
}: {
  content: HomeContent;
  brideProducts: ProductWithImage[];
  groomProducts: ProductWithImage[];
  posts: BlogPost[];
}) {
  const { t } = useLanguage();

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[86vh] min-h-[560px] flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.heroImageUrl}
          alt={content.heroTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
        <div className="container-narrow relative pb-20 text-white fade-in">
          <p className="eyebrow !text-white/80 mb-4">Bridal Atelier</p>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl max-w-3xl leading-[1.1] mb-6">
            {content.heroTitle}
          </h1>
          <p className="max-w-xl text-white/85 mb-8 leading-relaxed">{content.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dat-lich-hen" className="btn-accent">
              {t.home.heroCta}
            </Link>
            <Link href="/san-pham/co-dau" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-[var(--color-dark)]">
              {t.home.viewCollection}
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24">
        <div className="container-narrow grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="order-2 md:order-1">
            <p className="eyebrow mb-4">Bridal Atelier</p>
            <h2 className="font-heading text-3xl md:text-4xl mb-6 text-[var(--color-dark)]">
              {content.introTitle}
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed mb-8">{content.introBody}</p>
            <Link href="/ve-chung-toi" className="btn-outline">
              {t.nav.about}
            </Link>
          </div>
          <div className="order-1 md:order-2 aspect-[4/5] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.introImageUrl} alt={content.introTitle} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* FEATURED BRIDE */}
      {brideProducts.length > 0 && (
        <section className="py-16 bg-[var(--color-ivory)]">
          <div className="container-narrow">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="eyebrow mb-3">Bridal Collection</p>
                <h2 className="font-heading text-3xl text-[var(--color-dark)]">{t.home.featuredBride}</h2>
              </div>
              <Link href="/san-pham/co-dau" className="text-sm underline hidden sm:block">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {brideProducts.map((p) => (
                <ProductCard key={p.id} product={p} image={p.primaryImage} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED GROOM */}
      {groomProducts.length > 0 && (
        <section className="py-16">
          <div className="container-narrow">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="eyebrow mb-3">Groom Collection</p>
                <h2 className="font-heading text-3xl text-[var(--color-dark)]">{t.home.featuredGroom}</h2>
              </div>
              <Link href="/san-pham/chu-re" className="text-sm underline hidden sm:block">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {groomProducts.map((p) => (
                <ProductCard key={p.id} product={p} image={p.primaryImage} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="py-20 bg-[var(--color-dark)] text-white">
        <div className="container-narrow">
          <p className="eyebrow !text-[var(--color-accent)] text-center mb-3">Bridal Atelier</p>
          <h2 className="font-heading text-3xl text-center mb-14">{t.home.whyUs}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { icon: Ruler, title: "May đo riêng", desc: "Từng số đo được lấy tỉ mỉ để tạo nên form dáng hoàn hảo." },
              { icon: Sparkles, title: "Chất liệu cao cấp", desc: "Lựa chọn từ các loại vải, ren nhập khẩu cao cấp." },
              { icon: Camera, title: "Thử đồ bằng AI", desc: "Hình dung trước diện mạo của bạn trong chiếc áo mơ ước." },
              { icon: HeartHandshake, title: "Tư vấn tận tâm", desc: "Đồng hành cùng bạn từ buổi hẹn đầu tiên đến ngày cưới." },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full border border-white/25 flex items-center justify-center mx-auto mb-5">
                  <f.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-heading text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24">
        <div className="container-narrow grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="aspect-[4/5] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.storyImageUrl} alt={content.storyTitle} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-4">Since Day One</p>
            <h2 className="font-heading text-3xl md:text-4xl mb-6 text-[var(--color-dark)]">
              {content.storyTitle}
            </h2>
            <p className="text-[var(--color-muted)] leading-relaxed">{content.storyBody}</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[var(--color-secondary)]">
        <div className="container-narrow">
          <h2 className="font-heading text-3xl text-center mb-14 text-[var(--color-dark)]">
            {t.home.testimonialTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials.map((ts, i) => (
              <div key={i} className="bg-[var(--color-ivory)] p-8 shadow-[var(--shadow-soft)]">
                <p className="text-[var(--color-dark)]/85 italic leading-relaxed mb-5">&ldquo;{ts.quote}&rdquo;</p>
                <p className="font-heading text-[var(--color-primary)]">{ts.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      {posts.length > 0 && (
        <section className="py-20">
          <div className="container-narrow">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-heading text-3xl text-[var(--color-dark)]">{t.home.blogTitle}</h2>
              <Link href="/blog" className="text-sm underline hidden sm:block">
                {t.common.viewAll}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((p) => (
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
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-accent)] mb-2">
                      {p.categoryName}
                    </p>
                  )}
                  <h3 className="font-heading text-xl mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)]">{formatDateVi(p.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BAND */}
      <section className="py-20 bg-[var(--color-primary)] text-white text-center">
        <div className="container-narrow">
          <h2 className="font-heading text-3xl md:text-4xl mb-4">{t.home.ctaBandTitle}</h2>
          <p className="max-w-xl mx-auto text-white/85 mb-8">{t.home.ctaBandSubtitle}</p>
          <Link href="/dat-lich-hen" className="btn-accent">
            {t.nav.appointment}
          </Link>
        </div>
      </section>
    </div>
  );
}
