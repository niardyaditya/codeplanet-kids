"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bunyi } from "@/lib/audio";

const SAPAAN = "Halo, aku Bito! Mau tanya apa tentang coding hari ini?";
const CEPAT = ["Apa itu Ulangi?", "Bagaimana cara belok?", "Apa itu blok Jika?", "Kenapa robotku menabrak?"];

export default function Bito() {
  const [pesan, setPesan] = useState([{ peran: "bito", isi: SAPAAN }]);
  const [teks, setTeks] = useState("");
  const [mengetik, setMengetik] = useState(false);
  const bawah = useRef(null);

  useEffect(() => {
    bawah.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [pesan, mengetik]);

  async function kirim(isi) {
    const bersih = String(isi).trim().slice(0, 300);
    if (!bersih || mengetik) return;
    const riwayat = [...pesan, { peran: "anak", isi: bersih }].slice(-6);
    setPesan(riwayat);
    setTeks("");
    setMengetik(true);
    bunyi("klik");
    try {
      const res = await fetch("/api/bito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: bersih, riwayat: riwayat.slice(0, -1) }),
      });
      const data = await res.json();
      setPesan((p) => [...p, { peran: "bito", isi: data.balasan || "Bito sedang istirahat sebentar." }]);
    } catch {
      setPesan((p) => [...p, { peran: "bito", isi: "Koneksi sedang bermasalah. Coba tanya lagi ya!" }]);
    } finally {
      setMengetik(false);
    }
  }

  return (
    <div className="kartu" style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/art/characters/bito-ai-robot/bito-03-thinking.svg" alt="" width={72} height={72} />
        <div>
          <h1 style={{ color: "#14204f", fontSize: 28, margin: 0 }}>Tanya Bito</h1>
          <p className="caption" style={{ margin: 0 }}>Bito hanya membahas coding dan materi CodePlanet Kids.</p>
        </div>
      </div>

      <div className="chat" role="log" aria-live="polite" aria-label="Percakapan dengan Bito" style={{ maxHeight: "52vh", overflowY: "auto", padding: 4 }}>
        <AnimatePresence initial={false}>
          {pesan.map((m, i) => (
            <motion.div
              key={i}
              className={`gelembung ${m.peran}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {m.isi}
            </motion.div>
          ))}
        </AnimatePresence>
        {mengetik && (
          <div className="gelembung bito" aria-label="Bito sedang mengetik" style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((n) => (
              <motion.span
                key={n}
                style={{ width: 8, height: 8, borderRadius: "50%", background: "#14204f", display: "inline-block" }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: n * 0.12 }}
              />
            ))}
          </div>
        )}
        <div ref={bawah} />
      </div>

      <div className="chat-cepat">
        {CEPAT.map((c) => (
          <button key={c} type="button" onClick={() => kirim(c)} disabled={mengetik}>
            {c}
          </button>
        ))}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          kirim(teks);
        }}
      >
        <label htmlFor="tanya" className="visually-hidden">Tulis pertanyaanmu</label>
        <input
          id="tanya"
          className="input-nama"
          value={teks}
          maxLength={300}
          placeholder="Tulis pertanyaanmu di sini"
          onChange={(e) => setTeks(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-kecil" disabled={mengetik || !teks.trim()}>
          Kirim
        </button>
      </form>
    </div>
  );
}
