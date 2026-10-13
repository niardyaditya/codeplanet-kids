"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ pesan }) {
  return (
    <AnimatePresence>
      {pesan && (
        <motion.div
          key={pesan}
          className="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
        >
          {pesan}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
