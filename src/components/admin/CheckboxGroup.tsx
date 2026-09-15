export default function CheckboxGroup({
  name,
  label,
  options,
  defaultSelected = [],
}: {
  name: string;
  label: string;
  options: { id: string; label: string }[];
  defaultSelected?: string[];
}) {
  if (options.length === 0) {
    return (
      <div>
        <p className="text-xs text-neutral-500 mb-2">{label}</p>
        <p className="text-xs text-neutral-400">Chưa có lựa chọn nào — thêm ở trang tương ứng trước.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs text-neutral-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <label key={o.id} className="flex items-center gap-1.5 text-sm border border-neutral-200 px-3 py-1.5 cursor-pointer">
            <input type="checkbox" name={name} value={o.id} defaultChecked={defaultSelected.includes(o.id)} className="w-3.5 h-3.5" />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}
