import type { Metadata } from "next";
import ProductListing from "@/components/site/ProductListing";

export const metadata: Metadata = {
  title: "Bridal Collection",
  description: "Bộ sưu tập áo cưới couture và ready-to-wear của TomQ Bridal — thiết kế tinh xảo cho cô dâu hiện đại.",
};

export default async function BrideProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return (
    <ProductListing
      type="BRIDE"
      title="The Bridal Collection"
      subtitle="An exclusive selection of timeless bridal gowns crafted for the modern bride."
      categorySlug={category}
    />
  );
}
