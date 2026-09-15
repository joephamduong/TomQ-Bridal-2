import { getDb, newId, nowIso, toBool, fromBool } from "@/lib/db";
import type {
  Category,
  Product,
  ProductDetail,
  ProductImage,
  OptionRef,
  ProductType,
} from "@/lib/types";

// ---------- Categories ----------
export function listCategories(type?: ProductType): Category[] {
  const db = getDb();
  const rows = type
    ? db
        .prepare(
          `SELECT * FROM categories WHERE type = ? ORDER BY sort_order ASC, name ASC`
        )
        .all(type)
    : db.prepare(`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`).all();
  return rows.map(mapCategory);
}

export function getCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM categories WHERE slug = ?`).get(slug);
  return row ? mapCategory(row) : null;
}

export function createCategory(data: {
  name: string;
  slug: string;
  type: ProductType;
  sortOrder?: number;
}): Category {
  const db = getDb();
  const id = newId("cat");
  db.prepare(
    `INSERT INTO categories (id, name, slug, type, sort_order) VALUES (?, ?, ?, ?, ?)`
  ).run(id, data.name, data.slug, data.type, data.sortOrder ?? 0);
  return getCategoryBySlug(data.slug)!;
}

export function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; type: ProductType; sortOrder: number }>
) {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM categories WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) return null;
  db.prepare(
    `UPDATE categories SET name=?, slug=?, type=?, sort_order=? WHERE id=?`
  ).run(
    data.name ?? (existing.name as string),
    data.slug ?? (existing.slug as string),
    data.type ?? (existing.type as string),
    data.sortOrder ?? (existing.sort_order as number),
    id
  );
  return mapCategory(db.prepare(`SELECT * FROM categories WHERE id=?`).get(id));
}

export function deleteCategory(id: string) {
  getDb().prepare(`DELETE FROM categories WHERE id=?`).run(id);
}

function mapCategory(row: unknown): Category {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    type: r.type as ProductType,
    sortOrder: r.sort_order as number,
  };
}

// ---------- Products ----------
type ProductRow = Record<string, unknown>;

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id as string,
    sku: row.sku as string,
    name: row.name as string,
    slug: row.slug as string,
    type: row.type as ProductType,
    shortDescription: (row.short_description as string) ?? null,
    description: (row.description as string) ?? "",
    price: row.price as number,
    compareAtPrice: (row.compare_at_price as number) ?? null,
    isFeatured: toBool(row.is_featured),
    isNew: toBool(row.is_new),
    isPublished: toBool(row.is_published),
    isTryOnEnabled: toBool(row.is_tryon_enabled),
    categoryId: (row.category_id as string) ?? null,
    categoryName: (row.category_name as string) ?? null,
    categorySlug: (row.category_slug as string) ?? null,
    metaTitle: (row.meta_title as string) ?? null,
    metaDescription: (row.meta_description as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const PRODUCT_SELECT = `
  SELECT p.*, c.name as category_name, c.slug as category_slug
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
`;

export function listProducts(opts: {
  type?: ProductType;
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  publishedOnly?: boolean;
  limit?: number;
  offset?: number;
} = {}): { items: Product[]; total: number } {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (opts.type) {
    clauses.push("p.type = ?");
    params.push(opts.type);
  }
  if (opts.categorySlug) {
    clauses.push("c.slug = ?");
    params.push(opts.categorySlug);
  }
  if (opts.search) {
    clauses.push("(p.name LIKE ? OR p.short_description LIKE ?)");
    params.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  if (opts.featuredOnly) {
    clauses.push("p.is_featured = 1");
  }
  if (opts.publishedOnly !== false) {
    clauses.push("p.is_published = 1");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const countRow = db
    .prepare(`SELECT COUNT(*) as cnt FROM products p LEFT JOIN categories c ON c.id = p.category_id ${where}`)
    .get(...params) as { cnt: number };

  let sql = `${PRODUCT_SELECT} ${where} ORDER BY p.created_at DESC`;
  if (opts.limit) {
    sql += ` LIMIT ${Number(opts.limit)}`;
    if (opts.offset) sql += ` OFFSET ${Number(opts.offset)}`;
  }
  const rows = db.prepare(sql).all(...params) as ProductRow[];
  return { items: rows.map(mapProduct), total: countRow.cnt };
}

// Lấy danh sách sản phẩm kèm ảnh đại diện (ảnh đầu tiên) — dùng cho các trang danh sách/lưới sản phẩm
export function listProductsWithPrimaryImage(
  opts: Parameters<typeof listProducts>[0] = {}
): { items: (Product & { primaryImage: ProductImage | null })[]; total: number } {
  const { items, total } = listProducts(opts);
  const db = getDb();
  const withImages = items.map((p) => {
    const img = db
      .prepare(`SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order ASC LIMIT 1`)
      .get(p.id) as Record<string, unknown> | undefined;
    return {
      ...p,
      primaryImage: img
        ? { id: img.id as string, url: img.url as string, alt: (img.alt as string) ?? null, sortOrder: img.sort_order as number }
        : null,
    };
  });
  return { items: withImages, total };
}

export function getProductById(id: string): ProductDetail | null {
  const db = getDb();
  const row = db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as ProductRow | undefined;
  if (!row) return null;
  return hydrateProduct(row);
}

export function getProductBySlug(slug: string): ProductDetail | null {
  const db = getDb();
  const row = db.prepare(`${PRODUCT_SELECT} WHERE p.slug = ?`).get(slug) as
    | ProductRow
    | undefined;
  if (!row) return null;
  return hydrateProduct(row);
}

function hydrateProduct(row: ProductRow): ProductDetail {
  const db = getDb();
  const product = mapProduct(row);
  const images = db
    .prepare(`SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`)
    .all(product.id) as Record<string, unknown>[];
  const materials = db
    .prepare(
      `SELECT m.* FROM materials m
       JOIN product_materials pm ON pm.material_id = m.id
       WHERE pm.product_id = ? AND m.is_active = 1`
    )
    .all(product.id) as Record<string, unknown>[];
  const styles = db
    .prepare(
      `SELECT s.* FROM style_options s
       JOIN product_styles ps ON ps.style_id = s.id
       WHERE ps.product_id = ? AND s.is_active = 1`
    )
    .all(product.id) as Record<string, unknown>[];
  const colors = db
    .prepare(
      `SELECT co.* FROM color_options co
       JOIN product_colors pc ON pc.color_id = co.id
       WHERE pc.product_id = ? AND co.is_active = 1`
    )
    .all(product.id) as Record<string, unknown>[];
  const sizes = db
    .prepare(
      `SELECT sz.* FROM size_options sz
       JOIN product_sizes psz ON psz.size_id = sz.id
       WHERE psz.product_id = ?
       ORDER BY sz.sort_order ASC`
    )
    .all(product.id) as Record<string, unknown>[];

  return {
    ...product,
    images: images.map(
      (i): ProductImage => ({
        id: i.id as string,
        url: i.url as string,
        alt: (i.alt as string) ?? null,
        sortOrder: i.sort_order as number,
      })
    ),
    materials: materials.map(
      (m): OptionRef => ({
        id: m.id as string,
        name: m.name as string,
        slug: m.slug as string,
        extraPrice: m.extra_price as number,
        aiPromptTag: (m.ai_prompt_tag as string) ?? null,
        swatchImageUrl: (m.swatch_image_url as string) ?? null,
      })
    ),
    styles: styles.map(
      (s): OptionRef => ({
        id: s.id as string,
        name: s.name as string,
        slug: s.slug as string,
        extraPrice: s.extra_price as number,
        aiPromptTag: (s.ai_prompt_tag as string) ?? null,
        imageUrl: (s.image_url as string) ?? null,
      })
    ),
    colors: colors.map(
      (c): OptionRef => ({
        id: c.id as string,
        name: c.name as string,
        extraPrice: c.extra_price as number,
        aiPromptTag: (c.ai_prompt_tag as string) ?? null,
        hexCode: c.hex_code as string,
      })
    ),
    sizes: sizes.map(
      (s): OptionRef => ({
        id: s.id as string,
        name: s.label as string,
        label: s.label as string,
        extraPrice: 0,
      })
    ),
  };
}

export function createProduct(data: {
  sku: string;
  name: string;
  slug: string;
  type: ProductType;
  shortDescription?: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  isFeatured?: boolean;
  isNew?: boolean;
  isPublished?: boolean;
  isTryOnEnabled?: boolean;
  categoryId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  images?: { url: string; alt?: string }[];
  materialIds?: string[];
  styleIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
}): ProductDetail {
  const db = getDb();
  const id = newId("prod");
  const now = nowIso();
  db.prepare(
    `INSERT INTO products (id, sku, name, slug, type, short_description, description, price, compare_at_price,
      is_featured, is_new, is_published, is_tryon_enabled, category_id, meta_title, meta_description, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    data.sku,
    data.name,
    data.slug,
    data.type,
    data.shortDescription ?? null,
    data.description,
    data.price,
    data.compareAtPrice ?? null,
    fromBool(!!data.isFeatured),
    fromBool(!!data.isNew),
    fromBool(data.isPublished !== false),
    fromBool(data.isTryOnEnabled !== false),
    data.categoryId ?? null,
    data.metaTitle ?? null,
    data.metaDescription ?? null,
    now,
    now
  );
  syncProductImages(id, data.images ?? []);
  syncProductOptions(id, "material", data.materialIds ?? []);
  syncProductOptions(id, "style", data.styleIds ?? []);
  syncProductOptions(id, "color", data.colorIds ?? []);
  syncProductOptions(id, "size", data.sizeIds ?? []);
  return getProductById(id)!;
}

