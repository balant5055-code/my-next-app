"use client";

interface AnimatedRadioGroupProps {
  name: string;
  value: string;
  options: string[];
  required?: boolean;
  onChange: (e: any) => void;
}

export default function AnimatedRadioGroup({
  name,
  value,
  options,
  required = false,
  onChange,
}: AnimatedRadioGroupProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-3
            text-sm font-medium transition-all
            ${
              value === option
                ? "border-orange-500 bg-orange-50 shadow-sm"
                : "border-gray-300 hover:border-orange-400"
            }`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            required={required}
            onChange={onChange}
            className="accent-orange-500"
          />

          <span className="text-gray-800">{option}</span>
        </label>
      ))}
    </div>
  );
}
