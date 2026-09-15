import Link from "next/link";
import { listOrders, countOrdersByStatus } from "@/lib/repo/orders";
import { listTryOnRequests } from "@/lib/repo/tryon";
import { listAppointments, listContactMessages } from "@/lib/repo/customer";
import { listProducts } from "@/lib/repo/catalog";
import { listBlogPosts } from "@/lib/repo/blog";
import { getSiteSettings } from "@/lib/repo/settings";
import { formatMoney } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const settings = getSiteSettings();
  const money = (n: number) => formatMoney(n, settings.currencyCode, settings.currencyLocale);

  const pendingOrders = listOrders({ status: "PENDING_PAYMENT", limit: 5 });
  const pendingTryOn = listTryOnRequests({ status: "AWAITING_PAYMENT", limit: 5 });
  const pendingAppointments = listAppointments({ status: "PENDING", limit: 5 });
  const unreadMessages = listContactMessages({ limit: 100 }).items.filter((m) => !m.isRead);
  const statusCounts = countOrdersByStatus();
  const totalProducts = listProducts({ publishedOnly: false, limit: 1 }).total;
  const totalPosts = listBlogPosts({ publishedOnly: false, limit: 1 }).total;

  const stats = [
    { label: "Đơn hàng chờ thanh toán", value: pendingOrders.total, href: "/admin/don-hang" },
    { label: "Yêu cầu thử đồ chờ xử lý", value: pendingTryOn.total, href: "/admin/thu-do-ai" },
    { label: "Lịch hẹn chờ xác nhận", value: pendingAppointments.total, href: "/admin/lich-hen" },
    { label: "Tin nhắn chưa đọc", value: unreadMessages.length, href: "/admin/lien-he" },
    { label: "Sản phẩm", value: totalProducts, href: "/admin/san-pham" },
    { label: "Bài viết blog", value: totalPosts, href: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Tổng quan</h1>
      <p className="text-sm text-neutral-500 mb-8">Chào mừng quay lại trang quản trị TomQ Bridal.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-neutral-200 p-5 hover:border-neutral-400 transition-colors">
            <p className="text-3xl font-heading text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-2">
            {statusCounts.length === 0 && <p className="text-sm text-neutral-400">Chưa có đơn hàng nào.</p>}
            {statusCounts.map((s) => (
              <div key={s.status} className="flex justify-between text-sm">
                <span>{s.status}</span>
                <span className="font-medium">{s.cnt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Đơn hàng gần đây chờ thanh toán</h2>
          {pendingOrders.items.length === 0 ? (
            <p className="text-sm text-neutral-400">Không có đơn hàng nào đang chờ.</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.items.map((o) => (
                <Link key={o.id} href={`/admin/don-hang/${o.id}`} className="flex justify-between text-sm hover:text-[var(--color-primary)]">
                  <span>{o.orderCode} — {o.fullName}</span>
                  <span>{money(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