export function updateProduct(
  id: string,
  data: Partial<{
    sku: string;
    name: string;
    slug: string;
    type: ProductType;
    shortDescription: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    isFeatured: boolean;
    isNew: boolean;
    isPublished: boolean;
    isTryOnEnabled: boolean;
    categoryId: string | null;
    metaTitle: string;
    metaDescription: string;
    images: { url: string; alt?: string }[];
    materialIds: string[];
    styleIds: string[];
    colorIds: string[];
    sizeIds: string[];
  }>
): ProductDetail | null {
  const db = getDb();
  const existing = getProductById(id);
  if (!existing) return null;
  db.prepare(
    `UPDATE products SET sku=?, name=?, slug=?, type=?, short_description=?, description=?, price=?, compare_at_price=?,
     is_featured=?, is_new=?, is_published=?, is_tryon_enabled=?, category_id=?, meta_title=?, meta_description=?, updated_at=?
     WHERE id=?`
  ).run(
    data.sku ?? existing.sku,
    data.name ?? existing.name,
    data.slug ?? existing.slug,
    data.type ?? existing.type,
    data.shortDescription ?? existing.shortDescription,
    data.description ?? existing.description,
    data.price ?? existing.price,
    data.compareAtPrice === undefined ? existing.compareAtPrice : data.compareAtPrice,
    fromBool(data.isFeatured ?? existing.isFeatured),
    fromBool(data.isNew ?? existing.isNew),
    fromBool(data.isPublished ?? existing.isPublished),
    fromBool(data.isTryOnEnabled ?? existing.isTryOnEnabled),
    data.categoryId === undefined ? existing.categoryId : data.categoryId,
    data.metaTitle ?? existing.metaTitle,
    data.metaDescription ?? existing.metaDescription,
    nowIso(),
    id
  );
  if (data.images) syncProductImages(id, data.images);
  if (data.materialIds) syncProductOptions(id, "material", data.materialIds);
  if (data.styleIds) syncProductOptions(id, "style", data.styleIds);
  if (data.colorIds) syncProductOptions(id, "color", data.colorIds);
  if (data.sizeIds) syncProductOptions(id, "size", data.sizeIds);
  return getProductById(id);
}

