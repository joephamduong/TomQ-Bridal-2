import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, listProductsWithPrimaryImage } from "@/lib/repo/catalog";
import ProductDetailClient from "@/components/site/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product || !product.isPublished) notFound();

  const related = listProductsWithPrimaryImage({
    type: product.type,
    limit: 4,
  }).items.filter((p) => p.id !== product.id);

  return <ProductDetailClient product={product} related={related} />;
}
