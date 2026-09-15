import type { Metadata } from "next";
import ProductListing from "@/components/site/ProductListing";

export const metadata: Metadata = {
  title: "Groom Collection",
  description: "Bộ sưu tập vest, tuxedo chú rể may đo riêng của TomQ Bridal — sang trọng và tinh tế.",
};

export default async function GroomProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return (
    <ProductListing
      type="GROOM"
      title="The Maison Collection"
      subtitle="Tailored suits and tuxedos designed for the modern groom, crafted with premium fabrics."
      categorySlug={category}
    />
  );
}
