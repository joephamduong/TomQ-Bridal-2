import { listStyles } from "@/lib/repo/catalog";
import { createStyleAction, deleteStyleAction } from "@/app/actions/admin";
import DeleteButton from "@/components/admin/DeleteButton";
import { TextInput } from "@/components/admin/FormFields";

export default async function StylesAdminPage() {
  const styles = listStyles();

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Kiểu dáng</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Kiểu dáng (silhouette) cho áo cưới/vest — ví dụ: Đuôi cá (Mermaid), Chữ A (A-line), Bồng xòe (Ball gown)...
      </p>

      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thêm kiểu dáng mới</h2>
        <form action={createStyleAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput name="name" label="Tên kiểu dáng" required placeholder="Đuôi cá (Mermaid)" />
          <TextInput name="extraPrice" label="Phụ phí (nếu có)" type="number" defaultValue={0} />
          <TextInput name="imageUrl" label="URL ảnh minh họa" placeholder="https://..." />
          <TextInput name="aiPromptTag" label="Từ khóa mô tả cho AI (tiếng Anh)" placeholder="fitted mermaid silhouette" />
          <div className="md:col-span-2">
            <TextInput name="description" label="Mô tả" />
          </div>
          <div className="md:col-span-2">
            <button className="bg-neutral-900 text-white text-sm px-5 py-2.5">Thêm kiểu dáng</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-neutral-200">
        {styles.length === 0 ? (
          <p className="text-sm text-neutral-400 p-4">Chưa có kiểu dáng nào.</p>
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
              {styles.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-4">{s.name}</td>
                  <td className="p-4">{s.extraPrice}</td>
                  <td className="p-4 text-neutral-500">{s.aiPromptTag}</td>
                  <td className="p-4 text-right">
                    <DeleteButton action={deleteStyleAction.bind(null, s.id)} />
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
