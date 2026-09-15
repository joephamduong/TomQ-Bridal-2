"use client";

// Form nhỏ tự động submit khi đổi trạng thái — dùng cho Đơn hàng / Thử đồ AI / Lịch hẹn.
export default function StatusSelectForm({
  action,
  currentStatus,
  options,
}: {
  action: (formData: FormData) => void;
  currentStatus: string;
  options: { value: string; label: string }[];
}) {
  return (
    <form action={action}>
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="border border-neutral-300 text-xs px-2.5 py-1.5 bg-white focus:outline-none focus:border-neutral-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
