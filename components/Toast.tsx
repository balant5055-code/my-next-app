"use client";

import { useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

type ToastType = "success" | "error" | "info" | null;

interface ToastProps {
  message: string | null;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 mr-2" />,
    error: <ExclamationCircleIcon className="h-6 w-6 mr-2" />,
    info: null,
  };

  return (
    <div
      className={`
        fixed top-5 right-5 z-50 
        ${styles[type || "info"]}
        px-5 py-3 rounded-lg shadow-lg
        flex items-center
        transition-all duration-300 transform
        animate-slideIn
      `}
    >
      {icons[type || "info"]}

      <span className="mr-3">{message}</span>

      <button onClick={onClose}>
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
