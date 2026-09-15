import { listMaterials } from "@/lib/repo/catalog";
import { createMaterialAction, deleteMaterialAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function MaterialsAdminPage() {
  const materials = listMaterials();

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Chất liệu</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Danh sách chất liệu áp dụng cho sản phẩm — vừa để khách chọn khi mua/thử đồ, vừa làm dữ liệu mô tả cho AI khi
        dựng ảnh thử đồ (trường &quot;Từ khóa mô tả cho AI&quot;).
      </p>

      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thêm chất liệu mới</h2>
        <form action={createMaterialAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput name="name" label="Tên chất liệu" required placeholder="Lụa satin cao cấp" />
          <TextInput name="extraPrice" label="Phụ phí (nếu có)" type="number" defaultValue="0" />
          <TextInput name="swatchImageUrl" label="URL ảnh mẫu vải" placeholder="https://..." />
          <TextInput name="aiPromptTag" label="Từ khóa mô tả cho AI (tiếng Anh)" placeholder="ivory silk satin with soft sheen" />
          <div className="md:col-span-2">
            <TextInput name="description" label="Mô tả" />
          </div>
          <div className="md:col-span-2">
            <button className="bg-neutral-900 text-white text-sm px-5 py-2.5">Thêm chất liệu</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-neutral-200">
        {materials.length === 0 ? (
          <p className="text-sm text-neutral-400 p-4">Chưa có chất liệu nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Tên</th>
                <th className="p-4">Phụ phí</th>
                <th className="p-4">Từ khóa AI</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-4">{m.name}</td>
                  <td className="p-4">{m.extraPrice}</td>
                  <td className="p-4 text-neutral-500">{m.aiPromptTag}</td>
                  <td className="p-4 text-right">
                    <DeleteButton action={deleteMaterialAction.bind(null, m.id)} />
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

function TextInput({
  name,
  label,
  required,
  type = "text",
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-neutral-500 block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
