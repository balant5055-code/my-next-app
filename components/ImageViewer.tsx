"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  image: string | null;
  onClose: () => void;
};

export default function ImageViewer({ image, onClose }: Props) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur"
          onClick={onClose}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-50 bg-white/90 rounded-full p-2 shadow"
          >
            <XMarkIcon className="h-5 w-5 text-gray-800" />
          </button>

          {/* IMAGE */}
          <motion.img
            src={image}
            drag
            dragElastic={0.2}
            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
            whileTap={{ cursor: "grabbing" }}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-2xl cursor-grab"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
