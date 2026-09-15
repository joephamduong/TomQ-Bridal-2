import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { getTryOnById } from "@/lib/repo/tryon";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney, formatDateVi } from "@/lib/utils";
import { confirmTryOnPaymentAction, regenerateTryOnAction, updateTryOnStatusAction } from "@/app/actions/admin";
import StatusSelectForm from "@/components/admin/StatusSelectForm";
import type { TryOnStatus } from "@/lib/types";

const STATUS_LABEL: Record<TryOnStatus, string> = {
  AWAITING_PAYMENT: "Chờ thanh toán",
  PAYMENT_CONFIRMED: "Đã xác nhận thanh toán",
  PROCESSING: "Đang dựng ảnh AI",
  COMPLETED: "Hoàn tất",
  FAILED: "Lỗi dựng ảnh",
};

export default async function TryOnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = getTryOnById(id);
  if (!request) notFound();

  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);
  const boundStatus = updateTryOnStatusAction.bind(null, id);
  const boundConfirm = confirmTryOnPaymentAction.bind(null, id);
  const boundRegenerate = regenerateTryOnAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/thu-do-ai" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách yêu cầu
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-heading text-2xl mb-1">Thử đồ AI {request.requestCode}</h1>
          <p className="text-sm text-neutral-500">Sản phẩm: {request.productName} · Gửi lúc {formatDateVi(request.createdAt)}</p>
        </div>
        <StatusSelectForm
          action={boundStatus}
          currentStatus={request.status}
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {request.status === "AWAITING_PAYMENT" && (
          <form action={boundConfirm}>
            <button type="submit" className="bg-neutral-900 text-white text-sm px-5 py-2.5 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Xác nhận thanh toán &amp; tạo ảnh AI
            </button>
          </form>
        )}
        {(request.status === "COMPLETED" || request.status === "FAILED") && (
          <form action={boundRegenerate}>
            <button type="submit" className="border border-neutral-300 text-sm px-5 py-2.5 inline-flex items-center gap-2 hover:border-neutral-900">
              <RefreshCw className="w-4 h-4" /> Tạo lại ảnh AI
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thông tin khách hàng</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-neutral-500">Họ tên</dt><dd>{request.fullName}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Điện thoại</dt><dd>{request.phone}</dd></div>
              {request.email && <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd>{request.email}</dd></div>}
              <div className="flex justify-between"><dt className="text-neutral-500">Phí thử đồ</dt><dd>{money(request.fee)}</dd></div>
              {request.customerId && (
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <dt className="text-neutral-500">Hồ sơ khách hàng</dt>
                  <dd><Link href={`/admin/khach-hang/${request.customerId}`} className="underline hover:text-[var(--color-primary)]">Xem chi tiết →</Link></dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Tùy chọn đã chọn</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-neutral-500">Kiểu dáng</dt><dd>{request.selectedStyle || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Chất liệu</dt><dd>{request.selectedMaterial || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Màu sắc</dt><dd>{request.selectedColor || "—"}</dd></div>
            </dl>
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Chứng từ chuyển khoản</h2>
            {request.paymentProofUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={request.paymentProofUrl} alt="Chứng từ thanh toán" className="w-full max-w-sm border border-neutral-200" />
            ) : (
              <p className="text-sm text-neutral-400">Khách chưa tải lên chứng từ chuyển khoản.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Ảnh khách gửi lên</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={request.customerPhotoUrl} alt="Ảnh toàn thân khách hàng" className="w-full max-w-sm border border-neutral-200" />
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Kết quả AI dựng ảnh</h2>
            {request.status === "PROCESSING" && <p className="text-sm text-neutral-400">Đang xử lý — vui lòng tải lại trang sau ít phút.</p>}
            {request.status === "FAILED" && (
              <p className="text-sm text-red-600">Lỗi: {request.aiError || "Không xác định"}</p>
            )}
            {request.resultImageUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={request.resultImageUrl} alt="Ảnh AI dựng thử áo cưới" className="w-full max-w-sm border border-neutral-200" />
                {request.aiProvider && <p className="text-xs text-neutral-400 mt-2">Nhà cung cấp AI: {request.aiProvider}</p>}
              </div>
            ) : (
              request.status !== "PROCESSING" &&
              request.status !== "FAILED" && <p className="text-sm text-neutral-400">Chưa có ảnh kết quả.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
