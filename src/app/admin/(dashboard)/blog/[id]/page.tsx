import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostById, listBlogCategories } from "@/lib/repo/blog";
import { updateBlogPostAction, deleteBlogPostAction } from "@/app/actions/admin";
import BlogPostForm from "@/components/admin/BlogPostForm";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getBlogPostById(id);
  if (!post) notFound();

  const categories = listBlogCategories();
  const boundUpdate = updateBlogPostAction.bind(null, id);
  const boundDelete = deleteBlogPostAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách bài viết
      </Link>
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-heading text-2xl">{post.title}</h1>
        <DeleteButton action={boundDelete} label="Xóa bài viết" confirmText="Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác." />
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        <Link href={`/blog/${post.slug}`} target="_blank" className="underline hover:text-neutral-900">
          Xem trên website →
        </Link>
      </p>

      <BlogPostForm action={boundUpdate} post={post} categories={categories} submitLabel="Lưu thay đổi" />
    </div>
  );
}
