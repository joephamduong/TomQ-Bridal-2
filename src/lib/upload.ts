import fs from "node:fs";
import path from "node:path";
import { newId } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function saveUploadedFile(file: File, subdir = ""): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh định dạng JPG, PNG, WEBP hoặc GIF");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Kích thước ảnh tối đa 10MB");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
  const filename = `${newId("f")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subdir ? subdir + "/" : ""}${filename}`;
}
