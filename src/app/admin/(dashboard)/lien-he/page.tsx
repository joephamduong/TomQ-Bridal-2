import { listContactMessages } from "@/lib/repo/customer";
import { formatDateVi } from "@/lib/utils";
import { markContactReadAction } from "@/app/actions/admin";

export default async function ContactAdminPage() {
  const { items, total } = listContactMessages({ limit: 200 });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl mb-1">Liên hệ</h1>
        <p className="text-sm text-neutral-500">{total} tin nhắn liên hệ từ website.</p>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-400">Chưa có tin nhắn liên hệ nào.</p>
        ) : (
          items.map((m) => (
            <div key={m.id} className={`bg-white border p-6 ${m.isRead ? "border-neutral-200" : "border-neutral-900"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {m.name}
                    {!m.isRead && <span className="text-[10px] uppercase tracking-widest bg-neutral-900 text-white px-2 py-0.5">Mới</span>}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {[m.email, m.phone].filter(Boolean).join(" · ") || "Không có thông tin liên hệ"}
                  </p>
                </div>
                <p className="text-xs text-neutral-400 shrink-0">{formatDateVi(m.createdAt)}</p>
              </div>
              {m.subject && <p className="text-sm font-medium mb-1">{m.subject}</p>}
              <p className="text-sm text-neutral-600 whitespace-pre-line">{m.message}</p>
              {!m.isRead && (
                <form action={markContactReadAction.bind(null, m.id)} className="mt-4">
                  <button type="submit" className="text-xs underline text-neutral-500 hover:text-neutral-900">
                    Đánh dấu đã đọc
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
