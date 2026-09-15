import { getDb, newId, nowIso, toBool, fromBool } from "@/lib/db";
import type { BlogCategory, BlogPost } from "@/lib/types";

function mapCategory(row: Record<string, unknown>): BlogCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    sortOrder: row.sort_order as number,
    postCount: (row.post_count as number) ?? undefined,
  };
}

export function listBlogCategories(): BlogCategory[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM blog_posts p WHERE p.category_id = c.id AND p.is_published = 1) as post_count
       FROM blog_categories c ORDER BY c.sort_order ASC, c.name ASC`
    )
    .all() as Record<string, unknown>[];
  return rows.map(mapCategory);
}

export function createBlogCategory(name: string, slug: string, sortOrder = 0) {
  const db = getDb();
  const id = newId("bcat");
  db.prepare(`INSERT INTO blog_categories (id, name, slug, sort_order) VALUES (?,?,?,?)`).run(
    id,
    name,
    slug,
    sortOrder
  );
  return id;
}

export function updateBlogCategory(id: string, data: Partial<{ name: string; slug: string; sortOrder: number }>) {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM blog_categories WHERE id=?`).get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) return null;
  db.prepare(`UPDATE blog_categories SET name=?, slug=?, sort_order=? WHERE id=?`).run(
    data.name ?? (existing.name as string),
    data.slug ?? (existing.slug as string),
    data.sortOrder ?? (existing.sort_order as number),
    id
  );
  return id;
}

export function deleteBlogCategory(id: string) {
  getDb().prepare(`DELETE FROM blog_categories WHERE id=?`).run(id);
}

function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) ?? null,
    coverImageUrl: (row.cover_image_url as string) ?? null,
    contentHtml: row.content_html as string,
    categoryId: (row.category_id as string) ?? null,
    categoryName: (row.category_name as string) ?? null,
    categorySlug: (row.category_slug as string) ?? null,
    author: row.author as string,
    isPublished: toBool(row.is_published),
    metaTitle: (row.meta_title as string) ?? null,
    metaDescription: (row.meta_description as string) ?? null,
    metaKeywords: (row.meta_keywords as string) ?? null,
    readingMinutes: row.reading_minutes as number,
    publishedAt: row.published_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const POST_SELECT = `
  SELECT p.*, c.name as category_name, c.slug as category_slug
  FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id
`;

export function listBlogPosts(opts: {
  categorySlug?: string;
  search?: string;
  publishedOnly?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (opts.categorySlug) {
    clauses.push(`c.slug = ?`);
    params.push(opts.categorySlug);
  }
  if (opts.search) {
    clauses.push(`(p.title LIKE ? OR p.excerpt LIKE ?)`);
    params.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  if (opts.publishedOnly !== false) {
    clauses.push(`p.is_published = 1`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    db
      .prepare(`SELECT COUNT(*) as cnt FROM blog_posts p LEFT JOIN blog_categories c ON c.id=p.category_id ${where}`)
      .get(...params) as { cnt: number }
  ).cnt;
  let sql = `${POST_SELECT} ${where} ORDER BY p.published_at DESC`;
  if (opts.limit) sql += ` LIMIT ${Number(opts.limit)} OFFSET ${Number(opts.offset ?? 0)}`;
  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  return { items: rows.map(mapPost), total };
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const db = getDb();
  const row = db.prepare(`${POST_SELECT} WHERE p.slug=?`).get(slug) as
    | Record<string, unknown>
    | undefined;
  return row ? mapPost(row) : null;
}

export function getBlogPostById(id: string): BlogPost | null {
  const db = getDb();
  const row = db.prepare(`${POST_SELECT} WHERE p.id=?`).get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapPost(row) : null;
}

export function getRelatedPosts(categoryId: string | null, excludeId: string, limit = 3): BlogPost[] {
  const db = getDb();
  if (!categoryId) return [];
  const rows = db
    .prepare(
      `${POST_SELECT} WHERE p.category_id=? AND p.id != ? AND p.is_published=1 ORDER BY p.published_at DESC LIMIT ?`
    )
    .all(categoryId, excludeId, limit) as Record<string, unknown>[];
  return rows.map(mapPost);
}

export function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  contentHtml: string;
  categoryId?: string | null;
  author?: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  readingMinutes?: number;
}): BlogPost {
  const db = getDb();
  const id = newId("post");
  db.prepare(
    `INSERT INTO blog_posts (id, title, slug, excerpt, cover_image_url, content_html, category_id, author, is_published, meta_title, meta_description, meta_keywords, reading_minutes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    data.title,
    data.slug,
    data.excerpt ?? null,
    data.coverImageUrl ?? null,
    data.contentHtml,
    data.categoryId ?? null,
    data.author ?? "Bridal Atelier",
    fromBool(data.isPublished !== false),
    data.metaTitle ?? null,
    data.metaDescription ?? null,
    data.metaKeywords ?? null,
    data.readingMinutes ?? estimateReadingMinutes(data.contentHtml)
  );
  return getBlogPostById(id)!;
}

export function updateBlogPost(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    coverImageUrl: string;
    contentHtml: string;
    categoryId: string | null;
    author: string;
    isPublished: boolean;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    readingMinutes: number;
  }>
): BlogPost | null {
  const db = getDb();
  const existing = getBlogPostById(id);
  if (!existing) return null;
  db.prepare(
    `UPDATE blog_posts SET title=?, slug=?, excerpt=?, cover_image_url=?, content_html=?, category_id=?, author=?, is_published=?, meta_title=?, meta_description=?, meta_keywords=?, reading_minutes=?, updated_at=?
     WHERE id=?`
  ).run(
    data.title ?? existing.title,
    data.slug ?? existing.slug,
    data.excerpt ?? existing.excerpt,
    data.coverImageUrl ?? existing.coverImageUrl,
    data.contentHtml ?? existing.contentHtml,
    data.categoryId === undefined ? existing.categoryId : data.categoryId,
    data.author ?? existing.author,
    fromBool(data.isPublished ?? existing.isPublished),
    data.metaTitle ?? existing.metaTitle,
    data.metaDescription ?? existing.metaDescription,
    data.metaKeywords ?? existing.metaKeywords,
    data.readingMinutes ?? existing.readingMinutes,
    nowIso(),
    id
  );
  return getBlogPostById(id);
}

export function deleteBlogPost(id: string) {
  getDb().prepare(`DELETE FROM blog_posts WHERE id=?`).run(id);
}

export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
