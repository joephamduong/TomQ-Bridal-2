import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/repo/settings";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SiteSettingsProvider } from "@/lib/settings-context";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

// Toàn bộ nội dung site được quản lý qua trang Admin (sản phẩm, bài blog, cài đặt...) và lưu trong
// SQLite — vì vậy cần render động theo từng request thay vì cache tĩnh lúc build, để thay đổi từ
// Admin hiển thị ngay lập tức thay vì phải build lại toàn bộ dự án.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  return {
    title: {
      default: `${settings.siteName} | Áo cưới & Vest chú rể thiết kế riêng`,
      template: `%s | ${settings.siteName}`,
    },
    description:
      "Bridal Atelier - thiết kế áo cưới, vest chú rể theo yêu cầu, đặt lịch hẹn thử áo và trải nghiệm thử đồ bằng AI.",
    icons: settings.faviconUrl ? [{ url: settings.faviconUrl }] : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSiteSettings();

  // Đổi màu/thương hiệu trong Admin sẽ ghi đè các biến CSS này ngay khi tải trang,
  // không cần build lại ứng dụng.
  const themeVars = `:root{--color-primary:${settings.colorPrimary};--color-secondary:${settings.colorSecondary};--color-accent:${settings.colorAccent};--color-dark:${settings.colorDark};}`;

  return (
    <html lang="vi" className="h-full antialiased">
      <head>
        {/* Google Fonts nạp phía trình duyệt của khách truy cập — không ảnh hưởng tới build */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteSettingsProvider settings={settings}>
          <LanguageProvider>
            <Header settings={settings} />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} />
          </LanguageProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
