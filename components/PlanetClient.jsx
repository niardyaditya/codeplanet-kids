"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPlanet, PLANET_AKTIF } from "@/lib/content";
import { useProgress, levelTerbuka, sudahSelesai } from "@/lib/progress";

export default function PlanetClient({ slug }) {
  const planet = getPlanet(slug);
  const progress = useProgress();
  if (!planet) return null;

  const planetIndex = PLANET_AKTIF.findIndex((p) => p.slug === slug);
  if (planet.levels.length === 0 || planetIndex === -1) {
    return (
      <section className="kartu" style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
        <img src={planet.art} alt="" width={160} height={160} className="planet-berputar" />
        <h1 style={{ color: "#14204f", fontSize: 32 }}>{planet.judul}</h1>
        <p>{planet.tagline}</p>
        <p className="caption">Planet ini akan dibuka di pembaruan berikutnya.</p>
        <Link className="btn btn-primary" href="/peta">Kembali ke peta</Link>
      </section>
    );
  }

  const jumlahSelesai = planet.levels.filter((l) => sudahSelesai(progress, l.id)).length;
  const bintangTotal = planet.levels.reduce((total, l) => total + (progress.bintang[l.id] || 0), 0);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <motion.section
        className="kartu"
        style={{ display: "grid", gap: 14, gridTemplateColumns: "auto 1fr", alignItems: "center" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <img src={planet.art} alt="" width={120} height={120} className="planet-berputar" />
        <div>
          <p className="caption" style={{ margin: 0 }}>Planet {planet.urutan} dari 6</p>
          <h1 style={{ color: "#14204f", fontSize: 30, margin: "0 0 6px" }}>{planet.judul}</h1>
          <p style={{ margin: "0 0 8px", color: "#14204f" }}>{planet.tagline}</p>
          <span className="chip chip-kuning">
            {jumlahSelesai}/{planet.levels.length} level · {bintangTotal} bintang
          </span>
        </div>
      </motion.section>

      <div className="level-list" role="list">
        {planet.levels.map((level, i) => {
          const selesai = sudahSelesai(progress, level.id);
          const terbuka = levelTerbuka(progress, planetIndex, i);
          const status = selesai ? "selesai" : terbuka ? "aktif" : "terkunci";
          const bintang = progress.bintang[level.id] || 0;
          const isi = (
            <>
              <span className="level-nomor" aria-hidden="true">{i + 1}</span>
              <span>
                <h3 style={{ color: "#14204f", margin: 0 }}>{level.judul}</h3>
                <span className="caption">
                  {status === "terkunci" ? "Selesaikan level sebelumnya dulu" : level.konsep.split(".")[0] + "."}
                </span>
              </span>
              <span className="bintang-baris" aria-label={`${bintang} bintang`}>
                {"★".repeat(bintang)}
                {"☆".repeat(3 - bintang)}
              </span>
            </>
          );
          return (
            <motion.div
              key={level.id}
              role="listitem"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              data-status={status}
            >
              {terbuka ? (
                <Link className="level-item" href={`/planet/${planet.slug}/${level.id}`} data-status={status} aria-label={`${level.judul}, ${status}`}>
                  {isi}
                </Link>
              ) : (
                <div className="level-item" aria-disabled="true" data-status={status} aria-label={`${level.judul}, terkunci`}>
                  {isi}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
