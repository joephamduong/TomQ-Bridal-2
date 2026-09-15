import fs from "node:fs";
import path from "node:path";
import { newId } from "@/lib/db";

// =====================================================================================
// AI TRY-ON PROVIDER — nơi kết nối dịch vụ AI tạo ảnh thật (khi khách có API key)
// =====================================================================================
// Claude (trợ lý AI xử lý văn bản/phân tích ảnh) KHÔNG tự vẽ được ảnh photorealistic.
// Để tạo ảnh "khách hàng mặc thử váy cưới" cần một dịch vụ tạo ảnh AI riêng biệt.
// File này cung cấp 1 abstraction chung với 3 chế độ, chọn qua biến môi trường AI_TRYON_PROVIDER:
//   - "mock"   : chế độ demo, không gọi API ngoài, dùng ngay không cần cấu hình.
//   - "openai" : gọi OpenAI Images API (gpt-image) — cần OPENAI_API_KEY.
//   - "gemini" : gọi Google Gemini image API (Nano Banana) — cần GEMINI_API_KEY.
//
// LƯU Ý QUAN TRỌNG: API của các nhà cung cấp ảnh AI thay đổi khá thường xuyên.
// Đoạn code "openai" và "gemini" bên dưới được viết theo tài liệu công khai tại thời điểm
// xây dựng dự án. Trước khi dùng thật, hãy kiểm tra lại tài liệu mới nhất:
//   OpenAI:  https://platform.openai.com/docs/guides/image-generation
//   Google:  https://ai.google.dev/gemini-api/docs/image-generation
// và chỉnh sửa model/endpoint nếu nhà cung cấp đã cập nhật.
// =====================================================================================

export type TryOnPromptContext = {
  productName: string;
  productType: "BRIDE" | "GROOM";
  styleLabel?: string | null;
  materialLabel?: string | null;
  colorLabel?: string | null;
  stylePromptTag?: string | null;
  materialPromptTag?: string | null;
  colorPromptTag?: string | null;
};

export type TryOnResult = {
  imageUrl: string;
  provider: string;
};

function buildPrompt(ctx: TryOnPromptContext): string {
  const garment = ctx.productType === "BRIDE" ? "wedding dress / bridal gown" : "groom's suit / tuxedo";
  const details = [
    ctx.stylePromptTag && `silhouette: ${ctx.stylePromptTag}`,
    ctx.materialPromptTag && `fabric: ${ctx.materialPromptTag}`,
    ctx.colorPromptTag && `color: ${ctx.colorPromptTag}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    `Edit this photo so the person is wearing an elegant ${garment} called "${ctx.productName}"` +
    (details ? ` (${details})` : "") +
    `. Keep the person's face, body proportions, pose and the background exactly the same as the original photo. ` +
    `Only change the outfit they are wearing to the described garment. Photorealistic, soft studio lighting, high fashion editorial quality, natural fabric draping.`
  );
}

async function readFileAsBase64(publicUrl: string): Promise<{ base64: string; mime: string }> {
  // publicUrl dạng "/uploads/xxx.jpg" — tương ứng file trong thư mục public/
  const filePath = path.join(process.cwd(), "public", publicUrl.replace(/^\//, ""));
  const buffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { base64: buffer.toString("base64"), mime };
}

async function saveBase64Image(base64: string, mime: string): Promise<string> {
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const filename = `${newId("tryon-result")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "tryon-results");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, filename), Buffer.from(base64, "base64"));
  return `/uploads/tryon-results/${filename}`;
}

// ---------------- MOCK PROVIDER ----------------
// Không gọi API ngoài. Sao chép ảnh gốc của khách sang thư mục kết quả để demo luồng hoạt động
// đầy đủ (upload -> thanh toán -> xác nhận -> "AI xử lý" -> xem kết quả). Giao diện kết quả sẽ
// hiển thị rõ đây là bản xem trước demo, kèm hướng dẫn bật AI thật trong README.
async function generateMock(customerPhotoUrl: string): Promise<TryOnResult> {
  const srcPath = path.join(process.cwd(), "public", customerPhotoUrl.replace(/^\//, ""));
  const buffer = await fs.promises.readFile(srcPath);
  const ext = path.extname(srcPath) || ".jpg";
  const filename = `${newId("tryon-result")}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "tryon-results");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, filename), buffer);
  return { imageUrl: `/uploads/tryon-results/${filename}`, provider: "mock" };
}

// ---------------- OPENAI PROVIDER ----------------
async function generateOpenAI(customerPhotoUrl: string, ctx: TryOnPromptContext): Promise<TryOnResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Thiếu OPENAI_API_KEY trong file .env");

  const { base64, mime } = await readFileAsBase64(customerPhotoUrl);
  const prompt = buildPrompt(ctx);

  const form = new FormData();
  const ext = mime.includes("png") ? "png" : "jpg";
  const blob = new Blob([Buffer.from(base64, "base64")], { type: mime });
  form.append("images", blob, `customer.${ext}`);
  form.append("prompt", prompt);
  form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
  form.append("size", "1024x1536");
  form.append("quality", "high");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API lỗi (${res.status}): ${text.slice(0, 500)}`);
  }
  const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const item = json.data?.[0];
  if (!item) throw new Error("OpenAI không trả về ảnh");

  if (item.b64_json) {
    const url = await saveBase64Image(item.b64_json, "image/png");
    return { imageUrl: url, provider: "openai" };
  }
  if (item.url) {
    const imgRes = await fetch(item.url);
    const arrBuf = await imgRes.arrayBuffer();
    const url = await saveBase64Image(Buffer.from(arrBuf).toString("base64"), "image/png");
    return { imageUrl: url, provider: "openai" };
  }
  throw new Error("OpenAI response không có ảnh hợp lệ");
}

// ---------------- GEMINI PROVIDER ----------------
async function generateGemini(customerPhotoUrl: string, ctx: TryOnPromptContext): Promise<TryOnResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Thiếu GEMINI_API_KEY trong file .env");

  const { base64, mime } = await readFileAsBase64(customerPhotoUrl);
  const prompt = buildPrompt(ctx);
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API lỗi (${res.status}): ${text.slice(0, 500)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: { inlineData?: { data?: string } }) => p.inlineData?.data);
  if (!imagePart) throw new Error("Gemini không trả về ảnh trong response");
  const url = await saveBase64Image(imagePart.inlineData.data, imagePart.inlineData.mimeType || "image/png");
  return { imageUrl: url, provider: "gemini" };
}

export async function generateTryOnImage(
  customerPhotoUrl: string,
  ctx: TryOnPromptContext
): Promise<TryOnResult> {
  const provider = (process.env.AI_TRYON_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "openai":
      return generateOpenAI(customerPhotoUrl, ctx);
    case "gemini":
      return generateGemini(customerPhotoUrl, ctx);
    default:
      return generateMock(customerPhotoUrl);
  }
}
