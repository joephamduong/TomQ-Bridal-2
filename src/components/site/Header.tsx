"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCartStore } from "@/store/cart";
import type { SiteSettings } from "@/lib/types";

export default function Header({ settings }: { settings: SiteSettings }) {
  const { t, locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin) return null;

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/san-pham/co-dau", label: t.nav.brideProducts },
    { href: "/san-pham/chu-re", label: t.nav.groomProducts },
    { href: "/blog", label: t.nav.blog },
    { href: "/ve-chung-toi", label: t.nav.about },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[var(--color-ivory)] shadow-sm" : "bg-[var(--color-ivory)]/90 backdrop-blur"
      } border-b border-[var(--color-line)]`}
    >
      <div className="container-narrow flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt={settings.siteName} className="h-10 w-auto" />
          ) : (
            <span className="font-heading text-2xl tracking-wide text-[var(--color-dark)]">
              {settings.siteName}
            </span>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] tracking-[0.08em] uppercase text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <button
            onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
            className="text-xs tracking-widest font-semibold text-[var(--color-muted)] hover:text-[var(--color-primary)] border border-[var(--color-line)] rounded-full px-3 py-1.5"
            aria-label="Switch language"
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>
          <Link
            href="/tra-cuu-don-hang"
            className="text-[13px] tracking-[0.06em] uppercase text-[var(--color-dark)] hover:text-[var(--color-primary)]"
          >
            {t.nav.lookup}
          </Link>
          <Link
            href="/dat-lich-hen"
            className="btn-primary !py-2.5 !px-5 !text-[11px]"
          >
            {t.nav.appointment}
          </Link>
          <Link href="/gio-hang" className="relative">
            <ShoppingBag className="w-5 h-5 text-[var(--color-dark)]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <Link href="/gio-hang" className="relative">
            <ShoppingBag className="w-5 h-5 text-[var(--color-dark)]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[var(--color-line)] bg-[var(--color-ivory)]">
          <div className="container-narrow py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-3 text-sm uppercase tracking-wide border-b border-[var(--color-line)]/60"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/tra-cuu-don-hang" className="py-3 text-sm uppercase tracking-wide border-b border-[var(--color-line)]/60">
              {t.nav.lookup}
            </Link>
            <Link href="/dat-lich-hen" className="btn-primary mt-4 justify-center">
              {t.nav.appointment}
            </Link>
            <button
              onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
              className="mt-4 text-xs tracking-widest font-semibold text-[var(--color-muted)] border border-[var(--color-line)] rounded-full px-3 py-2 self-start flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" /> {locale === "vi" ? "English" : "Tiếng Việt"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
