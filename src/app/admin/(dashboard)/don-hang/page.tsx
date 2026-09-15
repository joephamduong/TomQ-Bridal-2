import Link from "next/link";
import { listOrders } from "@/lib/repo/orders";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney, formatDateVi } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAYMENT_CONFIRMED: "Đã xác nhận TT",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700",
  PAYMENT_CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
};

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);
  const { items, total } = listOrders({
    status: status ? (status as OrderStatus) : undefined,
    limit: 200,
  });

  const statuses = Object.keys(STATUS_LABEL) as OrderStatus[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl mb-1">Đơn hàng</h1>
        <p className="text-sm text-neutral-500">{total} đơn hàng mua áo cưới / vest.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/don-hang"
          className={`text-xs px-3 py-1.5 border ${!status ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
        >
          Tất cả
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/don-hang?status=${s}`}
            className={`text-xs px-3 py-1.5 border ${status === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-6">Chưa có đơn hàng nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-4">
                    <Link href={`/admin/don-hang/${o.id}`} className="font-medium hover:text-[var(--color-primary)]">
                      {o.orderCode}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p>{o.fullName}</p>
                    <p className="text-xs text-neutral-400">{o.phone}</p>
                  </td>
                  <td className="p-4">{money(o.total)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  </td>
                  <td className="p-4 text-neutral-500">{formatDateVi(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
