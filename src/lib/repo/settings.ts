import { getDb, nowIso } from "@/lib/db";
import type { SiteSettings, HomeContent } from "@/lib/types";

function mapSettings(row: Record<string, unknown>): SiteSettings {
  return {
    id: row.id as string,
    siteName: row.site_name as string,
    logoUrl: (row.logo_url as string) ?? null,
    faviconUrl: (row.favicon_url as string) ?? null,
    colorPrimary: row.color_primary as string,
    colorSecondary: row.color_secondary as string,
    colorAccent: row.color_accent as string,
    colorDark: row.color_dark as string,
    currencyCode: (row.currency_code as string) ?? "AUD",
    currencyLocale: (row.currency_locale as string) ?? "en-AU",
    phone: row.phone as string,
    email: row.email as string,
    address: row.address as string,
    facebookUrl: (row.facebook_url as string) ?? null,
    instagramUrl: (row.instagram_url as string) ?? null,
    zaloUrl: (row.zalo_url as string) ?? null,
    bankName: (row.bank_name as string) ?? "",
    bankAccountName: row.bank_account_name as string,
    bankAccountNumber: row.bank_account_number as string,
    bankBranch: (row.bank_branch as string) ?? "",
    bankBsb: (row.bank_bsb as string) ?? "",
    bankQrImageUrl: (row.bank_qr_image_url as string) ?? null,
    defaultShippingFee: row.default_shipping_fee as number,
    freeShippingThreshold: row.free_shipping_threshold as number,
    tryOnFee: row.tryon_fee as number,
    appointmentDeposit: row.appointment_deposit as number,
    homeContentJson: row.home_content_json as string,
    updatedAt: row.updated_at as string,
  };
}

// Nội dung mặc định cho trang chủ — soạn theo thương hiệu TomQ Bridal (tomqbridal.com), có thể
// chỉnh sửa toàn bộ trong Admin > Thiết lập giao diện mà không cần sửa code.
export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroTitle: "Where Couture Craftsmanship Meets Timeless Bridal Elegance",
  heroSubtitle:
    "TomQ Bridal — bespoke couture gowns and a curated selection of luxurious bridal and groom designs, now with an at-home AI try-on experience before you ever step into the studio.",
  heroImageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=1600&auto=format&fit=crop",
  heroCtaLabel: "Book Your Appointment",
  introTitle: "Exceptional Care, Refined Silhouettes",
  introBody:
    "Founded by designer Tom Nguyen, TomQ Bridal is a destination for brides and grooms seeking elegance, craftsmanship and individuality. Every gown and suit is shaped around exceptional care, refined silhouettes and timeless sophistication — because your vision is our priority, and we are passionate about bringing it to life.",
  introImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
  storyTitle: "Our Story",
  storyBody:
    "Built on a passion for fashion and garment design, TomQ Bridal grew from Tom Nguyen's vision — more than 20 years in the fashion industry — into a boutique atelier that has proudly dressed brides and grooms for over 5 years. From bespoke couture gowns to ready-to-wear pieces, every design reflects the individuality of the person wearing it.",
  storyImageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1600&auto=format&fit=crop",
  testimonials: [
    {
      name: "Mia & James",
      quote:
        "The gown was tailored to the centimetre and the team listened to every detail we wanted — it felt truly bespoke from the first fitting.",
    },
    {
      name: "Linh Tran",
      quote:
        "The AI try-on feature let me picture myself in the dress before committing — it saved me so many trips back and forth to the studio.",
    },
    {
      name: "David Nguyen",
      quote: "My suit was beautifully tailored with premium fabric — I felt confident all night at the reception.",
    },
  ],
};

export function getSiteSettings(): SiteSettings {
  const db = getDb();
  let row = db.prepare(`SELECT * FROM site_settings WHERE id='singleton'`).get() as
    | Record<string, unknown>
    | undefined;
  if (!row) {
    db.prepare(
      `INSERT INTO site_settings (id, home_content_json) VALUES ('singleton', ?)`
    ).run(JSON.stringify(DEFAULT_HOME_CONTENT));
    row = db.prepare(`SELECT * FROM site_settings WHERE id='singleton'`).get() as Record<
      string,
      unknown
    >;
  }
  return mapSettings(row);
}

export function getHomeContent(): HomeContent {
  const settings = getSiteSettings();
  try {
    const parsed = JSON.parse(settings.homeContentJson);
    return { ...DEFAULT_HOME_CONTENT, ...parsed };
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}

export function updateSiteSettings(data: Partial<Omit<SiteSettings, "id" | "updatedAt">>) {
  const db = getDb();
  const existing = getSiteSettings();
  const merged = { ...existing, ...data };
  db.prepare(
    `UPDATE site_settings SET
      site_name=?, logo_url=?, favicon_url=?, color_primary=?, color_secondary=?, color_accent=?, color_dark=?,
      currency_code=?, currency_locale=?,
      phone=?, email=?, address=?, facebook_url=?, instagram_url=?, zalo_url=?,
      bank_name=?, bank_account_name=?, bank_account_number=?, bank_branch=?, bank_bsb=?, bank_qr_image_url=?,
      default_shipping_fee=?, free_shipping_threshold=?, tryon_fee=?, appointment_deposit=?, home_content_json=?, updated_at=?
      WHERE id='singleton'`
  ).run(
    merged.siteName,
    merged.logoUrl,
    merged.faviconUrl,
    merged.colorPrimary,
    merged.colorSecondary,
    merged.colorAccent,
    merged.colorDark,
    merged.currencyCode,
    merged.currencyLocale,
    merged.phone,
    merged.email,
    merged.address,
    merged.facebookUrl,
    merged.instagramUrl,
    merged.zaloUrl,
    merged.bankName,
    merged.bankAccountName,
    merged.bankAccountNumber,
    merged.bankBranch,
    merged.bankBsb,
    merged.bankQrImageUrl,
    merged.defaultShippingFee,
    merged.freeShippingThreshold,
    merged.tryOnFee,
    merged.appointmentDeposit,
    merged.homeContentJson,
    nowIso()
  );
  return getSiteSettings();
}

export function updateHomeContent(content: Partial<HomeContent>) {
  const current = getHomeContent();
  const merged = { ...current, ...content };
  return updateSiteSettings({ homeContentJson: JSON.stringify(merged) });
}
