"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { slugifyVi, ensureHeadingIds } from "@/lib/utils";
import * as catalog from "@/lib/repo/catalog";
import * as blog from "@/lib/repo/blog";
import * as settingsRepo from "@/lib/repo/settings";
import * as ordersRepo from "@/lib/repo/orders";
import * as tryonRepo from "@/lib/repo/tryon";
import * as customerRepo from "@/lib/repo/customer";
import { generateTryOnImage } from "@/lib/ai/tryon";
import type { OrderStatus } from "@/lib/types";
import type { TryOnStatus } from "@/lib/types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

function multi(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

// =========================== CATEGORIES ===========================
export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "BRIDE") as "BRIDE" | "GROOM";
  if (!name) return;
  catalog.createCategory({ name, slug: slugifyVi(name), type });
  revalidatePath("/admin/danh-muc");
  revalidatePath("/san-pham/co-dau");
  revalidatePath("/san-pham/chu-re");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  catalog.deleteCategory(id);
  revalidatePath("/admin/danh-muc");
}

// =========================== MATERIALS / STYLES / COLORS / SIZES ===========================
export async function createMaterialAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  catalog.createMaterial({
    name,
    slug: slugifyVi(name) + "-" + Math.random().toString(36).slice(2, 6),
    description: String(formData.get("description") || "") || undefined,
    swatchImageUrl: String(formData.get("swatchImageUrl") || "") || undefined,
    extraPrice: Number(formData.get("extraPrice") || 0),
    aiPromptTag: String(formData.get("aiPromptTag") || "") || undefined,
  });
  revalidatePath("/admin/chat-lieu");
}
export async function deleteMaterialAction(id: string) {
  await requireAdmin();
  catalog.deleteMaterial(id);
  revalidatePath("/admin/chat-lieu");
}

export async function createStyleAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  catalog.createStyle({
    name,
    slug: slugifyVi(name) + "-" + Math.random().toString(36).slice(2, 6),
    description: String(formData.get("description") || "") || undefined,
    imageUrl: String(formData.get("imageUrl") || "") || undefined,
    extraPrice: Number(formData.get("extraPrice") || 0),
    aiPromptTag: String(formData.get("aiPromptTag") || "") || undefined,
  });
  revalidatePath("/admin/kieu-dang");
}
export async function deleteStyleAction(id: string) {
  await requireAdmin();
  catalog.deleteStyle(id);
  revalidatePath("/admin/kieu-dang");
}

export async function createColorAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  catalog.createColor({
    name,
    hexCode: String(formData.get("hexCode") || "#FFFFFF"),
    extraPrice: Number(formData.get("extraPrice") || 0),
    aiPromptTag: String(formData.get("aiPromptTag") || "") || undefined,
  });
  revalidatePath("/admin/mau-sac");
}
export async function deleteColorAction(id: string) {
  await requireAdmin();
  catalog.deleteColor(id);
  revalidatePath("/admin/mau-sac");
}

export async function createSizeAction(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  catalog.createSize(label, Number(formData.get("sortOrder") || 0));
  revalidatePath("/admin/kich-thuoc");
}
export async function deleteSizeAction(id: string) {
  await requireAdmin();
  catalog.deleteSize(id);
  revalidatePath("/admin/kich-thuoc");
}

// =========================== PRODUCTS ===========================
export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "BRIDE") as "BRIDE" | "GROOM";
  const imageUrls = multi(formData, "imageUrls");

  const product = catalog.createProduct({
    sku: String(formData.get("sku") || `SKU-${Date.now()}`),
    name,
    slug: slugifyVi(name) + "-" + Math.random().toString(36).slice(2, 5),
    type,
    shortDescription: String(formData.get("shortDescription") || "") || undefined,
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    compareAtPrice: formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : null,
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
    isPublished: formData.get("isPublished") === "on",
    isTryOnEnabled: formData.get("isTryOnEnabled") === "on",
    categoryId: String(formData.get("categoryId") || "") || null,
    metaTitle: String(formData.get("metaTitle") || "") || undefined,
    metaDescription: String(formData.get("metaDescription") || "") || undefined,
    images: imageUrls.map((url) => ({ url })),
    materialIds: multi(formData, "materialIds"),
    styleIds: multi(formData, "styleIds"),
    colorIds: multi(formData, "colorIds"),
    sizeIds: multi(formData, "sizeIds"),
  });
  revalidatePath("/admin/san-pham");
  redirect(`/admin/san-pham/${product.id}`);
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const imageUrls = multi(formData, "imageUrls");
  catalog.updateProduct(id, {
    sku: String(formData.get("sku") || ""),
    name,
    type: String(formData.get("type") || "BRIDE") as "BRIDE" | "GROOM",
    shortDescription: String(formData.get("shortDescription") || ""),
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    compareAtPrice: formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : null,
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
    isPublished: formData.get("isPublished") === "on",
    isTryOnEnabled: formData.get("isTryOnEnabled") === "on",
    categoryId: String(formData.get("categoryId") || "") || null,
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    images: imageUrls.map((url) => ({ url })),
    materialIds: multi(formData, "materialIds"),
    styleIds: multi(formData, "styleIds"),
    colorIds: multi(formData, "colorIds"),
    sizeIds: multi(formData, "sizeIds"),
  });
  revalidatePath("/admin/san-pham");
  revalidatePath(`/admin/san-pham/${id}`);
  revalidatePath(`/san-pham/${name}`);
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  catalog.deleteProduct(id);
  revalidatePath("/admin/san-pham");
  redirect("/admin/san-pham");
}

