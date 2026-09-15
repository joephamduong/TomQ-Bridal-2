"use client";

import { TextInput, TextArea, Toggle, Select } from "@/components/admin/FormFields";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import CheckboxGroup from "@/components/admin/CheckboxGroup";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Category, OptionRef, ProductDetail } from "@/lib/types";

export default function ProductForm({
  action,
  product,
  categories,
  materials,
  styles,
  colors,
  sizes,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  product?: ProductDetail;
  categories: Category[];
  materials: OptionRef[];
  styles: OptionRef[];
  colors: OptionRef[];
  sizes: OptionRef[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-8 max-w-3xl">
      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput name="name" label="Tên sản phẩm" required defaultValue={product?.name} />
          <TextInput name="sku" label="Mã SKU" defaultValue={product?.sku} placeholder="Tự sinh nếu để trống" />
          <Select
            name="type"
            label="Loại sản phẩm"
            defaultValue={product?.type || "BRIDE"}
            options={[
              { value: "BRIDE", label: "Cô dâu" },
              { value: "GROOM", label: "Chú rể" },
            ]}
          />
          <Select
            name="categoryId"
            label="Danh mục"
            defaultValue={product?.categoryId || ""}
            options={[{ value: "", label: "— Không có —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <TextInput name="price" label="Giá bán" type="number" step="0.01" required defaultValue={product?.price} />
          <TextInput name="compareAtPrice" label="Giá gốc (gạch ngang, nếu có)" type="number" step="0.01" defaultValue={product?.compareAtPrice ?? undefined} />
        </div>
        <TextArea name="shortDescription" label="Mô tả ngắn" defaultValue={product?.shortDescription ?? undefined} rows={2} />
        <div className="flex flex-wrap gap-6 pt-2">
          <Toggle name="isPublished" label="Hiển thị trên website" defaultChecked={product?.isPublished ?? true} />
          <Toggle name="isFeatured" label="Sản phẩm nổi bật" defaultChecked={product?.isFeatured} />
          <Toggle name="isNew" label="Gắn nhãn Mới" defaultChecked={product?.isNew} />
          <Toggle name="isTryOnEnabled" label="Cho phép thử đồ AI" defaultChecked={product?.isTryOnEnabled ?? true} />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Hình ảnh sản phẩm</h2>
        <MultiImageUpload name="imageUrls" label="" defaultValues={product?.images.map((i) => i.url) || []} />
      </div>

      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Tùy chọn (chất liệu / kiểu dáng / màu / size)
        </h2>
        <p className="text-xs text-neutral-400 -mt-3">
          Đây cũng là dữ liệu được dùng làm &quot;nguyên liệu&quot; mô tả cho AI khi dựng ảnh thử đồ.
        </p>
        <CheckboxGroup
          name="materialIds"
          label="Chất liệu áp dụng"
          options={materials.map((m) => ({ id: m.id, label: m.name }))}
          defaultSelected={product?.materials.map((m) => m.id) || []}
        />
        <CheckboxGroup
          name="styleIds"
          label="Kiểu dáng áp dụng"
          options={styles.map((s) => ({ id: s.id, label: s.name }))}
          defaultSelected={product?.styles.map((s) => s.id) || []}
        />
        <CheckboxGroup
          name="colorIds"
          label="Màu sắc áp dụng"
          options={colors.map((c) => ({ id: c.id, label: c.name }))}
          defaultSelected={product?.colors.map((c) => c.id) || []}
        />
        <CheckboxGroup
          name="sizeIds"
          label="Size áp dụng"
          options={sizes.map((s) => ({ id: s.id, label: s.label || s.name }))}
          defaultSelected={product?.sizes.map((s) => s.id) || []}
        />
      </div>

      <div className="bg-white border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Mô tả chi tiết</h2>
        <RichTextEditor name="description" defaultValue={product?.description || ""} uploadSubdir="products" />
      </div>

      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">SEO</h2>
        <TextInput name="metaTitle" label="Meta title" defaultValue={product?.metaTitle ?? undefined} />
        <TextArea name="metaDescription" label="Meta description" defaultValue={product?.metaDescription ?? undefined} rows={2} />
      </div>

      <button type="submit" className="bg-neutral-900 text-white text-sm px-6 py-3">
        {submitLabel}
      </button>
    </form>
  );
}
