// Các input dùng chung cho form trong trang Admin (Server Component friendly — không cần "use client"
// vì đây chỉ là input HTML thuần, được submit qua Server Action của form cha).

export function TextInput({
  name,
  label,
  required,
  type = "text",
  defaultValue,
  placeholder,
  step,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs text-neutral-500 block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
      />
    </div>
  );
}

export function TextArea({
  name,
  label,
  defaultValue,
  rows = 3,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-neutral-500 block mb-1">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
      />
    </div>
  );
}

export function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4" />
      {label}
    </label>
  );
}

export function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-xs text-neutral-500 block mb-1">{label}</label>
      <select name={name} defaultValue={defaultValue} className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
