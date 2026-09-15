import Link from "next/link";
import { getTryOnByCodeAndPhone } from "@/lib/repo/tryon";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney } from "@/lib/utils";
import OrderPaymentProofForm from "@/components/site/OrderPaymentProofForm";
import AutoRefresh from "@/components/site/AutoRefresh";

export default async function TryOnPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { code } = await params;
  const { phone } = await searchParams;
  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);

  if (!phone) {
    return (
      <div className="container-narrow py-24 max-w-md text-center">
        <p className="text-[var(--color-muted)] mb-6">Vui lòng nhập số điện thoại để xem yêu cầu thử đồ {code}.</p>
        <Link href="/tra-cuu-don-hang" className="btn-primary">
          Tra cứu yêu cầu
        </Link>
      </div>
    );
  }

  const request = getTryOnByCodeAndPhone(code, phone);
  if (!request) {
    return (
      <div className="container-narrow py-24 max-w-md text-center">
        <p className="text-[var(--color-danger)] mb-6">
          Không tìm thấy yêu cầu {code} với số điện thoại đã nhập. Vui lòng kiểm tra lại.
        </p>
        <Link href="/tra-cuu-don-hang" className="btn-primary">
          Tra cứu yêu cầu
        </Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-16 max-w-3xl">
      <p className="eyebrow mb-3">TomQ Bridal AI Try-On</p>
      <h1 className="font-heading text-3xl mb-2 text-[var(--color-dark)]">
        {request.status === "COMPLETED" ? "Kết quả thử đồ AI của bạn" : "Yêu cầu thử đồ đã được ghi nhận"}
      </h1>
      <p className="text-[var(--color-muted)] mb-10">
        Mã yêu cầu: <strong className="text-[var(--color-dark)]">{request.requestCode}</strong> — Sản phẩm:{" "}
        <strong className="text-[var(--color-dark)]">{request.productName}</strong>
      </p>

      {request.status === "AWAITING_PAYMENT" && (
        <div className="bg-[var(--color-ivory)] border border-[var(--color-line)] p-6 mb-8">
          <h2 className="font-heading text-xl mb-4">Thông tin chuyển khoản</h2>
          <Row label="Ngân hàng" value={settings.bankName || "—"} />
          <Row label="Chủ tài khoản" value={settings.bankAccountName} />
          <Row label="Số tài khoản" value={settings.bankAccountNumber} />
          {settings.bankBsb && <Row label="BSB" value={settings.bankBsb} />}
          <Row label="Số tiền" value={money(request.fee)} />
          <Row label="Nội dung chuyển khoản" value={request.requestCode} />
          {settings.bankQrImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.bankQrImageUrl} alt="QR chuyển khoản" className="w-48 h-48 object-contain mt-4" />
          )}
          <div className="mt-6 pt-6 border-t border-[var(--color-line)]">
            <OrderPaymentProofForm orderId={request.id} hasProof={!!request.paymentProofUrl} />
          </div>
        </div>
      )}

      {(request.status === "PAYMENT_CONFIRMED" || request.status === "PROCESSING") && (
        <div className="bg-[var(--color-secondary)] p-8 text-center mb-8">
          <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-dark)]">Đã xác nhận thanh toán — AI đang dựng hình ảnh của bạn...</p>
          <p className="text-xs text-[var(--color-muted)] mt-2">Trang sẽ tự động cập nhật khi có kết quả.</p>
          <AutoRefresh intervalMs={8000} />
        </div>
      )}

      {request.status === "FAILED" && (
        <div className="bg-red-50 border border-red-200 p-6 mb-8 text-sm text-[var(--color-danger)]">
          Rất tiếc, đã có lỗi khi dựng ảnh AI. Đội ngũ TomQ Bridal sẽ liên hệ trực tiếp để hỗ trợ bạn.
        </div>
      )}

      {request.status === "COMPLETED" && request.resultImageUrl && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Ảnh gốc</p>
            <div className="aspect-[3/4] bg-[var(--color-secondary)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={request.customerPhotoUrl} alt="Ảnh gốc" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-2">Kết quả AI</p>
            <div className="aspect-[3/4] bg-[var(--color-secondary)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={request.resultImageUrl} alt="Kết quả AI" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      <Link href="/tra-cuu-don-hang" className="text-sm underline">
        Tra cứu lại sau →
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
