import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listBlogCategories } from "@/lib/repo/blog";
import { createBlogPostAction } from "@/app/actions/admin";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  const categories = listBlogCategories();

  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách bài viết
      </Link>
      <h1 className="font-heading text-2xl mb-1">Viết bài mới</h1>
      <p className="text-sm text-neutral-500 mb-8">Tạo bài viết blog chuẩn SEO cho TomQ Bridal.</p>

      <BlogPostForm action={createBlogPostAction} categories={categories} submitLabel="Đăng bài" />
    </div>
  );
}
