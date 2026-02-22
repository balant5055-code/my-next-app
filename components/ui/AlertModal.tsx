"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  title: string;
  message: string | null;
  onClose: () => void;
}

export default function AlertModal({ open, title, message, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white">{title}</h2>

            <p className="text-sm text-slate-400 mt-3">{message}</p>

            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
