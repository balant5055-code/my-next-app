"use client";

import { motion } from "framer-motion";

export default function WhatsAppFloat() {
  const phone = "919876543210"; // your number with country code

  return (
    <motion.a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600"
    >
      {/* WhatsApp Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-5 h-5 fill-white"
      >
        <path d="M16 .4C7.4.4.4 7.3.4 15.9c0 2.8.7 5.5 2.1 7.9L.1 31.6l8-2.3c2.3 1.3 4.9 2 7.6 2 8.6 0 15.6-7 15.6-15.6C31.3 7.3 24.6.4 16 .4zm0 28.6c-2.4 0-4.7-.7-6.6-1.9l-.5-.3-4.7 1.3 1.3-4.6-.3-.5c-1.3-2-2-4.3-2-6.7C3.2 9.1 9.1 3.2 16 3.2c6.9 0 12.8 5.9 12.8 12.8 0 7-5.8 13-12.8 13zm7.4-9.6c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.6-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-.1-.1-.3-.3-.4-.4-1.3-1.2-2.2-2.7-2.4-3.1-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.7.2-.2.3-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.9-2.1-1.3-2.9-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .4-.4.4-1.5 1.5-1.5 3.6s1.5 4.2 1.7 4.5c.2.3 3 4.6 7.3 6.4 1 .4 1.8.7 2.4.9 1 .3 1.9.3 2.6.2.8-.1 2.4-1 2.8-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z" />
      </svg>

      <span className="hidden sm:block text-sm font-semibold">WhatsApp</span>
    </motion.a>
  );
}