// =========================== ORDERS ===========================
export async function updateOrderStatusAction(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") || "") as OrderStatus;
  if (!status) return;
  ordersRepo.updateOrderStatus(id, status);
  revalidatePath("/admin/don-hang");
  revalidatePath(`/admin/don-hang/${id}`);
}

// =========================== TRY-ON REQUESTS ===========================
export async function confirmTryOnPaymentAction(id: string) {
  await requireAdmin();
  tryonRepo.updateTryOnStatus(id, "PAYMENT_CONFIRMED");
  revalidatePath(`/admin/thu-do-ai/${id}`);
  await runTryOnGeneration(id);
}

export async function regenerateTryOnAction(id: string) {
  await requireAdmin();
  await runTryOnGeneration(id);
}

async function runTryOnGeneration(id: string) {
  const request = tryonRepo.getTryOnById(id);
  if (!request) return;
  tryonRepo.updateTryOnStatus(id, "PROCESSING");
  const product = catalog.getProductById(request.productId);
  try {
    const materialTag = product?.materials.find((m) => m.name === request.selectedMaterial)?.aiPromptTag;
    const styleTag = product?.styles.find((s) => s.name === request.selectedStyle)?.aiPromptTag;
    const colorTag = product?.colors.find((c) => c.name === request.selectedColor)?.aiPromptTag;

    const result = await generateTryOnImage(request.customerPhotoUrl, {
      productName: product?.name || "wedding gown",
      productType: product?.type || "BRIDE",
      styleLabel: request.selectedStyle,
      materialLabel: request.selectedMaterial,
      colorLabel: request.selectedColor,
      stylePromptTag: styleTag,
      materialPromptTag: materialTag,
      colorPromptTag: colorTag,
    });
    tryonRepo.setTryOnResult(id, result.imageUrl, result.provider);
  } catch (err) {
    tryonRepo.setTryOnError(id, err instanceof Error ? err.message : "Lỗi không xác định");
  }
  revalidatePath(`/admin/thu-do-ai/${id}`);
  revalidatePath("/admin/thu-do-ai");
}

export async function updateTryOnStatusAction(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") || "") as TryOnStatus;
  if (!status) return;
  tryonRepo.updateTryOnStatus(id, status);
  revalidatePath(`/admin/thu-do-ai/${id}`);
  revalidatePath("/admin/thu-do-ai");
}

// =========================== APPOINTMENTS ===========================
export async function updateAppointmentStatusAction(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") || "") as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  if (!status) return;
  customerRepo.updateAppointmentStatus(id, status);
  revalidatePath("/admin/lich-hen");
}
export async function markAppointmentDepositPaidAction(id: string) {
  await requireAdmin();
  customerRepo.updateAppointmentStatus(id, "CONFIRMED", true);
  revalidatePath("/admin/lich-hen");
}

// =========================== CONTACT ===========================
export async function markContactReadAction(id: string) {
  await requireAdmin();
  customerRepo.markContactMessageRead(id);
  revalidatePath("/admin/lien-he");
}

// =========================== CUSTOMER NOTE ===========================
export async function updateCustomerNoteAction(id: string, formData: FormData) {
  await requireAdmin();
  customerRepo.updateCustomerNote(id, String(formData.get("note") || ""));
  revalidatePath(`/admin/khach-hang/${id}`);
}

