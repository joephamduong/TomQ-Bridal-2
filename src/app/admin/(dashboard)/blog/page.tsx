import Link from "next/link";
import { Plus } from "lucide-react";
import { listBlogPosts } from "@/lib/repo/blog";
import { formatDateVi } from "@/lib/utils";

export default async function BlogAdminPage() {
  const { items } = listBlogPosts({ publishedOnly: false, limit: 200 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl mb-1">Bài viết blog</h1>
          <p className="text-sm text-neutral-500">Quản lý nội dung blog chuẩn SEO.</p>
        </div>
        <Link href="/admin/blog/moi" className="bg-neutral-900 text-white text-sm px-5 py-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Viết bài mới
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-6">Chưa có bài viết nào. Hãy viết bài đầu tiên.</p>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Tiêu đề</th>
                <th className="p-4">Chủ đề</th>
                <th className="p-4">Tác giả</th>
                <th className="p-4">Ngày đăng</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-4">
                    <Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-[var(--color-primary)]">
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-4 text-neutral-500">{p.categoryName || "—"}</td>
                  <td className="p-4 text-neutral-500">{p.author}</td>
                  <td className="p-4 text-neutral-500">{formatDateVi(p.publishedAt)}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.isPublished ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.isPublished ? "Đã đăng" : "Bản nháp"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
