#!/usr/bin/env node
/**
 * Seed dữ liệu mẫu cho TomQ Bridal — chạy: node scripts/seed.mjs
 *
 * Tạo danh mục, chất liệu, kiểu dáng, màu sắc, size, sản phẩm (áo cưới cô dâu + vest chú rể),
 * chủ đề & bài viết blog, cùng một vài khách hàng / đơn hàng / lịch hẹn / yêu cầu thử đồ AI mẫu
 * để trang Admin có dữ liệu minh họa ngay khi mới cài đặt.
 *
 * Ảnh sản phẩm dùng placeholder (placehold.co) theo đúng màu thương hiệu vì chưa có ảnh chụp sản
 * phẩm thật của TomQ Bridal — chủ shop có thể thay bằng ảnh thật bất cứ lúc nào trong trang
 * Admin > Sản phẩm (không cần sửa code). Script này chỉ dùng node:sqlite (built-in Node >= 22.5),
 * không phụ thuộc gì vào Next.js nên chạy độc lập trên mọi hosting có Node.js.
 */
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATABASE_PATH = process.env.DATABASE_PATH || "./data/app.db";
const resolved = path.resolve(process.cwd(), DATABASE_PATH);
const dir = path.dirname(resolved);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(resolved);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
const schema = fs.readFileSync(path.resolve(process.cwd(), "db/schema.sql"), "utf-8");
db.exec(schema);

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureHeadingIds(html) {
  const used = new Set();
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    if (/id="/.test(attrs)) return full;
    const text = inner.replace(/<[^>]+>/g, "");
    const base = slugify(text) || `section-${level}`;
    let unique = base;
    let i = 2;
    while (used.has(unique)) unique = `${base}-${i++}`;
    used.add(unique);
    return `<h${level}${attrs} id="${unique}">${inner}</h${level}>`;
  });
}

