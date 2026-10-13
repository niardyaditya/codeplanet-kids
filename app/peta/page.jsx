"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { PLANET_SEMUA, PLANET_AKTIF } from "@/lib/content";
import { useProgress, planetTerbuka, sudahSelesai } from "@/lib/progress";
import { bunyi } from "@/lib/audio";
import Toast from "@/components/Toast";

function statusPlanet(progress, planet) {
  if (planet.levels.length === 0) return "segera";
  const index = PLANET_AKTIF.findIndex((p) => p.slug === planet.slug);
  if (index === -1) return "segera";
  if (planet.levels.every((l) => sudahSelesai(progress, l.id))) return "selesai";
  return planetTerbuka(progress, index) ? "aktif" : "terkunci";
}

const LABEL = { selesai: "Selesai", aktif: "Ayo jelajahi!", terkunci: "Terkunci", segera: "Segera hadir" };

export default function Peta() {
  const progress = useProgress();
  const [toast, setToast] = useState(null);

  function klik(e, pesan) {
    e.preventDefault();
    bunyi("salah");
    setToast(pesan);
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div>
      <h1>Peta Planet</h1>
      <p>Selesaikan planet satu per satu untuk membuka planet berikutnya.</p>

      <div className="peta-jalur" style={{ marginTop: 18 }}>
        {PLANET_SEMUA.map((planet, i) => {
          const status = statusPlanet(progress, planet);
          const bintang = planet.levels.reduce((t, l) => t + (progress.bintang[l.id] || 0), 0);
          const isi = (
            <>
              <img
                src={planet.art}
                alt=""
                width={120}
                height={120}
                className={status === "aktif" ? "planet-berputar" : undefined}
              />
              <strong style={{ fontFamily: "Fredoka", fontSize: 22 }}>{planet.judul}</strong>
              <span className="caption" style={{ color: "#cbd5e1" }}>{planet.tagline}</span>
              <span className="node-status">{LABEL[status]}</span>
              {planet.levels.length > 0 && <span className="node-bintang" aria-label={`${bintang} dari ${planet.levels.length * 3} bintang`}>★ {bintang} / {planet.levels.length * 3}</span>}
            </>
          );
          const pesanKunci =
            status === "segera" ? "Planet ini segera hadir!" : "Selesaikan planet sebelumnya dulu ya!";
          return (
            <motion.div
              key={planet.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              style={{ width: "100%", display: "grid", justifyItems: "center" }}
            >
              {status === "aktif" || status === "selesai" ? (
                <Link className="node" href={`/planet/${planet.slug}`} data-status={status === "aktif" ? "aktif" : "selesai"} aria-label={`${planet.judul}, ${LABEL[status]}`}>
                  {isi}
                </Link>
              ) : (
                <button
                  type="button"
                  className="node"
                  data-status="terkunci"
                  onClick={(e) => klik(e, pesanKunci)}
                  aria-label={`${planet.judul}, ${LABEL[status]}`}
                >
                  {isi}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      <Toast pesan={toast} />
    </div>
  );
}
