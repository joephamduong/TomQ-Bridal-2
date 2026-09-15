"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Tự động làm mới trang mỗi `intervalMs` mili-giây — dùng ở trang chờ kết quả AI thử đồ
// để khách không cần tự bấm F5 liên tục.
export default function AutoRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
