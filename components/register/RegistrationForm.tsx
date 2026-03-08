"use client";

interface Props {
  children: React.ReactNode;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function RegistrationForm({ children, handleSubmit }: Props) {
  return (
    <form
      id="registration-form"
      noValidate
      onSubmit={handleSubmit}
      aria-label="Race registration form"
      className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-8"
    >
      {children}
    </form>
  );
}
