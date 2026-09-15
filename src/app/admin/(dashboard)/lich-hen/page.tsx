import Link from "next/link";
import { listAppointments } from "@/lib/repo/customer";
import { formatDateVi } from "@/lib/utils";
import { updateAppointmentStatusAction, markAppointmentDepositPaidAction } from "@/app/actions/admin";
import StatusSelectForm from "@/components/admin/StatusSelectForm";
import type { Appointment } from "@/lib/types";

const STATUS_LABEL: Record<Appointment["status"], string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
};

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  fitting: "Thử đồ tại studio",
  consultation: "Tư vấn thiết kế",
  pickup: "Nhận đồ",
};

export default async function AppointmentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { items, total } = listAppointments({ status: status || undefined, limit: 200 });
  const statuses = Object.keys(STATUS_LABEL) as Appointment["status"][];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl mb-1">Lịch hẹn</h1>
        <p className="text-sm text-neutral-500">{total} lịch hẹn thử đồ / tư vấn tại studio.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/lich-hen"
          className={`text-xs px-3 py-1.5 border ${!status ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
        >
          Tất cả
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/lich-hen?status=${s}`}
            className={`text-xs px-3 py-1.5 border ${status === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600"}`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400 p-6">Chưa có lịch hẹn nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-widest text-neutral-500">
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Loại hẹn</th>
                <th className="p-4">Ngày / giờ hẹn</th>
                <th className="p-4">Đặt cọc</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 align-top">
                  <td className="p-4">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-neutral-400">{a.phone}</p>
                    {a.message && <p className="text-xs text-neutral-400 mt-1 max-w-xs">{a.message}</p>}
                  </td>
                  <td className="p-4 text-neutral-500">{APPOINTMENT_TYPE_LABEL[a.appointmentType] || a.appointmentType}</td>
                  <td className="p-4">
                    <p>{formatDateVi(a.preferredDate)}</p>
                    <p className="text-xs text-neutral-400">{a.preferredTime}</p>
                  </td>
                  <td className="p-4">
                    {a.depositRequired > 0 ? (
                      a.depositPaid ? (
                        <span className="text-xs text-green-700">Đã cọc</span>
                      ) : (
                        <form action={markAppointmentDepositPaidAction.bind(null, a.id)}>
                          <button type="submit" className="text-xs underline text-neutral-500 hover:text-neutral-900">
                            Đánh dấu đã cọc
                          </button>
                        </form>
                      )
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusSelectForm
                      action={updateAppointmentStatusAction.bind(null, a.id)}
                      currentStatus={a.status}
                      options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
                    />
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
