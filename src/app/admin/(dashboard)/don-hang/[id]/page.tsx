import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/repo/orders";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney, formatDateVi } from "@/lib/utils";
import { updateOrderStatusAction } from "@/app/actions/admin";
import StatusSelectForm from "@/components/admin/StatusSelectForm";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAYMENT_CONFIRMED: "Đã xác nhận thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);
  const boundUpdate = updateOrderStatusAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/don-hang" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách đơn hàng
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-heading text-2xl mb-1">Đơn hàng {order.orderCode}</h1>
          <p className="text-sm text-neutral-500">Đặt ngày {formatDateVi(order.createdAt)}</p>
        </div>
        <StatusSelectForm
          action={boundUpdate}
          currentStatus={order.status}
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thông tin khách hàng</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-neutral-500">Họ tên</dt><dd>{order.fullName}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Điện thoại</dt><dd>{order.phone}</dd></div>
              {order.email && <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd>{order.email}</dd></div>}
              <div className="flex justify-between gap-4"><dt className="text-neutral-500 shrink-0">Địa chỉ giao</dt><dd className="text-right">{order.shippingAddress}{order.shippingCity ? `, ${order.shippingCity}` : ""}</dd></div>
              {order.note && <div className="flex justify-between gap-4"><dt className="text-neutral-500 shrink-0">Ghi chú</dt><dd className="text-right">{order.note}</dd></div>}
              {order.customerId && (
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <dt className="text-neutral-500">Hồ sơ khách hàng</dt>
                  <dd><Link href={`/admin/khach-hang/${order.customerId}`} className="underline hover:text-[var(--color-primary)]">Xem chi tiết →</Link></dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Chứng từ chuyển khoản</h2>
            {order.paymentProofUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.paymentProofUrl} alt="Chứng từ thanh toán" className="w-full max-w-sm border border-neutral-200" />
            ) : (
              <p className="text-sm text-neutral-400">Khách chưa tải lên chứng từ chuyển khoản.</p>
            )}
            {order.paymentConfirmedAt && (
              <p className="text-xs text-neutral-400 mt-3">Đã xác nhận thanh toán lúc {formatDateVi(order.paymentConfirmedAt)}</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 h-fit">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Sản phẩm đặt mua</h2>
          <div className="divide-y divide-neutral-100">
            {order.items?.map((it) => (
              <div key={it.id} className="py-3 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{it.productName}</p>
                  {it.variantLabel && <p className="text-xs text-neutral-400">{it.variantLabel}</p>}
                  <p className="text-xs text-neutral-400">SL: {it.quantity}</p>
                </div>
                <p className="shrink-0">{money(it.lineTotal)}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-2 border-t border-neutral-200 text-sm space-y-1.5">
            <div className="flex justify-between text-neutral-500"><span>Tạm tính</span><span>{money(order.subtotal)}</span></div>
            <div className="flex justify-between text-neutral-500"><span>Phí vận chuyển</span><span>{money(order.shippingFee)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-1"><span>Tổng cộng</span><span>{money(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
