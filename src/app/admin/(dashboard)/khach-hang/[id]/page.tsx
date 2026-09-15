import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCustomerById } from "@/lib/repo/customer";
import { listOrders } from "@/lib/repo/orders";
import { listTryOnRequests } from "@/lib/repo/tryon";
import { listAppointments } from "@/lib/repo/customer";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney, formatDateVi } from "@/lib/utils";
import { updateCustomerNoteAction } from "@/app/actions/admin";
import { TextArea } from "@/components/admin/FormFields";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  order: "Mua hàng",
  tryon: "Thử đồ AI",
  appointment: "Đặt lịch hẹn",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = getCustomerById(id);
  if (!customer) notFound();

  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);
  const orders = listOrders({ customerId: id, limit: 50 }).items;
  const tryOns = listTryOnRequests({ customerId: id, limit: 50 }).items;
  const appointments = listAppointments({ customerId: id, limit: 50 }).items;
  const boundUpdateNote = updateCustomerNoteAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/khach-hang" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách khách hàng
      </Link>

      <h1 className="font-heading text-2xl mb-1">{customer.name}</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Khách hàng từ {SOURCE_LABEL[customer.source] || customer.source} · Tạo ngày {formatDateVi(customer.createdAt)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Thông tin liên hệ</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-neutral-500">Điện thoại</dt><dd>{customer.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd>{customer.email || "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-neutral-500 shrink-0">Địa chỉ</dt><dd className="text-right">{customer.address || "—"}</dd></div>
            </dl>
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Ghi chú nội bộ</h2>
            <form action={boundUpdateNote} className="space-y-3">
              <TextArea name="note" label="" defaultValue={customer.note ?? undefined} rows={5} placeholder="Ghi chú riêng về khách hàng này..." />
              <button type="submit" className="bg-neutral-900 text-white text-xs px-4 py-2">Lưu ghi chú</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Đơn hàng ({orders.length})</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-neutral-400">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {orders.map((o) => (
                  <Link key={o.id} href={`/admin/don-hang/${o.id}`} className="flex justify-between py-2.5 text-sm hover:text-[var(--color-primary)]">
                    <span>{o.orderCode}</span>
                    <span className="text-neutral-400">{formatDateVi(o.createdAt)}</span>
                    <span>{money(o.total)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Yêu cầu thử đồ AI ({tryOns.length})</h2>
            {tryOns.length === 0 ? (
              <p className="text-sm text-neutral-400">Chưa có yêu cầu thử đồ nào.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {tryOns.map((t) => (
                  <Link key={t.id} href={`/admin/thu-do-ai/${t.id}`} className="flex justify-between py-2.5 text-sm hover:text-[var(--color-primary)]">
                    <span>{t.requestCode}</span>
                    <span className="text-neutral-400">{t.productName}</span>
                    <span className="text-neutral-400">{formatDateVi(t.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Lịch hẹn ({appointments.length})</h2>
            {appointments.length === 0 ? (
              <p className="text-sm text-neutral-400">Chưa có lịch hẹn nào.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {appointments.map((a) => (
                  <div key={a.id} className="flex justify-between py-2.5 text-sm">
                    <span>{formatDateVi(a.preferredDate)} · {a.preferredTime}</span>
                    <span className="text-neutral-400">{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
