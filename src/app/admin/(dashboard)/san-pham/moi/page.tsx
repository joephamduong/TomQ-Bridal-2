import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories, listMaterials, listStyles, listColors, listSizes } from "@/lib/repo/catalog";
import { createProductAction } from "@/app/actions/admin";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, materials, styles, colors, sizes] = [
    listCategories(),
    listMaterials(true),
    listStyles(true),
    listColors(true),
    listSizes(),
  ];

  return (
    <div>
      <Link href="/admin/san-pham" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách sản phẩm
      </Link>
      <h1 className="font-heading text-2xl mb-1">Thêm sản phẩm mới</h1>
      <p className="text-sm text-neutral-500 mb-8">Tạo một áo cưới cô dâu hoặc vest chú rể mới cho website.</p>

      <ProductForm
        action={createProductAction}
        categories={categories}
        materials={materials}
        styles={styles}
        colors={colors}
        sizes={sizes}
        submitLabel="Tạo sản phẩm"
      />
    </div>
  );
}
