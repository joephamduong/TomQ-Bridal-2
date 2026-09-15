import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

// API upload dùng cho các form trong trang Admin (ảnh sản phẩm, ảnh bìa blog, logo, favicon...)
// cần lấy ngay URL ảnh để hiển thị preview trước khi submit form chính.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const subdir = String(formData.get("subdir") || "admin");
  if (!file) {
    return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
  }
  try {
    const url = await saveUploadedFile(file, subdir);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Lỗi upload" }, { status: 400 });
  }
}
