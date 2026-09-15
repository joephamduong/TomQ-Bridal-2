"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Layers,
  Palette,
  Ruler,
  ClipboardList,
  Sparkles,
  Users,
  CalendarClock,
  MessageSquare,
  Newspaper,
  FolderOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { logoutAdmin } from "@/app/actions/admin-auth";

const NAV = [
  {
    group: "Tổng quan",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Sản phẩm",
    items: [
      { href: "/admin/san-pham", label: "Sản phẩm", icon: ShoppingBag },
      { href: "/admin/danh-muc", label: "Danh mục", icon: FolderOpen },
      { href: "/admin/chat-lieu", label: "Chất liệu", icon: Layers },
      { href: "/admin/kieu-dang", label: "Kiểu dáng", icon: Tags },
      { href: "/admin/mau-sac", label: "Màu sắc", icon: Palette },
      { href: "/admin/kich-thuoc", label: "Kích thước", icon: Ruler },
    ],
  },
  {
    group: "Giao dịch",
    items: [
      { href: "/admin/don-hang", label: "Đơn hàng", icon: ClipboardList },
      { href: "/admin/thu-do-ai", label: "Yêu cầu thử đồ AI", icon: Sparkles },
      { href: "/admin/lich-hen", label: "Lịch hẹn", icon: CalendarClock },
    ],
  },
  {
    group: "Khách hàng",
    items: [
      { href: "/admin/khach-hang", label: "Khách hàng", icon: Users },
      { href: "/admin/lien-he", label: "Liên hệ", icon: MessageSquare },
    ],
  },
  {
    group: "Nội dung",
    items: [
      { href: "/admin/blog", label: "Bài viết", icon: Newspaper },
      { href: "/admin/blog/danh-muc", label: "Chủ đề blog", icon: FolderOpen },
      { href: "/admin/giao-dien", label: "Giao diện website", icon: Settings },
    ],
  },
];

export default function AdminShell({
  children,
  adminName,
  siteName,
}: {
  children: React.ReactNode;
  adminName: string;
  siteName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      <aside className="w-64 bg-neutral-950 text-neutral-300 shrink-0 hidden md:flex flex-col">
        <div className="px-6 py-6 border-b border-neutral-800">
          <p className="text-white font-heading text-lg">{siteName}</p>
          <p className="text-xs text-neutral-500">Bảng quản trị</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="px-6 text-[10px] uppercase tracking-widest text-neutral-600 mb-2">{group.group}</p>
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                      active ? "bg-neutral-900 text-white border-r-2 border-[var(--color-accent)]" : "hover:bg-neutral-900/60 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 mb-2">Đăng nhập: {adminName}</p>
          <form action={logoutAdmin}>
            <button className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </form>
          <Link href="/" className="block text-xs text-neutral-500 hover:text-white mt-3">
            ← Xem website
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="p-6 md:p-10 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