export function deleteProduct(id: string) {
  getDb().prepare(`DELETE FROM products WHERE id=?`).run(id);
}

function syncProductImages(productId: string, images: { url: string; alt?: string }[]) {
  const db = getDb();
  db.prepare(`DELETE FROM product_images WHERE product_id=?`).run(productId);
  const stmt = db.prepare(
    `INSERT INTO product_images (id, product_id, url, alt, sort_order) VALUES (?,?,?,?,?)`
  );
  images.forEach((img, idx) => {
    stmt.run(newId("img"), productId, img.url, img.alt ?? null, idx);
  });
}

function syncProductOptions(
  productId: string,
  kind: "material" | "style" | "color" | "size",
  ids: string[]
) {
  const db = getDb();
  const table =
    kind === "material"
      ? "product_materials"
      : kind === "style"
      ? "product_styles"
      : kind === "color"
      ? "product_colors"
      : "product_sizes";
  const col =
    kind === "material"
      ? "material_id"
      : kind === "style"
      ? "style_id"
      : kind === "color"
      ? "color_id"
      : "size_id";
  db.prepare(`DELETE FROM ${table} WHERE product_id=?`).run(productId);
  const stmt = db.prepare(`INSERT INTO ${table} (id, product_id, ${col}) VALUES (?,?,?)`);
  ids.forEach((optId) => stmt.run(newId("po"), productId, optId));
}

