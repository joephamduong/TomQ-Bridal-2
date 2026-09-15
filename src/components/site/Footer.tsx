"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { SiteSettings } from "@/lib/types";

// lucide-react không còn cung cấp icon thương hiệu (Facebook/Instagram...) do chính sách bản quyền,
// nên dùng SVG đơn giản tự vẽ thay thế.
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.5-1.5H16.5V4.3C16.2 4.26 15.2 4.17 14 4.17c-2.4 0-4 1.46-4 4.13V10.5H7.5v3H10V21h3.5z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[var(--color-dark)] text-[#e9e3da] mt-24">
      <div className="container-narrow py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-heading text-2xl text-white mb-4">{settings.siteName}</h3>
          <p className="text-sm text-[#c7bfb3] leading-relaxed">
            {settings.siteName} — nơi hội tụ của thiết kế couture tinh xảo và trải nghiệm thử áo cưới
            hiện đại bằng công nghệ AI, dành riêng cho ngày trọng đại của bạn.
          </p>
          <div className="flex gap-3 mt-5">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-[#4a443c] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors">
                <FacebookIcon />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-[#4a443c] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors">
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4">
            {t.nav.home}
          </h4>
          <ul className="space-y-2.5 text-sm text-[#c7bfb3]">
            <li><Link href="/san-pham/co-dau" className="hover:text-white">{t.nav.brideProducts}</Link></li>
            <li><Link href="/san-pham/chu-re" className="hover:text-white">{t.nav.groomProducts}</Link></li>
            <li><Link href="/ve-chung-toi" className="hover:text-white">{t.nav.about}</Link></li>
            <li><Link href="/blog" className="hover:text-white">{t.nav.blog}</Link></li>
            <li><Link href="/dat-lich-hen" className="hover:text-white">{t.nav.appointment}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4">
            {t.nav.contact}
          </h4>
          <ul className="space-y-3 text-sm text-[#c7bfb3]">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {settings.address}</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {settings.phone}</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> {settings.email}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4">
            {t.nav.lookup}
          </h4>
          <p className="text-sm text-[#c7bfb3] mb-3">
            Tra cứu tình trạng đơn hàng hoặc yêu cầu thử đồ AI của bạn.
          </p>
          <Link href="/tra-cuu-don-hang" className="text-sm underline text-white">
            {t.nav.lookup} →
          </Link>
        </div>
      </div>
      <div className="border-t border-[#4a443c]">
        <div className="container-narrow py-5 text-xs text-[#94897a] flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</span>
          <Link href="/admin/login" className="hover:text-white">Quản trị</Link>
        </div>
      </div>
    </footer>
  );
}
