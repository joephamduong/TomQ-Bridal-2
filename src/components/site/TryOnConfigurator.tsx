"use client";

import { useRef, useState } from "react";
import { UploadCloud, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useMoneyFormatter } from "@/lib/settings-context";
import { submitTryOnRequest } from "@/app/actions/public";
import type { ProductDetail } from "@/lib/types";

export default function TryOnConfigurator({
  product,
  initial,
  fee,
}: {
  product: ProductDetail;
  initial: { material?: string; style?: string; color?: string };
  fee: number;
}) {
  const { t } = useLanguage();
  const formatMoney = useMoneyFormatter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [style, setStyle] = useState(initial.style || product.styles[0]?.id || "");
  const [material, setMaterial] = useState(initial.material || product.materials[0]?.id || "");
  const [color, setColor] = useState(initial.color || product.colors[0]?.id || "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File | undefined) => {
    if (!file) return setPreview(null);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !phone || !fileRef.current?.files?.[0]) {
      setError("Vui lòng điền họ tên, số điện thoại và tải lên ảnh toàn thân của bạn.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.set("productId", product.id);
    formData.set("fullName", fullName);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("selectedStyle", product.styles.find((s) => s.id === style)?.name || "");
    formData.set("selectedMaterial", product.materials.find((m) => m.id === material)?.name || "");
    formData.set("selectedColor", product.colors.find((c) => c.id === color)?.name || "");
    formData.set("photo", fileRef.current.files[0]);
    try {
      await submitTryOnRequest(formData);
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError("Có lỗi xảy ra, vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow py-14 md:py-20 max-w-4xl">
      <p className="eyebrow mb-3">{product.name}</p>
      <h1 className="font-heading text-3xl md:text-4xl mb-3 text-[var(--color-dark)] flex items-center gap-3">
        <Sparkles className="w-7 h-7 text-[var(--color-accent)]" />
        {t.tryon.title}
      </h1>
      <p className="text-[var(--color-muted)] mb-10 max-w-2xl">
        Chọn kiểu dáng, chất liệu, màu sắc bạn yêu thích và tải lên một bức ảnh toàn thân. Sau khi thanh toán phí trải
        nghiệm, đội ngũ TomQ Bridal sẽ dựng hình ảnh bạn trong chiếc áo đã chọn bằng công nghệ AI.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-sm uppercase tracking-widest text-[var(--color-accent)]">{t.tryon.step1}</h2>
          {product.styles.length > 0 && (
            <ChoiceRow label={t.product.style} options={product.styles} value={style} onChange={setStyle} />
          )}
          {product.materials.length > 0 && (
            <ChoiceRow label={t.product.material} options={product.materials} value={material} onChange={setMaterial} />
          )}
          {product.colors.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">{t.product.color}</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full border-2 ${
                      color === c.id ? "border-[var(--color-primary)]" : "border-[var(--color-line)]"
                    }`}
                    style={{ backgroundColor: c.hexCode }}
                  />
                ))}
              </div>
            </div>
          )}

          <h2 className="text-sm uppercase tracking-widest text-[var(--color-accent)] pt-4">{t.tryon.step2}</h2>
          <div>
            <label
              className="border-2 border-dashed border-[var(--color-line)] rounded flex flex-col items-center justify-center h-56 cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Ảnh của bạn" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-6">
                  <UploadCloud className="w-8 h-8 mx-auto mb-2 text-[var(--color-muted)]" />
                  <p className="text-sm text-[var(--color-muted)]">{t.tryon.uploadPhoto}</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            <p className="text-xs text-[var(--color-muted)] mt-2">{t.tryon.uploadHint}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm uppercase tracking-widest text-[var(--color-accent)]">Thông tin liên hệ</h2>
          <Field label={t.checkout.fullName} required value={fullName} onChange={setFullName} />
          <Field label={t.checkout.phone} required value={phone} onChange={setPhone} />
          <Field label={t.checkout.email} value={email} onChange={setEmail} type="email" />

          <div className="bg-[var(--color-secondary)] p-6">
            <div className="flex justify-between text-sm mb-1">
              <span>{t.tryon.fee}</span>
              <span className="font-heading text-lg">{formatMoney(fee)}</span>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Sau khi gửi yêu cầu, bạn sẽ nhận được thông tin chuyển khoản để thanh toán phí trải nghiệm này.
            </p>
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-accent w-full justify-center disabled:opacity-60">
            {submitting ? t.common.loading : t.tryon.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-[var(--color-muted)] mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-4 py-2 text-sm border ${
              value === o.id ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]" : "border-[var(--color-line)]"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-[var(--color-muted)] block mb-2">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-[var(--color-line)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}
