"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Modal({ judul, onTutup, children, aksi }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const sebelumnya = document.activeElement;
    dialogRef.current?.querySelector("button")?.focus();
    const tutup = (e) => {
      if (e.key === "Escape") onTutup();
    };
    window.addEventListener("keydown", tutup);
    return () => {
      window.removeEventListener("keydown", tutup);
      if (sebelumnya && sebelumnya.focus) sebelumnya.focus();
    };
  }, [onTutup]);

  return (
    <div className="modal-latar" onClick={onTutup} role="presentation">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <h2>{judul}</h2>
        {children}
        <div className="modal-aksi">{aksi}</div>
      </motion.div>
    </div>
  );
}
