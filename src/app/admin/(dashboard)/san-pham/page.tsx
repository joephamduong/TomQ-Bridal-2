import Link from "next/link";
import { Plus } from "lucide-react";
import { listProducts } from "@/lib/repo/catalog";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney } from "@/lib/utils";

export default async function ProductsAdminPage() {
  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);
  const { items } = listProducts({ publishedOnly: false, limit: 200 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl mb-1">Sản phẩm</h1>
          <p className="text-sm text-neutral-500">Quản lý áo cưới cô dâu & vest chú rể.</p>
        </div>
        <Link href="/admin/san-pham/moi" className="bg-neutral-900 text-white text-sm px-5 py-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-6">Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên.</p>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Loại</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Giá</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-4">
                    <Link href={`/admin/san-pham/${p.id}`} className="font-medium hover:text-[var(--color-primary)]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-4">{p.type === "BRIDE" ? "Cô dâu" : "Chú rể"}</td>
                  <td className="p-4 text-neutral-500">{p.categoryName || "—"}</td>
                  <td className="p-4">{money(p.price)}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.isPublished ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.isPublished ? "Đang hiển thị" : "Đã ẩn"}
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
