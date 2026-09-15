import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, Sparkles, Heart } from "lucide-react";
import { getSiteSettings } from "@/lib/repo/settings";

export const metadata: Metadata = {
  title: "About Us",
  description: "Câu chuyện thương hiệu TomQ Bridal — nhà thiết kế Tom Nguyen và hành trình hơn 20 năm trong ngành thời trang cưới.",
};

export default async function AboutPage() {
  const settings = getSiteSettings();

  return (
    <div>
      <section className="relative h-[50vh] min-h-[360px] flex items-end bg-[var(--color-dark)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1800&auto=format&fit=crop"
          alt="TomQ Bridal atelier"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="container-narrow relative pb-14 text-white">
          <p className="eyebrow !text-white/80 mb-3">Since Day One</p>
          <h1 className="font-heading text-4xl md:text-5xl">About TomQ Bridal</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="container-narrow grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="eyebrow mb-4">Người sáng lập</p>
            <h2 className="font-heading text-3xl mb-6 text-[var(--color-dark)]">Nhà thiết kế Tom Nguyen</h2>
            <p className="text-[var(--color-muted)] leading-relaxed mb-4">
              TomQ Bridal được thành lập bởi Tom Nguyen — nhà thiết kế với hơn 20 năm kinh nghiệm trong ngành thời
              trang. Từ niềm đam mê với thiết kế trang phục, ông đã xây dựng TomQ Bridal thành một studio boutique
              đồng hành cùng hàng trăm cô dâu, chú rể trong hơn 5 năm qua.
            </p>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Chúng tôi tin rằng sự sang trọng thực sự đến từ sự thấu hiểu: mỗi thiết kế là sự kết hợp giữa tay nghề
              thủ công tinh xảo, sự sáng tạo không giới hạn, và cam kết biến tầm nhìn của khách hàng thành hiện thực.
            </p>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1200&auto=format&fit=crop"
              alt="Tom Nguyen"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--color-secondary)]">
        <div className="container-narrow">
          <h2 className="font-heading text-3xl text-center mb-14 text-[var(--color-dark)]">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Scissors, title: "Thủ công", desc: "Chất lượng và độ chính xác trong từng đường kim mũi chỉ." },
              { icon: Sparkles, title: "Sáng tạo", desc: "Thiết kế độc bản phản ánh cá tính riêng của mỗi khách hàng." },
              { icon: Heart, title: "Trao quyền cho khách hàng", desc: "Tầm nhìn của bạn là ưu tiên của chúng tôi." },
            ].map((v, i) => (
              <div key={i} className="bg-[var(--color-ivory)] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-heading text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--color-muted)]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="container-narrow max-w-2xl">
          <h2 className="font-heading text-3xl mb-4 text-[var(--color-dark)]">Ghé thăm Atelier</h2>
          <p className="text-[var(--color-muted)] mb-2">{settings.address}</p>
          <p className="text-[var(--color-muted)] mb-8">
            {settings.phone} · {settings.email}
          </p>
          <Link href="/dat-lich-hen" className="btn-primary">
            Đặt lịch hẹn
          </Link>
        </div>
      </section>
    </div>
  );
}
