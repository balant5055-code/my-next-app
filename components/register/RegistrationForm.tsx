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
      className="bg-white space-y-8"
    >
      {children}
    </form>
  );
}
