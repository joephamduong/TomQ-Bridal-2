// Định dạng tiền tệ dùng ở Server Component / nơi không có React context (vd: trang admin render server-side).
// Ở Client Component, ưu tiên dùng hook useMoneyFormatter() (src/lib/settings-context.tsx) vì nó tự đọc
// currencyCode/currencyLocale từ Site Settings (đổi được trong Admin) thay vì cố định "AUD".
export function formatMoney(amount: number, currencyCode = "AUD", currencyLocale = "en-AU"): string {
  return new Intl.NumberFormat(currencyLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugifyVi(input: string): string {
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
  let str = input.toLowerCase().trim();
  for (let i = 0; i < from.length; i++) {
    str = str.replace(new RegExp(from[i], "g"), to[i]);
  }
  return str
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDateVi(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

// Sinh mục lục (table of contents) tự động từ HTML bài viết dựa trên thẻ h2/h3
export type TocItem = { id: string; text: string; level: 2 | 3 };

export function extractToc(html: string): TocItem[] {
  const toc: TocItem[] = [];
  const regex = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, "");
    toc.push({ id, text, level });
  }
  return toc;
}

// Tự động gắn id vào các thẻ h2/h3 chưa có id (để neo mục lục), trả về html mới
export function ensureHeadingIds(html: string): string {
  const used = new Set<string>();
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    if (/id="/.test(attrs)) return full;
    const text = inner.replace(/<[^>]+>/g, "");
    let id = slugifyVi(text) || `muc-${level}`;
    let unique = id;
    let i = 2;
    while (used.has(unique)) {
      unique = `${id}-${i++}`;
    }
    used.add(unique);
    return `<h${level}${attrs} id="${unique}">${inner}</h${level}>`;
  });
}
