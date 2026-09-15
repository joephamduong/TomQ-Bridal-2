import { listColors } from "@/lib/repo/catalog";
import { createColorAction, deleteColorAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import { TextInput } from "@/components/admin/FormFields";

export default async function ColorsAdminPage() {
  const colors = listColors();

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Màu sắc</h1>
      <p className="text-sm text-neutral-500 mb-8">Bảng màu áp dụng cho sản phẩm.</p>

      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thêm màu mới</h2>
        <form action={createColorAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput name="name" label="Tên màu" required placeholder="Ngà voi (Ivory)" />
          <TextInput name="hexCode" label="Mã màu (hex)" type="color" defaultValue="#FFFFFF" />
          <TextInput name="extraPrice" label="Phụ phí (nếu có)" type="number" defaultValue={0} />
          <TextInput name="aiPromptTag" label="Từ khóa mô tả cho AI (tiếng Anh)" placeholder="ivory" />
          <div className="md:col-span-2">
            <button className="bg-neutral-900 text-white text-sm px-5 py-2.5">Thêm màu</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-neutral-200">
        {colors.length === 0 ? (
          <p className="text-sm text-neutral-400 p-4">Chưa có màu nào.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {colors.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-neutral-200" style={{ backgroundColor: c.hexCode }} />
                  {c.name}
                  <span className="text-neutral-400 text-xs">{c.hexCode}</span>
                </div>
                <DeleteButton action={deleteColorAction.bind(null, c.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
