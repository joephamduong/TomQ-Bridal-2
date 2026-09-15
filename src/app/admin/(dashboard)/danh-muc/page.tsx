import { listCategories } from "@/lib/repo/catalog";
import { createCategoryAction, deleteCategoryAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function CategoriesAdminPage() {
  const bride = listCategories("BRIDE");
  const groom = listCategories("GROOM");

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Danh mục sản phẩm</h1>
      <p className="text-sm text-neutral-500 mb-8">Quản lý danh mục cho áo cưới cô dâu và vest chú rể.</p>

      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thêm danh mục mới</h2>
        <form action={createCategoryAction} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Tên danh mục</label>
            <input name="name" required className="border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Loại</label>
            <select name="type" className="border border-neutral-300 px-3 py-2 text-sm">
              <option value="BRIDE">Cô dâu</option>
              <option value="GROOM">Chú rể</option>
            </select>
          </div>
          <button className="bg-neutral-900 text-white text-sm px-5 py-2.5">Thêm</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategoryList title="Danh mục Cô dâu" items={bride} />
        <CategoryList title="Danh mục Chú rể" items={groom} />
      </div>
    </div>
  );
}

function CategoryList({ title, items }: { title: string; items: { id: string; name: string; slug: string }[] }) {
  return (
    <div className="bg-white border border-neutral-200">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 p-4 border-b border-neutral-200">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400 p-4">Chưa có danh mục nào.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((c) => (
            <li key={c.id} className="flex justify-between items-center px-4 py-3 text-sm">
              <span>{c.name}</span>
              <DeleteButton action={deleteCategoryAction.bind(null, c.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
