"use client";

interface Props {
  form: any;
  errors: Record<string, string>;
  handleChange: (e: any) => void;
  setShowTerms?: (value: boolean) => void;
}

export default function TermsAgreement({
  form,
  errors,
  handleChange,
  setShowTerms,
}: Props) {
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-xs text-red-600 mt-1">{error}</p>;
  };

  return (
    <div className="space-y-2">
      {/* CHECKBOX */}
      <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          name="agree"
          checked={form.agree}
          onChange={handleChange}
          className="mt-1 accent-[var(--color-orange-500)]"
        />

        <span>
          I have read and accept the{" "}
          <span
            onClick={() => setShowTerms && setShowTerms(true)}
            className="text-blue-600 underline cursor-pointer"
          >
            Terms and Conditions
          </span>
          <p className="text-xs text-gray-500 mt-1">
            * Additional payment gateway charges may apply
          </p>
        </span>
      </label>

      {/* ERROR */}
      <FieldError error={errors.agree} />
    </div>
  );
}