// =========================== BLOG ===========================
export async function createBlogCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  blog.createBlogCategory(name, slugifyVi(name));
  revalidatePath("/admin/blog/danh-muc");
}
export async function deleteBlogCategoryAction(id: string) {
  await requireAdmin();
  blog.deleteBlogCategory(id);
  revalidatePath("/admin/blog/danh-muc");
}

export async function createBlogPostAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const rawHtml = String(formData.get("contentHtml") || "");
  const contentHtml = ensureHeadingIds(rawHtml);
  const post = blog.createBlogPost({
    title,
    slug: slugifyVi(title) + "-" + Math.random().toString(36).slice(2, 5),
    excerpt: String(formData.get("excerpt") || "") || undefined,
    coverImageUrl: String(formData.get("coverImageUrl") || "") || undefined,
    contentHtml,
    categoryId: String(formData.get("categoryId") || "") || null,
    author: String(formData.get("author") || "TomQ Bridal"),
    isPublished: formData.get("isPublished") === "on",
    metaTitle: String(formData.get("metaTitle") || "") || undefined,
    metaDescription: String(formData.get("metaDescription") || "") || undefined,
    metaKeywords: String(formData.get("metaKeywords") || "") || undefined,
    readingMinutes: blog.estimateReadingMinutes(contentHtml),
  });
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${post.id}`);
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  await requireAdmin();
  const rawHtml = String(formData.get("contentHtml") || "");
  const contentHtml = ensureHeadingIds(rawHtml);
  blog.updateBlogPost(id, {
    title: String(formData.get("title") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    coverImageUrl: String(formData.get("coverImageUrl") || ""),
    contentHtml,
    categoryId: String(formData.get("categoryId") || "") || null,
    author: String(formData.get("author") || "TomQ Bridal"),
    isPublished: formData.get("isPublished") === "on",
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    metaKeywords: String(formData.get("metaKeywords") || ""),
    readingMinutes: blog.estimateReadingMinutes(contentHtml),
  });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

export async function deleteBlogPostAction(id: string) {
  await requireAdmin();
  blog.deleteBlogPost(id);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

// =========================== SITE SETTINGS ===========================
export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  settingsRepo.updateSiteSettings({
    siteName: String(formData.get("siteName") || ""),
    logoUrl: String(formData.get("logoUrl") || "") || null,
    faviconUrl: String(formData.get("faviconUrl") || "") || null,
    colorPrimary: String(formData.get("colorPrimary") || ""),
    colorSecondary: String(formData.get("colorSecondary") || ""),
    colorAccent: String(formData.get("colorAccent") || ""),
    colorDark: String(formData.get("colorDark") || ""),
    currencyCode: String(formData.get("currencyCode") || "AUD"),
    currencyLocale: String(formData.get("currencyLocale") || "en-AU"),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    facebookUrl: String(formData.get("facebookUrl") || "") || null,
    instagramUrl: String(formData.get("instagramUrl") || "") || null,
    zaloUrl: String(formData.get("zaloUrl") || "") || null,
    bankName: String(formData.get("bankName") || ""),
    bankAccountName: String(formData.get("bankAccountName") || ""),
    bankAccountNumber: String(formData.get("bankAccountNumber") || ""),
    bankBranch: String(formData.get("bankBranch") || ""),
    bankBsb: String(formData.get("bankBsb") || ""),
    bankQrImageUrl: String(formData.get("bankQrImageUrl") || "") || null,
    defaultShippingFee: Number(formData.get("defaultShippingFee") || 0),
    freeShippingThreshold: Number(formData.get("freeShippingThreshold") || 0),
    tryOnFee: Number(formData.get("tryOnFee") || 0),
    appointmentDeposit: Number(formData.get("appointmentDeposit") || 0),
  });
  revalidatePath("/admin/giao-dien");
  revalidatePath("/");
}

export async function updateHomeContentAction(formData: FormData) {
  await requireAdmin();
  settingsRepo.updateHomeContent({
    heroTitle: String(formData.get("heroTitle") || ""),
    heroSubtitle: String(formData.get("heroSubtitle") || ""),
    heroImageUrl: String(formData.get("heroImageUrl") || ""),
    introTitle: String(formData.get("introTitle") || ""),
    introBody: String(formData.get("introBody") || ""),
    introImageUrl: String(formData.get("introImageUrl") || ""),
    storyTitle: String(formData.get("storyTitle") || ""),
    storyBody: String(formData.get("storyBody") || ""),
    storyImageUrl: String(formData.get("storyImageUrl") || ""),
  });
  revalidatePath("/admin/giao-dien");
  revalidatePath("/");
}
