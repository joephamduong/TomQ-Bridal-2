"use client";

import { useActionState } from "react";
import { CalendarCheck } from "lucide-react";
import { useSiteSettings, useMoneyFormatter } from "@/lib/settings-context";
import { submitAppointment, type ActionState } from "@/app/actions/public";

const initialState: ActionState = { ok: false };

export default function AppointmentPage() {
  const settings = useSiteSettings();
  const formatMoney = useMoneyFormatter();
  const [state, formAction, pending] = useActionState(submitAppointment, initialState);

  return (
    <div className="container-narrow py-14 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <p className="eyebrow mb-3">TomQ Bridal</p>
          <h1 className="font-heading text-4xl mb-6 text-[var(--color-dark)] flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-[var(--color-accent)]" />
            Đặt lịch hẹn thử áo
          </h1>
          <p className="text-[var(--color-muted)] leading-relaxed mb-6">
            Mỗi buổi hẹn tại TomQ Bridal được dành riêng cho bạn — từ tư vấn kiểu dáng, chất liệu đến thử áo trực
            tiếp cùng chuyên gia của chúng tôi. Vì số lượng khách mỗi buổi có giới hạn, vui lòng đặt lịch trước để
            đảm bảo trải nghiệm tốt nhất.
          </p>
          <div className="bg-[var(--color-secondary)] p-6 mb-6">
            <p className="text-sm mb-2">
              <strong>Đặt cọc giữ lịch:</strong> {formatMoney(settings.appointmentDeposit)}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Khoản đặt cọc sẽ được trừ vào chi phí dịch vụ cuối cùng. Chúng tôi sẽ liên hệ để hướng dẫn chuyển khoản
              sau khi nhận được yêu cầu đặt lịch của bạn. Lưu ý: đặt cọc không được hoàn lại nếu hủy lịch hẹn.
            </p>
          </div>
          <div className="text-sm text-[var(--color-muted)] space-y-1">
            <p>{settings.address}</p>
            <p>{settings.phone}</p>
            <p>{settings.email}</p>
          </div>
        </div>

        <div className="bg-[var(--color-ivory)] border border-[var(--color-line)] p-8">
          {state.ok ? (
            <div className="text-center py-10">
              <CalendarCheck className="w-10 h-10 mx-auto mb-4 text-[var(--color-success)]" />
              <p className="text-[var(--color-dark)]">{state.message}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <Field label="Họ và tên" name="name" required />
              <Field label="Số điện thoại" name="phone" required />
              <Field label="Email" name="email" type="email" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày hẹn mong muốn" name="preferredDate" type="date" required />
                <Field label="Giờ hẹn mong muốn" name="preferredTime" type="time" required />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
                  Loại lịch hẹn
                </label>
                <select
                  name="appointmentType"
                  className="w-full border border-[var(--color-line)] px-4 py-3 text-sm bg-white"
                  defaultValue="fitting"
                >
                  <option value="fitting">Thử áo</option>
                  <option value="consultation">Tư vấn thiết kế</option>
                  <option value="pickup">Nhận áo</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
                  Ghi chú (không bắt buộc)
                </label>
                <textarea
                  name="message"
                  rows={3}
                  className="w-full border border-[var(--color-line)] px-4 py-3 text-sm"
                  placeholder="Cho chúng tôi biết thêm về mong muốn của bạn..."
                />
              </div>
              {!state.ok && state.message && <p className="text-sm text-[var(--color-danger)]">{state.message}</p>}
              <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-60">
                {pending ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full border border-[var(--color-line)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}
