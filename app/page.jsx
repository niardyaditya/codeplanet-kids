"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress, levelBerikutnyaBelumSelesai } from "@/lib/progress";

const fitur = [
  { ikon: "/art/icons/features/icon-feature-01-ai-mentor.svg", judul: "Bito, mentor AI", teks: "Tanya Bito kapan saja. Bito memberi petunjuk, bukan jawaban langsung." },
  { ikon: "/art/icons/features/icon-feature-02-coding-quest.svg", judul: "Coding quest", teks: "Susun blok perintah dan lihat robotmu bergerak di angkasa." },
  { ikon: "/art/icons/features/icon-feature-04-achievement-badge.svg", judul: "Badge & sertifikat", teks: "Kumpulkan bintang, badge, dan sertifikat setelah menyelesaikan planet." },
];

const wadah = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Beranda() {
  const progress = useProgress();
  const lanjut = levelBerikutnyaBelumSelesai(progress);
  const sudahMulai = progress.nama.trim().length > 0;

  return (
    <div>
      <motion.section className="hero" variants={wadah} initial="hidden" animate="show">
        <motion.div className="hero-teks" variants={item}>
          <h1>Selamat datang, penjelajah!</h1>
          <p>
            Di CodePlanet Kids kamu belajar coding dengan menjelajahi planet, menyelesaikan quest, dan dibantu
            Bito si robot mentor.
          </p>
          <div className="hero-aksi">
            <Link className="btn btn-primary" href={sudahMulai ? "/peta" : "/pilih-penjelajah"}>
              {sudahMulai ? "Lanjut Misi" : "Mulai Misi"}
            </Link>
            <Link className="btn btn-ghost" href="/bito">Tanya Bito</Link>
          </div>
          {sudahMulai && lanjut && (
            <p className="caption" style={{ marginTop: 16 }}>
              Berikutnya: {lanjut.level.judul} di {lanjut.planet.judul}
            </p>
          )}
        </motion.div>

        <motion.div className="hero-gambar" variants={item}>
          <img className="planet-melayang" src="/art/planets-and-parts/planet-01-loop-orange.svg" alt="" width={200} height={200} />
          <motion.img
            className="bito-besar"
            src="/art/characters/bito-ai-robot/bito-01-welcome.svg"
            alt="Bito AI Robot melambaikan tangan"
            width={360}
            height={360}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <img className="sparkle-kanan" src="/art/decorations/deco-01-sparkles.svg" alt="" width={56} height={56} />
        </motion.div>
      </motion.section>

      <motion.div className="fitur-grid" variants={wadah} initial="hidden" animate="show">
        {fitur.map((f) => (
          <motion.article key={f.judul} className="kartu-gelap fitur" variants={item}>
            <img src={f.ikon} alt="" width={64} height={64} />
            <h2 style={{ margin: 0, fontSize: 22 }}>{f.judul}</h2>
            <p style={{ margin: 0, color: "#e2e8f0" }}>{f.teks}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
