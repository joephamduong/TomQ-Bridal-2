import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductById, listCategories, listMaterials, listStyles, listColors, listSizes } from "@/lib/repo/catalog";
import { updateProductAction, deleteProductAction } from "@/app/actions/admin";
import ProductForm from "@/components/admin/ProductForm";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const [categories, materials, styles, colors, sizes] = [
    listCategories(),
    listMaterials(true),
    listStyles(true),
    listColors(true),
    listSizes(),
  ];

  const boundUpdate = updateProductAction.bind(null, id);
  const boundDelete = deleteProductAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/san-pham" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách sản phẩm
      </Link>
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-heading text-2xl">{product.name}</h1>
        <DeleteButton action={boundDelete} label="Xóa sản phẩm" confirmText="Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác." />
      </div>
      <p className="text-sm text-neutral-500 mb-8">Mã SKU: {product.sku}</p>

      <ProductForm
        action={boundUpdate}
        product={product}
        categories={categories}
        materials={materials}
        styles={styles}
        colors={colors}
        sizes={sizes}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