function readingMinutes(html) {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Ảnh placeholder theo màu thương hiệu TomQ Bridal (thay bằng ảnh thật trong Admin sau).
function ph(w, h, label, bg = "EFE6DC", fg = "2B2622") {
  return `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(label)}`;
}

const existingCount = db.prepare("SELECT COUNT(*) as cnt FROM products").get().cnt;
if (existingCount > 0) {
  console.log(
    `Database đã có ${existingCount} sản phẩm — bỏ qua seed để tránh trùng lặp. Xóa file ${DATABASE_PATH} nếu muốn seed lại từ đầu.`
  );
  process.exit(0);
}

const tx = db.prepare("BEGIN");
tx.run();

try {
  // ---------------------------------------------------------------------
  // Danh mục
  // ---------------------------------------------------------------------
  const categories = [
    { name: "Ball Gown", type: "BRIDE" },
    { name: "Mermaid & Trumpet", type: "BRIDE" },
    { name: "A-Line", type: "BRIDE" },
    { name: "Sheath & Slip", type: "BRIDE" },
    { name: "Classic Suits", type: "GROOM" },
    { name: "Tuxedos", type: "GROOM" },
  ];
  const catId = {};
  const insCat = db.prepare(`INSERT INTO categories (id, name, slug, type, sort_order) VALUES (?,?,?,?,?)`);
  categories.forEach((c, i) => {
    const id = newId("cat");
    insCat.run(id, c.name, slugify(c.name), c.type, i);
    catId[c.name] = id;
  });

  // ---------------------------------------------------------------------
  // Chất liệu
  // ---------------------------------------------------------------------
  const materials = [
    { name: "Silk Satin", tag: "luxurious silk satin fabric with a soft lustrous sheen" },
    { name: "French Lace", tag: "delicate French lace with intricate floral appliqué" },
    { name: "Chiffon", tag: "flowing lightweight chiffon fabric that moves with the body" },
    { name: "Tulle", tag: "soft layered tulle fabric with romantic volume" },
    { name: "Mikado", tag: "structured mikado fabric with a refined matte finish" },
    { name: "Wool Blend Suiting", tag: "fine wool blend suiting fabric with a tailored drape" },
  ];
  const matId = {};
  const insMat = db.prepare(
    `INSERT INTO materials (id, name, slug, description, swatch_image_url, extra_price, ai_prompt_tag, is_active) VALUES (?,?,?,?,?,?,?,1)`
  );
  materials.forEach((m) => {
    const id = newId("mat");
    insMat.run(id, m.name, slugify(m.name) + "-" + id.slice(-4), m.tag, ph(200, 200, m.name), 0, m.tag);
    matId[m.name] = id;
  });

  // ---------------------------------------------------------------------
  // Kiểu dáng
  // ---------------------------------------------------------------------
  const styles = [
    { name: "Ball Gown", tag: "dramatic ball gown silhouette with a full voluminous skirt" },
    { name: "Mermaid", tag: "fitted mermaid silhouette flaring gracefully at the knee" },
    { name: "A-Line", tag: "classic A-line silhouette that skims the body" },
    { name: "Off-Shoulder", tag: "romantic off-shoulder neckline" },
    { name: "Sheath", tag: "sleek column sheath silhouette" },
    { name: "Illusion Neckline", tag: "illusion lace neckline" },
    { name: "Slim Fit", tag: "modern slim-fit tailoring" },
  ];
  const styleId = {};
  const insStyle = db.prepare(
    `INSERT INTO style_options (id, name, slug, description, image_url, extra_price, ai_prompt_tag, is_active) VALUES (?,?,?,?,?,?,?,1)`
  );
  styles.forEach((s) => {
    const id = newId("sty");
    insStyle.run(id, s.name, slugify(s.name) + "-" + id.slice(-4), s.tag, ph(200, 200, s.name), 0, s.tag);
    styleId[s.name] = id;
  });

  // ---------------------------------------------------------------------
  // Màu sắc
  // ---------------------------------------------------------------------
  const colors = [
    { name: "Ivory", hex: "#F5EFE3", tag: "in an elegant ivory tone" },
    { name: "White", hex: "#FFFFFF", tag: "in classic pure white" },
    { name: "Champagne", hex: "#E8D3AE", tag: "in a warm champagne tone" },
    { name: "Blush", hex: "#F0D9D6", tag: "in a soft blush tone" },
    { name: "Navy", hex: "#1F2A44", tag: "in deep navy" },
    { name: "Black", hex: "#1A1A1A", tag: "in classic black" },
  ];
  const colorId = {};
  const insColor = db.prepare(
    `INSERT INTO color_options (id, name, hex_code, extra_price, ai_prompt_tag, is_active) VALUES (?,?,?,0,?,1)`
  );
  colors.forEach((c) => {
    const id = newId("col");
    insColor.run(id, c.name, c.hex, c.tag);
    colorId[c.name] = id;
  });

  // ---------------------------------------------------------------------
  // Size
  // ---------------------------------------------------------------------
  const brideSizes = ["AU 6", "AU 8", "AU 10", "AU 12", "AU 14", "AU 16", "AU 18", "AU 20"];
  const groomSizes = ["36", "38", "40", "42", "44", "46", "48", "50"];
  const sizeId = {};
  const insSize = db.prepare(`INSERT INTO size_options (id, label, sort_order) VALUES (?,?,?)`);
  [...brideSizes, ...groomSizes].forEach((label, i) => {
    const id = newId("siz");
    insSize.run(id, label, i);
    sizeId[label] = id;
  });

  // ---------------------------------------------------------------------
  // Sản phẩm
  // ---------------------------------------------------------------------
  const insProduct = db.prepare(
    `INSERT INTO products (id, sku, name, slug, type, short_description, description, price, compare_at_price, is_featured, is_new, is_published, is_tryon_enabled, category_id, meta_title, meta_description)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,1,1,?,?,?)`
  );
  const insImage = db.prepare(`INSERT INTO product_images (id, product_id, url, alt, sort_order) VALUES (?,?,?,?,?)`);
  const insPM = db.prepare(`INSERT INTO product_materials (id, product_id, material_id) VALUES (?,?,?)`);
  const insPS = db.prepare(`INSERT INTO product_styles (id, product_id, style_id) VALUES (?,?,?)`);
  const insPC = db.prepare(`INSERT INTO product_colors (id, product_id, color_id) VALUES (?,?,?)`);
  const insPZ = db.prepare(`INSERT INTO product_sizes (id, product_id, size_id) VALUES (?,?,?)`);

  function addProduct(p) {
    const id = newId("prod");
    insProduct.run(
      id,
      p.sku,
      p.name,
      slugify(p.name),
      p.type,
      p.shortDescription,
      p.description,
      p.price,
      p.compareAtPrice ?? null,
      p.isFeatured ? 1 : 0,
      p.isNew ? 1 : 0,
      catId[p.category],
      p.metaTitle,
      p.metaDescription
    );
    p.images.forEach((label, i) => {
      insImage.run(
        newId("img"),
        id,
        ph(900, 1200, label, i === 0 ? "EFE6DC" : "F5F0EA"),
        `${p.name} — ${label}`,
        i
      );
    });
    p.materials.forEach((m) => insPM.run(newId("pm"), id, matId[m]));
    p.styles.forEach((s) => insPS.run(newId("ps"), id, styleId[s]));
    p.colors.forEach((c) => insPC.run(newId("pc"), id, colorId[c]));
    p.sizes.forEach((s) => insPZ.run(newId("pz"), id, sizeId[s]));
    return id;
  }

  const auroliaId = addProduct({
    sku: "TQB-BR-AURELIA",
    name: "Aurelia Ball Gown",
    type: "BRIDE",
    category: "Ball Gown",
    shortDescription: "A dramatic silk satin ball gown with a sculpted bodice and cathedral train.",
    description: `<p>The Aurelia is TomQ Bridal's signature ball gown — a sculpted silk satin bodice giving way to a voluminous, cathedral-length skirt. Designed for the bride who wants a true fairytale silhouette without sacrificing comfort.</p><h2>Design details</h2><p>Hand-finished boning through the bodice creates a flattering, supported fit, while hidden pockets in the skirt add everyday practicality to a couture gown. Fine covered buttons trail down the back to a discreet zip closure.</p><h2>Styling notes</h2><p>Pairs beautifully with a cathedral veil for a grand entrance, or a shorter blusher veil for a more modern take. Available with an optional detachable tulle overskirt for the reception.</p>`,
    price: 4800,
    compareAtPrice: 5400,
    isFeatured: true,
    isNew: true,
    materials: ["Silk Satin", "Tulle"],
    styles: ["Ball Gown"],
    colors: ["Ivory", "White"],
    sizes: brideSizes,
    images: ["Front View", "Back View", "Fabric Detail"],
    metaTitle: "Aurelia Ball Gown | TomQ Bridal",
    metaDescription: "A dramatic silk satin ball gown with a sculpted bodice and cathedral train, handcrafted by TomQ Bridal.",
  });

  const seraphineId = addProduct({
    sku: "TQB-BR-SERAPHINE",
    name: "Seraphine Mermaid Gown",
    type: "BRIDE",
    category: "Mermaid & Trumpet",
    shortDescription: "A fitted French lace mermaid gown that flares gracefully at the knee.",
    description: `<p>Seraphine celebrates the bride's silhouette with fitted French lace through the bodice and hip, flaring into a soft trumpet skirt at the knee. Delicate scalloped lace edges the neckline and hem.</p><h2>Design details</h2><p>A soft illusion lace back and long fitted sleeves in matching lace bring old-world romance to a distinctly modern shape. Fully lined in silk for a comfortable, breathable wear.</p><h2>Who it suits</h2><p>Ideal for brides who love a figure-skimming shape with a glamorous flare — Seraphine photographs beautifully for both ceremony and reception.</p>`,
    price: 5200,
    isFeatured: true,
    materials: ["French Lace", "Silk Satin"],
    styles: ["Mermaid", "Illusion Neckline"],
    colors: ["Ivory", "Champagne"],
    sizes: brideSizes,
    images: ["Front View", "Back View", "Lace Detail"],
    metaTitle: "Seraphine Mermaid Gown | TomQ Bridal",
    metaDescription: "A fitted French lace mermaid wedding gown with an illusion lace back, handcrafted by TomQ Bridal.",
  });

  const noorId = addProduct({
    sku: "TQB-BR-NOOR",
    name: "Noor A-Line Gown",
    type: "BRIDE",
    category: "A-Line",
    shortDescription: "An airy chiffon A-line gown with an illusion lace neckline.",
    description: `<p>Noor is designed for effortless movement — soft chiffon layers fall from an illusion lace bodice into a flowing A-line skirt, perfect for an outdoor or destination celebration.</p><h2>Design details</h2><p>A delicate illusion neckline is finished with hand-appliquéd lace motifs, while the skirt's soft chiffon layers create graceful movement with every step.</p><h2>Styling notes</h2><p>Noor pairs beautifully with minimal jewellery and a loose, romantic hairstyle — let the fabric do the talking.</p>`,
    price: 3600,
    materials: ["Chiffon", "French Lace"],
    styles: ["A-Line", "Illusion Neckline"],
    colors: ["Ivory", "Blush"],
    sizes: brideSizes,
    images: ["Front View", "Back View", "Fabric Detail"],
    metaTitle: "Noor A-Line Gown | TomQ Bridal",
    metaDescription: "An airy chiffon A-line wedding gown with an illusion lace neckline from TomQ Bridal.",
  });

  const celesteId = addProduct({
    sku: "TQB-BR-CELESTE",
    name: "Celeste Off-Shoulder Gown",
    type: "BRIDE",
    category: "A-Line",
    shortDescription: "A refined mikado A-line gown with a romantic off-shoulder neckline.",
    description: `<p>Celeste brings together structured mikado fabric and a soft, romantic off-shoulder neckline for a gown that feels both modern and timeless.</p><h2>Design details</h2><p>Clean, structured seaming through the bodice contrasts with the softness of the off-shoulder sleeves, while the A-line skirt falls in crisp, sculptural folds.</p><h2>Styling notes</h2><p>A striking choice for brides who want architectural clean lines with a touch of romance at the shoulder.</p>`,
    price: 4200,
    isNew: true,
    materials: ["Mikado"],
    styles: ["A-Line", "Off-Shoulder"],
    colors: ["White", "Ivory"],
    sizes: brideSizes,
    images: ["Front View", "Back View", "Fabric Detail"],
    metaTitle: "Celeste Off-Shoulder Gown | TomQ Bridal",
    metaDescription: "A refined mikado A-line wedding gown with a romantic off-shoulder neckline from TomQ Bridal.",
  });

  const marielleId = addProduct({
    sku: "TQB-BR-MARIELLE",
    name: "Marielle Sheath Gown",
    type: "BRIDE",
    category: "Sheath & Slip",
    shortDescription: "A sleek silk satin sheath gown for the minimalist modern bride.",
    description: `<p>Marielle is cut from fluid silk satin in a sleek column silhouette — designed for the bride who wants understated elegance over embellishment.</p><h2>Design details</h2><p>A bias-cut skirt skims the body for a fluid, columnar line, with a low back and thin adjustable straps for a modern finish.</p><h2>Styling notes</h2><p>A favourite for intimate ceremonies, courthouse weddings and second-look reception dressing.</p>`,
    price: 3200,
    materials: ["Silk Satin"],
    styles: ["Sheath"],
    colors: ["Champagne", "Ivory"],
    sizes: brideSizes,
    images: ["Front View", "Back View", "Fabric Detail"],
    metaTitle: "Marielle Sheath Gown | TomQ Bridal",
    metaDescription: "A sleek silk satin sheath wedding gown for the minimalist modern bride, by TomQ Bridal.",
  });

  const odetteId = addProduct({
    sku: "TQB-BR-ODETTE",
    name: "Odette Ball Gown",
    type: "BRIDE",
    category: "Ball Gown",
    shortDescription: "TomQ Bridal's most opulent couture ball gown, in tulle and French lace.",
    description: `<p>Odette is the most opulent piece in the TomQ Bridal couture collection — layers of soft tulle over a French lace bodice, finished with an illusion lace neckline and a dramatic full skirt.</p><h2>Design details</h2><p>Hundreds of hours of hand-finishing go into Odette's bodice appliqué alone. The full tulle skirt is cut in multiple layers for maximum volume and movement.</p><h2>Who it suits</h2><p>For the bride planning a grand celebration who wants a gown that commands the room.</p>`,
    price: 6500,
    isFeatured: true,
    materials: ["Tulle", "French Lace"],
    styles: ["Ball Gown", "Illusion Neckline"],
    colors: ["Ivory", "White"],
    sizes: brideSizes,
    images: ["Front View", "Back View", "Lace Detail"],
    metaTitle: "Odette Ball Gown | TomQ Bridal",
    metaDescription: "TomQ Bridal's most opulent couture ball gown in layered tulle and French lace.",
  });

  addProduct({
    sku: "TQB-GR-STERLING",
    name: "Sterling Two-Piece Suit",
    type: "GROOM",
    category: "Classic Suits",
    shortDescription: "A classic slim-fit wool blend two-piece suit for the modern groom.",
    description: `<p>Sterling is a versatile two-piece suit in fine wool blend suiting — tailored for a clean, modern silhouette that works equally well for the ceremony and the dance floor.</p><h2>Design details</h2><p>Half-canvas construction gives the jacket structure while keeping it comfortable to wear all day, with a two-button front and notch lapel.</p><h2>Styling notes</h2><p>Pairs well with a classic white shirt and tie for the ceremony, or dressed down with an open collar for the reception.</p>`,
    price: 1400,
    materials: ["Wool Blend Suiting"],
    styles: ["Slim Fit"],
    colors: ["Navy", "Black"],
    sizes: groomSizes,
    images: ["Front View", "Back View", "Fabric Detail"],
    metaTitle: "Sterling Two-Piece Suit | TomQ Bridal",
    metaDescription: "A classic slim-fit wool blend two-piece suit for the modern groom, by TomQ Bridal.",
  });

  addProduct({
    sku: "TQB-GR-ASHFORD",
    name: "Ashford Tuxedo",
    type: "GROOM",
    category: "Tuxedos",
    shortDescription: "A satin-lapel black tuxedo for a formal, black-tie celebration.",
    description: `<p>Ashford is a formal black tuxedo with a satin peak lapel and matching satin trouser stripe — the classic choice for a black-tie wedding.</p><h2>Design details</h2><p>Fine wool blend suiting with a satin peak lapel, single-button closure and jetted pockets for a streamlined formal silhouette.</p><h2>Styling notes</h2><p>Traditionally worn with a bow tie, formal white shirt and patent leather shoes.</p>`,
    price: 1800,
    isFeatured: true,
    materials: ["Wool Blend Suiting"],
    styles: ["Slim Fit"],
    colors: ["Black"],
    sizes: groomSizes,
    images: ["Front View", "Back View", "Lapel Detail"],
    metaTitle: "Ashford Tuxedo | TomQ Bridal",
    metaDescription: "A satin-lapel black tuxedo for a formal black-tie wedding celebration, by TomQ Bridal.",
  });

  addProduct({
    sku: "TQB-GR-HARRINGTON",
    name: "Harrington Three-Piece Suit",
    type: "GROOM",
    category: "Classic Suits",
    shortDescription: "A tailored navy three-piece suit with a matching waistcoat.",
    description: `<p>Harrington adds a tailored waistcoat to the classic suit silhouette — a polished three-piece look that layers beautifully for photos and stays comfortable through a long celebration day.</p><h2>Design details</h2><p>Matching waistcoat with a fitted back strap, notch lapel jacket and flat-front trousers in fine navy wool blend.</p><h2>Styling notes</h2><p>The waistcoat can be worn on its own for a relaxed reception look once the jacket comes off.</p>`,
    price: 1600,
    isNew: true,
    materials: ["Wool Blend Suiting"],
    styles: ["Slim Fit"],
    colors: ["Navy"],
    sizes: groomSizes,
    images: ["Front View", "Back View", "Waistcoat Detail"],
    metaTitle: "Harrington Three-Piece Suit | TomQ Bridal",
    metaDescription: "A tailored navy three-piece suit with a matching waistcoat, by TomQ Bridal.",
  });

  addProduct({
    sku: "TQB-GR-BECKETT",
    name: "Beckett Velvet Tuxedo Jacket",
    type: "GROOM",
    category: "Tuxedos",
    shortDescription: "A statement velvet dinner jacket for the groom who wants something different.",
    description: `<p>Beckett is a rich velvet dinner jacket for the groom who wants a formal look with a point of difference — paired with classic wool trousers for balance.</p><h2>Design details</h2><p>Plush velvet jacket with a satin shawl collar, single-button closure and jetted pockets, paired with flat-front wool trousers.</p><h2>Styling notes</h2><p>An especially striking choice for an evening or winter wedding.</p>`,
    price: 2200,
    isFeatured: true,
    materials: ["Wool Blend Suiting"],
    styles: ["Slim Fit"],
    colors: ["Black", "Navy"],
    sizes: groomSizes,
    images: ["Front View", "Back View", "Fabric Detail"],
    metaTitle: "Beckett Velvet Tuxedo Jacket | TomQ Bridal",
    metaDescription: "A statement velvet dinner jacket for the groom, paired with classic wool trousers.",
  });

  // ---------------------------------------------------------------------
  // Blog: chủ đề
  // ---------------------------------------------------------------------
  const blogCategories = ["Bridal Style Guides", "Real Weddings", "Behind the Seams", "Wedding Planning Tips"];
  const bcatId = {};
  const insBCat = db.prepare(`INSERT INTO blog_categories (id, name, slug, sort_order) VALUES (?,?,?,?)`);
  blogCategories.forEach((name, i) => {
    const id = newId("bcat");
    insBCat.run(id, name, slugify(name), i);
    bcatId[name] = id;
  });

  // ---------------------------------------------------------------------
  // Blog: bài viết
  // ---------------------------------------------------------------------
  const insPost = db.prepare(
    `INSERT INTO blog_posts (id, title, slug, excerpt, cover_image_url, content_html, category_id, author, is_published, meta_title, meta_description, meta_keywords, reading_minutes, published_at)
     VALUES (?,?,?,?,?,?,?,?,1,?,?,?,?,?)`
  );

  function addPost({ title, category, excerpt, daysAgo, keywords, body }) {
    const html = ensureHeadingIds(body);
    const publishedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    insPost.run(
      newId("post"),
      title,
      slugify(title),
      excerpt,
      ph(1600, 900, title, "F5F0EA", "2B2622"),
      html,
      bcatId[category],
      "TomQ Bridal",
      title,
      excerpt,
      keywords,
      readingMinutes(html),
      publishedAt
    );
  }

  addPost({
    title: "How to Choose the Perfect Wedding Dress Silhouette for Your Body Shape",
    category: "Bridal Style Guides",
    excerpt: "A practical guide to matching wedding dress silhouettes — ball gown, A-line, mermaid and sheath — to your body shape and comfort.",
    daysAgo: 4,
    keywords: "wedding dress silhouette, bridal style guide, choosing a wedding dress",
    body: `<p>Choosing a wedding dress silhouette can feel overwhelming with so many beautiful options available. At TomQ Bridal, we always start a fitting by talking through how you want to feel on the day — the right silhouette follows from there.</p>
<img src="${ph(1200, 700, "Bride trying on gowns", "EFE6DC", "2B2622")}" alt="Bride trying on wedding gowns in a fitting room" />
<h2>Ball gowns for a fairytale moment</h2>
<p>A fitted bodice paired with a full, voluminous skirt creates a dramatic silhouette that suits almost every body shape by nipping in at the waist and creating volume below. It's a wonderful choice for a formal venue or a bride who wants a grand entrance.</p>
<h3>Best for</h3>
<p>Brides who want maximum drama and love the idea of a defined waist with plenty of movement in the skirt.</p>
<h2>A-line for timeless versatility</h2>
<p>The A-line silhouette skims the body from the bodice and gradually flares from the waist, making it one of the most universally flattering shapes. It works beautifully for both indoor and outdoor ceremonies.</p>
<h2>Mermaid and trumpet for a fitted, glamorous line</h2>
<p>Fitted through the bodice and hip before flaring at the knee or below, mermaid silhouettes celebrate curves and photograph beautifully — best suited to brides who are comfortable in a closely fitted style.</p>
<img src="${ph(1200, 700, "Mermaid gown detail", "F5F0EA", "2B2622")}" alt="Detail shot of a mermaid wedding gown silhouette" />
<h2>Sheath and slip for modern minimalism</h2>
<p>A sleek column silhouette that follows the body's natural line, ideal for an intimate ceremony, a destination wedding or a bride who prefers understated elegance over embellishment.</p>
<p>Every silhouette in the TomQ Bridal collection can be tried on virtually through our AI try-on tool before you book an in-studio fitting — a helpful first step if you're still narrowing down your shortlist.</p>`,
  });

  addPost({
    title: "Ball Gown vs. Mermaid: Which Wedding Dress Silhouette Is Right for You?",
    category: "Bridal Style Guides",
    excerpt: "Two of our most-loved silhouettes compared — drama and movement versus a fitted, glamorous line.",
    daysAgo: 10,
    keywords: "ball gown vs mermaid, wedding dress comparison",
    body: `<p>Ball gown and mermaid are two of the most requested silhouettes at TomQ Bridal — and two of the most different. Here's how to decide between them.</p>
<h2>Volume and movement: the ball gown case</h2>
<p>A ball gown's full skirt creates natural drama on the aisle and gives you room to move comfortably through a long day of dancing. It also tends to be forgiving through the hip and stomach, since the fitted bodice does the shaping work.</p>
<h3>Consider a ball gown if</h3>
<p>You're drawn to a formal venue, want a dramatic silhouette change between ceremony and reception with a detachable overskirt, or simply love the idea of a full skirt.</p>
<h2>A fitted line: the mermaid case</h2>
<p>A mermaid silhouette is fitted from the bodice through the hip, flaring out at or below the knee. It celebrates the body's natural curves and tends to photograph particularly well in close, detailed shots.</p>
<img src="${ph(1200, 700, "Mermaid vs ball gown", "EFE6DC", "2B2622")}" alt="Comparison of mermaid and ball gown wedding dress silhouettes" />
<h3>Consider a mermaid gown if</h3>
<p>You're comfortable in fitted clothing day to day, want a glamorous red-carpet feel, or are marrying at a venue where a more streamlined silhouette suits the space.</p>
<h2>Try both before you decide</h2>
<p>Many brides are surprised by which silhouette they fall in love with once they try it on — our AI try-on tool lets you preview both shapes on your own photo before booking a fitting.</p>`,
  });

  addPost({
    title: "Inside the Atelier: How a TomQ Bridal Couture Gown Is Made",
    category: "Behind the Seams",
    excerpt: "A behind-the-scenes look at the hand-finishing process behind every TomQ Bridal couture gown.",
    daysAgo: 18,
    keywords: "bridal couture process, how wedding dresses are made",
    body: `<p>Every TomQ Bridal gown begins as a sketch on Tom Nguyen's design table, long before it becomes a finished piece on the fitting room floor. Here's a glimpse into what happens in between.</p>
<h2>From sketch to pattern</h2>
<p>Once a design is finalised, our pattern makers translate it into a toile — a calico test version used to refine fit and proportion before a single piece of the final fabric is cut.</p>
<img src="${ph(1200, 700, "Pattern cutting", "F5F0EA", "2B2622")}" alt="Pattern cutting on a bridal atelier work table" />
<h2>Hand-finishing details</h2>
<p>Lace appliqué, boning, and beading are finished by hand — a single bodice can take dozens of hours of hand-sewing alone. This is what gives a couture gown its structure and longevity.</p>
<h3>Quality checks</h3>
<p>Every gown passes through multiple fit checks before it's ready for a bride's first fitting, ensuring the finished silhouette matches the original design intent.</p>
<h2>Your fitting journey</h2>
<p>From your first consultation through to final alterations, our team works with you at every stage — and for brides who can't visit the studio immediately, our AI try-on tool offers an early preview of how a style might suit you.</p>`,
  });

  addPost({
    title: "Mia & James: A Timeless Garden Wedding in the Southern Highlands",
    category: "Real Weddings",
    excerpt: "Mia wore the Aurelia ball gown for a spring garden wedding — see the day and hear her fitting story.",
    daysAgo: 25,
    keywords: "real wedding, TomQ Bridal real bride, garden wedding",
    body: `<p>Mia and James were married on a crisp spring morning in the Southern Highlands, surrounded by family and an abundance of garden roses. Mia chose the Aurelia ball gown for her ceremony.</p>
<img src="${ph(1200, 700, "Garden wedding ceremony", "EFE6DC", "2B2622")}" alt="Garden wedding ceremony with bride in ball gown" />
<h2>Finding the dress</h2>
<p>"I knew I wanted something dramatic but still comfortable enough to dance in all night," Mia told us. "The Aurelia's hidden pockets sealed the deal — I could carry my lip gloss down the aisle."</p>
<h2>The fitting process</h2>
<p>Mia had three fittings over four months, with small adjustments made to the bodice and hem at each stage to get the fit exactly right for her venue's grass terrain.</p>
<h3>Her advice to future brides</h3>
<p>"Don't be afraid to try on shapes you don't think will suit you. I never expected to love a ball gown until I put one on."</p>`,
  });

  addPost({
    title: "Your 12-Month Wedding Planning Timeline",
    category: "Wedding Planning Tips",
    excerpt: "A month-by-month guide to planning your wedding, including when to book your dress fittings.",
    daysAgo: 32,
    keywords: "wedding planning timeline, wedding checklist",
    body: `<p>A clear timeline takes the stress out of wedding planning. Here's the schedule we recommend to our own brides and grooms at TomQ Bridal.</p>
<h2>12 to 9 months out</h2>
<p>Set your budget, book your venue and start researching your wedding dress and suit silhouettes. This is a great time to try our AI try-on tool to shortlist styles before your first in-studio appointment.</p>
<h2>8 to 6 months out</h2>
<p>Book your first bridal and groom fittings, confirm your photographer and caterer, and send save-the-dates.</p>
<h3>Dress ordering timeline</h3>
<p>Couture gowns typically need 4 to 6 months for construction plus time for alterations, so this window is the latest we'd recommend placing your order.</p>
<h2>5 to 3 months out</h2>
<p>Attend fittings for alterations, finalise your ceremony details and send formal invitations.</p>
<h2>2 months to wedding day</h2>
<p>Final dress fitting, final headcount confirmations, and a last walkthrough with your venue.</p>`,
  });

  addPost({
    title: "5 Questions to Ask Before Booking Your Bridal Fitting",
    category: "Wedding Planning Tips",
    excerpt: "What to ask before your first bridal appointment, so you get the most out of your fitting.",
    daysAgo: 40,
    keywords: "bridal fitting tips, wedding dress appointment",
    body: `<p>Your first bridal fitting sets the tone for the rest of your dress journey. Here are five questions worth asking beforehand.</p>
<h2>1. How long will the appointment take?</h2>
<p>Most first fittings run 60 to 90 minutes — allow enough time to try on a handful of silhouettes without feeling rushed.</p>
<h2>2. What should I bring?</h2>
<p>Nude, seamless undergarments and shoes close to your expected wedding heel height will help you get the most accurate sense of fit and length.</p>
<h2>3. Can I try styles virtually first?</h2>
<p>At TomQ Bridal, our AI try-on tool lets you preview a shortlist of styles on your own photo before you come in — a helpful way to narrow things down if you're travelling from out of town.</p>
<h2>4. How many guests can I bring?</h2>
<p>We recommend two or three trusted guests whose opinions you value — too many opinions in the room can make decisions harder, not easier.</p>
<h2>5. What's the payment and alteration process?</h2>
<p>Ask about deposit requirements, estimated production timelines and what alterations are included in your quote.</p>`,
  });

  // ---------------------------------------------------------------------
  // Khách hàng / đơn hàng / lịch hẹn / thử đồ AI / liên hệ (dữ liệu minh họa)
  // ---------------------------------------------------------------------
  const insCustomer = db.prepare(
    `INSERT INTO customers (id, name, email, phone, address, source) VALUES (?,?,?,?,?,?)`
  );
  const mia = newId("cus");
  insCustomer.run(mia, "Mia Thompson", "mia.thompson@example.com", "+61 412 345 678", "24 Rosewood Ave, Bowral NSW 2576", "order");
  const linh = newId("cus");
  insCustomer.run(linh, "Linh Tran", "linh.tran@example.com", "+61 423 456 789", null, "tryon");
  const david = newId("cus");
  insCustomer.run(david, "David Nguyen", "david.nguyen@example.com", "+61 434 567 890", null, "appointment");

  const insOrder = db.prepare(
    `INSERT INTO orders (id, order_code, customer_id, full_name, phone, email, shipping_address, shipping_city, subtotal, shipping_fee, total, status, payment_confirmed_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  const insOrderItem = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, product_name, variant_label, unit_price, quantity, line_total) VALUES (?,?,?,?,?,?,?,?)`
  );

  const order1 = newId("ord");
  insOrder.run(
    order1,
    "BA260901-AB12",
    mia,
    "Mia Thompson",
    "+61 412 345 678",
    "mia.thompson@example.com",
    "24 Rosewood Ave",
    "Bowral NSW 2576",
    4800,
    0,
    4800,
    "COMPLETED",
    new Date(Date.now() - 12 * 86400000).toISOString()
  );
  insOrderItem.run(newId("oi"), order1, auroliaId, "Aurelia Ball Gown", "Silk Satin · Ivory · AU 10", 4800, 1, 4800);

  const order2 = newId("ord");
  insOrder.run(
    order2,
    "BA260913-CD34",
    null,
    "Sarah Whitfield",
    "+61 445 678 901",
    "sarah.whitfield@example.com",
    "8 Marina Court",
    "Manly NSW 2095",
    3200,
    20,
    3220,
    "PENDING_PAYMENT",
    null
  );
  insOrderItem.run(newId("oi"), order2, marielleId, "Marielle Sheath Gown", "Silk Satin · Champagne · AU 12", 3200, 1, 3200);

  const insTryon = db.prepare(
    `INSERT INTO tryon_requests (id, request_code, customer_id, product_id, full_name, phone, email, selected_style, selected_material, selected_color, customer_photo_url, result_image_url, fee, status, ai_provider, payment_confirmed_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  insTryon.run(
    newId("tryon"),
    "TO260910-EF56",
    linh,
    seraphineId,
    "Linh Tran",
    "+61 423 456 789",
    "linh.tran@example.com",
    "Mermaid",
    "French Lace",
    "Ivory",
    ph(800, 1200, "Customer Photo (demo)", "F5F0EA", "2B2622"),
    ph(800, 1200, "AI Try-On Result (demo)", "EFE6DC", "2B2622"),
    29,
    "COMPLETED",
    "mock",
    new Date(Date.now() - 5 * 86400000).toISOString()
  );

  const insAppt = db.prepare(
    `INSERT INTO appointments (id, customer_id, name, phone, email, preferred_date, preferred_time, appointment_type, message, status, deposit_required, deposit_paid)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  const in14days = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const in21days = new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10);
  insAppt.run(
    newId("apt"),
    david,
    "David Nguyen",
    "+61 434 567 890",
    "david.nguyen@example.com",
    in14days,
    "10:30",
    "fitting",
    "Interested in the Ashford tuxedo for a black-tie wedding.",
    "CONFIRMED",
    50,
    1
  );
  insAppt.run(
    newId("apt"),
    null,
    "Emily Carter",
    "+61 456 789 012",
    "emily.carter@example.com",
    in21days,
    "14:00",
    "consultation",
    "Would love to discuss the Odette ball gown and possible customisations.",
    "PENDING",
    50,
    0
  );

  const insContact = db.prepare(
    `INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read) VALUES (?,?,?,?,?,?,0)`
  );
  insContact.run(
    newId("msg"),
    "Priya Patel",
    "priya.patel@example.com",
    "+61 467 890 123",
    "Question about international shipping",
    "Hi TomQ Bridal, I'm getting married in Bali and wondered whether you can ship a completed gown internationally, and how long that would take? Thank you!"
  );

  db.prepare("COMMIT").run();
  console.log("✅ Đã seed dữ liệu mẫu TomQ Bridal thành công:");
  console.log(`   - ${categories.length} danh mục, ${materials.length} chất liệu, ${styles.length} kiểu dáng, ${colors.length} màu sắc, ${brideSizes.length + groomSizes.length} size`);
  console.log(`   - 10 sản phẩm (6 áo cưới cô dâu, 4 vest chú rể)`);
  console.log(`   - ${blogCategories.length} chủ đề blog, 6 bài viết`);
  console.log(`   - 3 khách hàng, 2 đơn hàng, 1 yêu cầu thử đồ AI, 2 lịch hẹn, 1 tin nhắn liên hệ`);
} catch (err) {
  db.prepare("ROLLBACK").run();
  console.error("❌ Seed thất bại, đã rollback:", err);
  process.exit(1);
}
