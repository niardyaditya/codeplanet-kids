"use client";
import { motion } from "framer-motion";
import { BADGE, useProgress, levelDariXP } from "@/lib/progress";

export default function Pencapaian() {
  const progress = useProgress();
  const level = levelDariXP(progress.xp);
  const persen = progress.xp % 100;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h1>Pencapaian</h1>
        <p>Kumpulkan badge dengan menyelesaikan tantangan.</p>
      </div>

      <section className="kartu" aria-label="Progres XP">
        <div style={{ display: "flex", justifyContent: "space-between", color: "#14204f", fontWeight: 700 }}>
          <span>Level {level}</span>
          <span>{progress.xp} XP total</span>
        </div>
        <div className="xp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen} style={{ marginTop: 8 }}>
          <motion.div
            className="xp-isi"
            initial={{ width: 0 }}
            animate={{ width: `${persen}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="caption" style={{ margin: "8px 0 0" }}>{100 - persen} XP lagi ke level berikutnya</p>
      </section>

      <div className="badge-grid">
        {Object.entries(BADGE).map(([id, b], i) => {
          const dimiliki = progress.badge.includes(id);
          return (
            <motion.article
              key={id}
              className="badge-kartu"
              data-kunci={dimiliki ? "tidak" : "ya"}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
            >
              <img src={b.art} alt={dimiliki ? `Badge ${b.nama}, sudah didapat` : `Badge ${b.nama}, belum terbuka`} width={96} height={96} />
              <h3 style={{ color: "#14204f", margin: 0 }}>{b.nama}</h3>
              <span className="caption">{dimiliki ? "Sudah didapat!" : b.syarat}</span>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
