import { listSizes } from "@/lib/repo/catalog";
import { createSizeAction, deleteSizeAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import { TextInput } from "@/components/admin/FormFields";

export default async function SizesAdminPage() {
  const sizes = listSizes();

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Kích thước</h1>
      <p className="text-sm text-neutral-500 mb-8">Danh sách size áp dụng cho sản phẩm (S, M, L hoặc số đo).</p>

      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thêm size mới</h2>
        <form action={createSizeAction} className="flex flex-wrap gap-3 items-end">
          <TextInput name="label" label="Tên size" required placeholder="S / M / L / 36 / 38..." />
          <TextInput name="sortOrder" label="Thứ tự" type="number" defaultValue={0} />
          <button className="bg-neutral-900 text-white text-sm px-5 py-2.5">Thêm</button>
        </form>
      </div>

      <div className="bg-white border border-neutral-200">
        {sizes.length === 0 ? (
          <p className="text-sm text-neutral-400 p-4">Chưa có size nào.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sizes.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                {s.label}
                <DeleteButton action={deleteSizeAction.bind(null, s.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
