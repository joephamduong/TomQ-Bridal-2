import Link from "next/link";
import { listTryOnRequests } from "@/lib/repo/tryon";
import { formatDateVi } from "@/lib/utils";
import type { TryOnStatus } from "@/lib/types";

const STATUS_LABEL: Record<TryOnStatus, string> = {
  AWAITING_PAYMENT: "Chờ thanh toán",
  PAYMENT_CONFIRMED: "Đã xác nhận TT",
  PROCESSING: "Đang dựng ảnh AI",
  COMPLETED: "Hoàn tất",
  FAILED: "Lỗi",
};

const STATUS_STYLE: Record<TryOnStatus, string> = {
  AWAITING_PAYMENT: "bg-amber-50 text-amber-700",
  PAYMENT_CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  COMPLETED: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
};

export default async function TryOnAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { items, total } = listTryOnRequests({
    status: status ? (status as TryOnStatus) : undefined,
    limit: 200,
  });

  const statuses = Object.keys(STATUS_LABEL) as TryOnStatus[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl mb-1">Yêu cầu thử đồ AI</h1>
        <p className="text-sm text-neutral-500">{total} yêu cầu — khách tải ảnh toàn thân để AI dựng ảnh thử áo cưới.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/thu-do-ai"
          className={`text-xs px-3 py-1.5 border ${!status ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
        >
          Tất cả
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/thu-do-ai?status=${s}`}
            className={`text-xs px-3 py-1.5 border ${status === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-6">Chưa có yêu cầu thử đồ nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Mã yêu cầu</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-4">
                    <Link href={`/admin/thu-do-ai/${t.id}`} className="font-medium hover:text-[var(--color-primary)]">
                      {t.requestCode}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p>{t.fullName}</p>
                    <p className="text-xs text-neutral-400">{t.phone}</p>
                  </td>
                  <td className="p-4 text-neutral-500">{t.productName}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                  </td>
                  <td className="p-4 text-neutral-500">{formatDateVi(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
