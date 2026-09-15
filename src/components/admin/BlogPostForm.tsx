"use client";

import { TextInput, TextArea, Toggle, Select } from "@/components/admin/FormFields";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { BlogCategory, BlogPost } from "@/lib/types";

export default function BlogPostForm({
  action,
  post,
  categories,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  post?: BlogPost;
  categories: BlogCategory[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-8 max-w-3xl">
      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Thông tin bài viết</h2>
        <TextInput name="title" label="Tiêu đề (H1)" required defaultValue={post?.title} />
        <TextArea name="excerpt" label="Mô tả ngắn / tóm tắt" defaultValue={post?.excerpt ?? undefined} rows={2} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            name="categoryId"
            label="Chủ đề"
            defaultValue={post?.categoryId || ""}
            options={[{ value: "", label: "— Không có —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <TextInput name="author" label="Tác giả" defaultValue={post?.author || "TomQ Bridal"} />
        </div>
        <Toggle name="isPublished" label="Đăng bài trên website" defaultChecked={post?.isPublished ?? true} />
      </div>

      <div className="bg-white border border-neutral-200 p-6">
        <ImageUploadField name="coverImageUrl" label="Ảnh bìa" defaultValue={post?.coverImageUrl} subdir="blog" aspect="aspect-video" />
      </div>

      <div className="bg-white border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">
          Nội dung bài viết
        </h2>
        <p className="text-xs text-neutral-400 -mt-3 mb-4">
          Dùng H2 / H3 cho các mục lớn — mục lục (TOC) sẽ tự động được tạo cho SEO. Có thể chèn ảnh xen giữa nội dung.
        </p>
        <RichTextEditor name="contentHtml" defaultValue={post?.contentHtml || ""} uploadSubdir="blog" />
      </div>

      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">SEO</h2>
        <TextInput name="metaTitle" label="Meta title" defaultValue={post?.metaTitle ?? undefined} />
        <TextArea name="metaDescription" label="Meta description" defaultValue={post?.metaDescription ?? undefined} rows={2} />
        <TextInput name="metaKeywords" label="Từ khóa (phân cách bởi dấu phẩy)" defaultValue={post?.metaKeywords ?? undefined} />
      </div>

      <button type="submit" className="bg-neutral-900 text-white text-sm px-6 py-3">
        {submitLabel}
      </button>
    </form>
  );
}
