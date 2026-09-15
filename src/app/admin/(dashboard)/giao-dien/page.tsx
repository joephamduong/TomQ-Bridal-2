import { getSiteSettings, getHomeContent } from "@/lib/repo/settings";
import { updateSiteSettingsAction, updateHomeContentAction } from "@/app/actions/admin";
import { TextInput, TextArea } from "@/components/admin/FormFields";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default async function AppearanceAdminPage() {
  const settings = getSiteSettings();
  const home = getHomeContent();

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-heading text-2xl mb-1">Giao diện website</h1>
        <p className="text-sm text-neutral-500">
          Chỉnh sửa thương hiệu, màu sắc, thông tin liên hệ, tài khoản ngân hàng và nội dung trang chủ — áp dụng ngay trên website, không cần sửa code.
        </p>
      </div>

      <form action={updateSiteSettingsAction} className="space-y-8">
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Thương hiệu</h2>
          <TextInput name="siteName" label="Tên website / thương hiệu" required defaultValue={settings.siteName} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField name="logoUrl" label="Logo (hiển thị trên menu)" defaultValue={settings.logoUrl} subdir="site" aspect="aspect-square" />
            <ImageUploadField name="faviconUrl" label="Favicon" defaultValue={settings.faviconUrl} subdir="site" aspect="aspect-square" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Màu sắc website</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TextInput name="colorPrimary" label="Màu chính" type="color" defaultValue={settings.colorPrimary} />
            <TextInput name="colorSecondary" label="Màu phụ" type="color" defaultValue={settings.colorSecondary} />
            <TextInput name="colorAccent" label="Màu nhấn" type="color" defaultValue={settings.colorAccent} />
            <TextInput name="colorDark" label="Màu tối" type="color" defaultValue={settings.colorDark} />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Đơn vị tiền tệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput name="currencyCode" label="Mã tiền tệ (vd: AUD, VND, USD)" defaultValue={settings.currencyCode} />
            <TextInput name="currencyLocale" label="Locale định dạng (vd: en-AU, vi-VN)" defaultValue={settings.currencyLocale} />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Thông tin liên hệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput name="phone" label="Số điện thoại" defaultValue={settings.phone} />
            <TextInput name="email" label="Email" defaultValue={settings.email} />
          </div>
          <TextArea name="address" label="Địa chỉ studio" defaultValue={settings.address} rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput name="facebookUrl" label="Facebook URL" defaultValue={settings.facebookUrl ?? undefined} />
            <TextInput name="instagramUrl" label="Instagram URL" defaultValue={settings.instagramUrl ?? undefined} />
            <TextInput name="zaloUrl" label="Zalo URL" defaultValue={settings.zaloUrl ?? undefined} />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Tài khoản nhận chuyển khoản</h2>
          <p className="text-xs text-neutral-400 -mt-2">
            Hiển thị cho khách khi thanh toán đơn hàng / phí thử đồ AI để khách tự chuyển khoản.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput name="bankName" label="Tên ngân hàng" defaultValue={settings.bankName} />
            <TextInput name="bankAccountName" label="Chủ tài khoản" defaultValue={settings.bankAccountName} />
            <TextInput name="bankAccountNumber" label="Số tài khoản" defaultValue={settings.bankAccountNumber} />
            <TextInput name="bankBsb" label="Mã BSB / chi nhánh" defaultValue={settings.bankBsb} />
          </div>
          <TextInput name="bankBranch" label="Chi nhánh (nếu có)" defaultValue={settings.bankBranch} />
          <ImageUploadField name="bankQrImageUrl" label="Mã QR chuyển khoản (nếu có)" defaultValue={settings.bankQrImageUrl} subdir="site" aspect="aspect-square" />
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Phí &amp; đặt cọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput name="defaultShippingFee" label="Phí vận chuyển mặc định" type="number" step="0.01" defaultValue={settings.defaultShippingFee} />
            <TextInput name="freeShippingThreshold" label="Miễn phí ship từ đơn giá trị" type="number" step="0.01" defaultValue={settings.freeShippingThreshold} />
            <TextInput name="tryOnFee" label="Phí thử đồ AI" type="number" step="0.01" defaultValue={settings.tryOnFee} />
            <TextInput name="appointmentDeposit" label="Tiền đặt cọc lịch hẹn" type="number" step="0.01" defaultValue={settings.appointmentDeposit} />
          </div>
        </div>

        <button type="submit" className="bg-neutral-900 text-white text-sm px-6 py-3">
          Lưu thiết lập chung
        </button>
      </form>

      <form action={updateHomeContentAction} className="space-y-8 pt-4 border-t border-neutral-200">
        <h2 className="font-heading text-xl">Nội dung trang chủ</h2>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Banner đầu trang (Hero)</h3>
          <TextInput name="heroTitle" label="Tiêu đề" defaultValue={home.heroTitle} />
          <TextArea name="heroSubtitle" label="Mô tả phụ" defaultValue={home.heroSubtitle} rows={3} />
          <ImageUploadField name="heroImageUrl" label="Ảnh banner" defaultValue={home.heroImageUrl} subdir="site" aspect="aspect-video" />
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Giới thiệu</h3>
          <TextInput name="introTitle" label="Tiêu đề" defaultValue={home.introTitle} />
          <TextArea name="introBody" label="Nội dung" defaultValue={home.introBody} rows={4} />
          <ImageUploadField name="introImageUrl" label="Ảnh giới thiệu" defaultValue={home.introImageUrl} subdir="site" aspect="aspect-video" />
        </div>

        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Câu chuyện thương hiệu</h3>
          <TextInput name="storyTitle" label="Tiêu đề" defaultValue={home.storyTitle} />
          <TextArea name="storyBody" label="Nội dung" defaultValue={home.storyBody} rows={5} />
          <ImageUploadField name="storyImageUrl" label="Ảnh câu chuyện" defaultValue={home.storyImageUrl} subdir="site" aspect="aspect-video" />
        </div>

        <button type="submit" className="bg-neutral-900 text-white text-sm px-6 py-3">
          Lưu nội dung trang chủ
        </button>
      </form>
    </div>
  );
}
