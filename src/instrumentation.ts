// Chạy 1 lần khi server Next.js khởi động: khởi tạo database (tạo bảng nếu chưa có)
// và tài khoản admin mặc định. Xem README.md để biết cách đổi mật khẩu admin mặc định.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDb } = await import("@/lib/db");
    const { ensureDefaultAdmin } = await import("@/lib/repo/admin");
    getDb(); // đảm bảo file db + bảng đã được tạo
    ensureDefaultAdmin();
  }
}
