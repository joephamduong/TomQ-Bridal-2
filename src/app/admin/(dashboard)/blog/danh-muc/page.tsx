import { listBlogCategories } from "@/lib/repo/blog";
import { createBlogCategoryAction, deleteBlogCategoryAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function BlogCategoriesAdminPage() {
  const categories = listBlogCategories();

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Chủ đề blog</h1>
      <p className="text-sm text-neutral-500 mb-8">Quản lý các chủ đề để phân loại bài viết trên blog.</p>

      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thêm chủ đề mới</h2>
        <form action={createBlogCategoryAction} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Tên chủ đề</label>
            <input name="name" required placeholder="Vd: Xu hướng áo cưới" className="border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <button className="bg-neutral-900 text-white text-sm px-5 py-2.5">Thêm</button>
        </form>
      </div>

      <div className="bg-white border border-neutral-200 max-w-lg">
        {categories.length === 0 ? (
          <p className="text-sm text-neutral-400 p-4">Chưa có chủ đề nào.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between items-center px-4 py-3 text-sm">
                <span>
                  {c.name} <span className="text-xs text-neutral-400">({c.postCount ?? 0} bài viết)</span>
                </span>
                <DeleteButton action={deleteBlogCategoryAction.bind(null, c.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
