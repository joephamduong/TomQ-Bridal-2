import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/repo/catalog";
import { getSiteSettings } from "@/lib/repo/settings";
import TryOnConfigurator from "@/components/site/TryOnConfigurator";

export default async function TryOnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ material?: string; style?: string; color?: string }>;
}) {
  const { slug } = await params;
  const initial = await searchParams;
  const product = getProductBySlug(slug);
  if (!product || !product.isPublished || !product.isTryOnEnabled) notFound();
  const settings = getSiteSettings();

  return <TryOnConfigurator product={product} initial={initial} fee={settings.tryOnFee} />;
}
