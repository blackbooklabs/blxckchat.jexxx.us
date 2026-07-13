"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { useEffect } from "react";

interface ZoomModalProps {
  url: string;
  name?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ZoomModal({ url, name, isOpen, onClose }: ZoomModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-7xl w-full max-h-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 left-0 right-0 flex items-center justify-between text-white/70">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {name || "Sacred Vision"}
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={url}
                  download={name || "vision.jpg"}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
              <img
                src={url}
                alt={name || "Zoomed vision"}
                className="max-w-full max-h-[80vh] object-contain select-none"
              />
            </div>

            <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-light">
              JEXXXUS Empire • Vision Payload Analysis
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}