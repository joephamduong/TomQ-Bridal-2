import Link from "next/link";
import { Search } from "lucide-react";
import { listCustomers } from "@/lib/repo/customer";
import { formatDateVi } from "@/lib/utils";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  order: "Mua hàng",
  tryon: "Thử đồ AI",
  appointment: "Đặt lịch hẹn",
};

export default async function CustomersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { items, total } = listCustomers({ search: q || undefined, limit: 200 });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl mb-1">Khách hàng</h1>
        <p className="text-sm text-neutral-500">{total} khách hàng đã liên hệ, đặt lịch, mua hàng hoặc thử đồ AI.</p>
      </div>

      <form className="mb-6 max-w-sm relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên, SĐT hoặc email..."
          className="w-full border border-neutral-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
        />
      </form>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-6">Không tìm thấy khách hàng nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Họ tên</th>
                <th className="p-4">Điện thoại</th>
                <th className="p-4">Email</th>
                <th className="p-4">Nguồn</th>
                <th className="p-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-4">
                    <Link href={`/admin/khach-hang/${c.id}`} className="font-medium hover:text-[var(--color-primary)]">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4 text-neutral-500">{c.email || "—"}</td>
                  <td className="p-4 text-neutral-500">{SOURCE_LABEL[c.source] || c.source}</td>
                  <td className="p-4 text-neutral-500">{formatDateVi(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
