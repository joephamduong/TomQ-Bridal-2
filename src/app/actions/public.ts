"use server";

import { redirect } from "next/navigation";
import { createAppointment } from "@/lib/repo/customer";
import { createContactMessage } from "@/lib/repo/customer";
import { createOrder } from "@/lib/repo/orders";
import { createTryOnRequest, setTryOnPaymentProof, getTryOnById } from "@/lib/repo/tryon";
import { setOrderPaymentProof, getOrderById } from "@/lib/repo/orders";
import { getSiteSettings } from "@/lib/repo/settings";
import { getProductById } from "@/lib/repo/catalog";
import { saveUploadedFile } from "@/lib/upload";

export type ActionState = { ok: boolean; message?: string };

// ---------- Đặt lịch hẹn ----------
export async function submitAppointment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const preferredDate = String(formData.get("preferredDate") || "").trim();
  const preferredTime = String(formData.get("preferredTime") || "").trim();
  const appointmentType = String(formData.get("appointmentType") || "fitting");
  const message = String(formData.get("message") || "").trim();

  if (!name || !phone || !preferredDate || !preferredTime) {
    return { ok: false, message: "Vui lòng điền đầy đủ họ tên, số điện thoại, ngày và giờ hẹn." };
  }

  const settings = getSiteSettings();
  createAppointment({
    name,
    phone,
    email: email || undefined,
    preferredDate,
    preferredTime,
    appointmentType,
    message: message || undefined,
    depositRequired: settings.appointmentDeposit,
  });

  return { ok: true, message: "Đặt lịch hẹn thành công! Chúng tôi sẽ liên hệ với bạn sớm để xác nhận." };
}

// ---------- Liên hệ ----------
export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !message || (!email && !phone)) {
    return { ok: false, message: "Vui lòng điền tên, nội dung và ít nhất một cách liên hệ (email hoặc SĐT)." };
  }

  createContactMessage({ name, email: email || undefined, phone: phone || undefined, subject: subject || undefined, message });
  return { ok: true, message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất." };
}

// ---------- Đặt hàng (mua sản phẩm) ----------
export type CheckoutLineInput = {
  productId: string;
  productName: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
};

export async function submitOrder(data: {
  fullName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  shippingCity?: string;
  note?: string;
  items: CheckoutLineInput[];
}) {
  if (!data.fullName || !data.phone || !data.shippingAddress || data.items.length === 0) {
    throw new Error("Thiếu thông tin bắt buộc để đặt hàng");
  }
  const settings = getSiteSettings();
  const subtotal = data.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;

  const order = createOrder({
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    shippingAddress: data.shippingAddress,
    shippingCity: data.shippingCity,
    note: data.note,
    shippingFee,
    items: data.items,
  });

  redirect(`/thanh-toan/thanh-cong/${order.orderCode}?phone=${encodeURIComponent(data.phone)}`);
}

export async function uploadOrderPaymentProof(orderId: string, formData: FormData): Promise<ActionState> {
  const file = formData.get("proof") as File | null;
  if (!file || file.size === 0) return { ok: false, message: "Vui lòng chọn ảnh chụp màn hình chuyển khoản." };
  const order = getOrderById(orderId);
  if (!order) return { ok: false, message: "Không tìm thấy đơn hàng." };
  const url = await saveUploadedFile(file, "payment-proofs");
  setOrderPaymentProof(orderId, url);
  return { ok: true, message: "Đã gửi minh chứng chuyển khoản. Chúng tôi sẽ xác nhận trong thời gian sớm nhất." };
}

// ---------- Thử đồ AI ----------
export async function submitTryOnRequest(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const selectedStyle = String(formData.get("selectedStyle") || "").trim();
  const selectedMaterial = String(formData.get("selectedMaterial") || "").trim();
  const selectedColor = String(formData.get("selectedColor") || "").trim();
  const photo = formData.get("photo") as File | null;

  const product = getProductById(productId);
  if (!product) throw new Error("Không tìm thấy sản phẩm");
  if (!fullName || !phone || !photo || photo.size === 0) {
    throw new Error("Vui lòng điền đầy đủ thông tin và tải ảnh của bạn lên");
  }

  const photoUrl = await saveUploadedFile(photo, "tryon-photos");
  const settings = getSiteSettings();

  const request = createTryOnRequest({
    productId,
    fullName,
    phone,
    email: email || undefined,
    selectedStyle: selectedStyle || undefined,
    selectedMaterial: selectedMaterial || undefined,
    selectedColor: selectedColor || undefined,
    customerPhotoUrl: photoUrl,
    fee: settings.tryOnFee,
  });

  redirect(`/thu-do-ai/thanh-toan/${request.requestCode}?phone=${encodeURIComponent(phone)}`);
}

export async function uploadTryOnPaymentProof(requestId: string, formData: FormData): Promise<ActionState> {
  const file = formData.get("proof") as File | null;
  if (!file || file.size === 0) return { ok: false, message: "Vui lòng chọn ảnh chụp màn hình chuyển khoản." };
  const reqItem = getTryOnById(requestId);
  if (!reqItem) return { ok: false, message: "Không tìm thấy yêu cầu." };
  const url = await saveUploadedFile(file, "payment-proofs");
  setTryOnPaymentProof(requestId, url);
  return { ok: true, message: "Đã gửi minh chứng chuyển khoản. Chúng tôi sẽ xác nhận và tiến hành dựng ảnh AI sớm nhất." };
}

// ---------- Tra cứu đơn hàng / yêu cầu thử đồ ----------
export async function lookupOrderOrTryOn(
  _prev: ActionState & { redirectTo?: string },
  formData: FormData
): Promise<ActionState & { redirectTo?: string }> {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const phone = String(formData.get("phone") || "").trim();
  if (!code || !phone) return { ok: false, message: "Vui lòng nhập mã và số điện thoại." };

  if (code.startsWith("TO")) {
    return { ok: true, redirectTo: `/thu-do-ai/thanh-toan/${code}?phone=${encodeURIComponent(phone)}` };
  }
  return { ok: true, redirectTo: `/thanh-toan/thanh-cong/${code}?phone=${encodeURIComponent(phone)}` };
}