// ---------- Materials ----------
export function listMaterials(activeOnly = false): OptionRef[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM materials ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY name ASC`
    )
    .all() as Record<string, unknown>[];
  return rows.map((m) => ({
    id: m.id as string,
    name: m.name as string,
    slug: m.slug as string,
    extraPrice: m.extra_price as number,
    aiPromptTag: (m.ai_prompt_tag as string) ?? null,
    swatchImageUrl: (m.swatch_image_url as string) ?? null,
  }));
}

export function createMaterial(data: {
  name: string;
  slug: string;
  description?: string;
  swatchImageUrl?: string;
  extraPrice?: number;
  aiPromptTag?: string;
  isActive?: boolean;
}) {
  const db = getDb();
  const id = newId("mat");
  db.prepare(
    `INSERT INTO materials (id, name, slug, description, swatch_image_url, extra_price, ai_prompt_tag, is_active)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(
    id,
    data.name,
    data.slug,
    data.description ?? null,
    data.swatchImageUrl ?? null,
    data.extraPrice ?? 0,
    data.aiPromptTag ?? null,
    fromBool(data.isActive !== false)
  );
  return id;
}

export function updateMaterial(id: string, data: Partial<{
  name: string; slug: string; description: string; swatchImageUrl: string;
  extraPrice: number; aiPromptTag: string; isActive: boolean;
}>) {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM materials WHERE id=?`).get(id) as Record<string, unknown> | undefined;
  if (!existing) return null;
  db.prepare(
    `UPDATE materials SET name=?, slug=?, description=?, swatch_image_url=?, extra_price=?, ai_prompt_tag=?, is_active=? WHERE id=?`
  ).run(
    data.name ?? (existing.name as string),
    data.slug ?? (existing.slug as string),
    data.description ?? (existing.description as string | null),
    data.swatchImageUrl ?? (existing.swatch_image_url as string | null),
    data.extraPrice ?? (existing.extra_price as number),
    data.aiPromptTag ?? (existing.ai_prompt_tag as string | null),
    fromBool(data.isActive ?? toBool(existing.is_active)),
    id
  );
  return id;
}

export function deleteMaterial(id: string) {
  getDb().prepare(`DELETE FROM materials WHERE id=?`).run(id);
}

// ---------- Style Options ----------
export function listStyles(activeOnly = false): OptionRef[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM style_options ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY name ASC`)
    .all() as Record<string, unknown>[];
  return rows.map((s) => ({
    id: s.id as string,
    name: s.name as string,
    slug: s.slug as string,
    extraPrice: s.extra_price as number,
    aiPromptTag: (s.ai_prompt_tag as string) ?? null,
    imageUrl: (s.image_url as string) ?? null,
  }));
}

