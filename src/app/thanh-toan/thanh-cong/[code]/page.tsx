import Link from "next/link";
import { getOrderByCodeAndPhone } from "@/lib/repo/orders";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney } from "@/lib/utils";
import OrderPaymentProofForm from "@/components/site/OrderPaymentProofForm";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { code } = await params;
  const { phone } = await searchParams;
  const settings = getSiteSettings();

  if (!phone) {
    return (
      <LookupPrompt code={code} />
    );
  }

  const order = getOrderByCodeAndPhone(code, phone);
  if (!order) return <LookupPrompt code={code} notFoundMsg />;

  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);

  const statusLabel: Record<string, string> = {
    PENDING_PAYMENT: "Chờ thanh toán",
    PAYMENT_CONFIRMED: "Đã xác nhận thanh toán",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao hàng",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
  };

  return (
    <div className="container-narrow py-16 max-w-3xl">
      <p className="eyebrow mb-3">Cảm ơn bạn!</p>
      <h1 className="font-heading text-3xl mb-2 text-[var(--color-dark)]">Đặt hàng thành công</h1>
      <p className="text-[var(--color-muted)] mb-10">
        Mã đơn hàng của bạn là <strong className="text-[var(--color-dark)]">{order.orderCode}</strong>. Vui lòng lưu
        lại mã này để tra cứu tình trạng đơn hàng.
      </p>

      <div className="bg-[var(--color-secondary)] p-6 mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span>Trạng thái</span>
          <span className="font-medium">{statusLabel[order.status] || order.status}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Người nhận</span>
          <span>{order.fullName} — {order.phone}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Địa chỉ giao hàng</span>
          <span className="text-right max-w-xs">{order.shippingAddress}</span>
        </div>
        <div className="flex justify-between text-sm font-heading text-lg pt-3 mt-3 border-t border-black/10">
          <span>Tổng cộng</span>
          <span>{money(order.total)}</span>
        </div>
      </div>

      {order.status === "PENDING_PAYMENT" && (
        <div className="bg-[var(--color-ivory)] border border-[var(--color-line)] p-6 mb-8">
          <h2 className="font-heading text-xl mb-4">Thông tin chuyển khoản</h2>
          <Row label="Ngân hàng" value={settings.bankName || "—"} />
          <Row label="Chủ tài khoản" value={settings.bankAccountName} />
          <Row label="Số tài khoản" value={settings.bankAccountNumber} />
          {settings.bankBsb && <Row label="BSB" value={settings.bankBsb} />}
          <Row label="Số tiền" value={money(order.total)} />
          <Row label="Nội dung chuyển khoản" value={order.orderCode} />
          {settings.bankQrImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.bankQrImageUrl} alt="QR chuyển khoản" className="w-48 h-48 object-contain mt-4" />
          )}

          <div className="mt-6 pt-6 border-t border-[var(--color-line)]">
            <OrderPaymentProofForm orderId={order.id} hasProof={!!order.paymentProofUrl} />
          </div>
        </div>
      )}

      <Link href="/tra-cuu-don-hang" className="text-sm underline">
        Tra cứu đơn hàng này sau →
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-2 border-b border-[var(--color-line)] last:border-0">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LookupPrompt({ code, notFoundMsg }: { code: string; notFoundMsg?: boolean }) {
  return (
    <div className="container-narrow py-24 max-w-md text-center">
      {notFoundMsg ? (
        <p className="text-[var(--color-danger)] mb-6">
          Không tìm thấy đơn hàng {code} với số điện thoại đã nhập. Vui lòng kiểm tra lại.
        </p>
      ) : (
        <p className="text-[var(--color-muted)] mb-6">Vui lòng nhập số điện thoại để xem chi tiết đơn hàng {code}.</p>
      )}
      <Link href="/tra-cuu-don-hang" className="btn-primary">
        Tra cứu đơn hàng
      </Link>
    </div>
  );
}