export function createStyle(data: {
  name: string; slug: string; description?: string; imageUrl?: string;
  extraPrice?: number; aiPromptTag?: string; isActive?: boolean;
}) {
  const db = getDb();
  const id = newId("sty");
  db.prepare(
    `INSERT INTO style_options (id, name, slug, description, image_url, extra_price, ai_prompt_tag, is_active)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(
    id, data.name, data.slug, data.description ?? null, data.imageUrl ?? null,
    data.extraPrice ?? 0, data.aiPromptTag ?? null, fromBool(data.isActive !== false)
  );
  return id;
}

export function updateStyle(id: string, data: Partial<{
  name: string; slug: string; description: string; imageUrl: string;
  extraPrice: number; aiPromptTag: string; isActive: boolean;
}>) {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM style_options WHERE id=?`).get(id) as Record<string, unknown> | undefined;
  if (!existing) return null;
  db.prepare(
    `UPDATE style_options SET name=?, slug=?, description=?, image_url=?, extra_price=?, ai_prompt_tag=?, is_active=? WHERE id=?`
  ).run(
    data.name ?? (existing.name as string), data.slug ?? (existing.slug as string), data.description ?? (existing.description as string | null),
    data.imageUrl ?? (existing.image_url as string | null), data.extraPrice ?? (existing.extra_price as number),
    data.aiPromptTag ?? (existing.ai_prompt_tag as string | null), fromBool(data.isActive ?? toBool(existing.is_active)), id
  );
  return id;
}

export function deleteStyle(id: string) {
  getDb().prepare(`DELETE FROM style_options WHERE id=?`).run(id);
}

// ---------- Color Options ----------
export function listColors(activeOnly = false): OptionRef[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM color_options ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY name ASC`)
    .all() as Record<string, unknown>[];
  return rows.map((c) => ({
    id: c.id as string,
    name: c.name as string,
    extraPrice: c.extra_price as number,
    aiPromptTag: (c.ai_prompt_tag as string) ?? null,
    hexCode: c.hex_code as string,
  }));
}

export function createColor(data: { name: string; hexCode?: string; extraPrice?: number; aiPromptTag?: string; isActive?: boolean }) {
  const db = getDb();
  const id = newId("col");
  db.prepare(`INSERT INTO color_options (id, name, hex_code, extra_price, ai_prompt_tag, is_active) VALUES (?,?,?,?,?,?)`).run(
    id, data.name, data.hexCode ?? "#FFFFFF", data.extraPrice ?? 0, data.aiPromptTag ?? null, fromBool(data.isActive !== false)
  );
  return id;
}

export function updateColor(id: string, data: Partial<{ name: string; hexCode: string; extraPrice: number; aiPromptTag: string; isActive: boolean }>) {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM color_options WHERE id=?`).get(id) as Record<string, unknown> | undefined;
  if (!existing) return null;
  db.prepare(`UPDATE color_options SET name=?, hex_code=?, extra_price=?, ai_prompt_tag=?, is_active=? WHERE id=?`).run(
    data.name ?? (existing.name as string), data.hexCode ?? (existing.hex_code as string), data.extraPrice ?? (existing.extra_price as number),
    data.aiPromptTag ?? (existing.ai_prompt_tag as string | null), fromBool(data.isActive ?? toBool(existing.is_active)), id
  );
  return id;
}

export function deleteColor(id: string) {
  getDb().prepare(`DELETE FROM color_options WHERE id=?`).run(id);
}

// ---------- Size Options ----------
export function listSizes(): OptionRef[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM size_options ORDER BY sort_order ASC`).all() as Record<string, unknown>[];
  return rows.map((s) => ({ id: s.id as string, name: s.label as string, label: s.label as string, extraPrice: 0 }));
}

export function createSize(label: string, sortOrder = 0) {
  const db = getDb();
  const id = newId("siz");
  db.prepare(`INSERT INTO size_options (id, label, sort_order) VALUES (?,?,?)`).run(id, label, sortOrder);
  return id;
}

export function deleteSize(id: string) {
  getDb().prepare(`DELETE FROM size_options WHERE id=?`).run(id);
}
