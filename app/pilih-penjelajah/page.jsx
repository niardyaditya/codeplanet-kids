"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProgress, setProfil } from "@/lib/progress";
import { bunyi } from "@/lib/audio";

const PILIHAN = [
  { id: "explorer-boy", nama: "Explorer Boy", gambar: "/art/characters/explorer-boy/explorer-boy-01-standing.svg", deskripsi: "Penjelajah yang suka mencoba hal baru." },
  { id: "byte-cat", nama: "Byte Cat", gambar: "/art/characters/byte-cat/byte-cat-01-idle.svg", deskripsi: "Teman bermain digital yang lincah." },
];

export default function PilihPenjelajah() {
  const router = useRouter();
  const progress = useProgress();
  const [pilihan, setPilihan] = useState(progress.penjelajah);
  const [nama, setNama] = useState(progress.nama);
  const bersih = nama.trim();
  const valid = bersih.length >= 2;

  function kirim(e) {
    e.preventDefault();
    if (!valid) return;
    setProfil({ nama: bersih, penjelajah: pilihan });
    bunyi("benar");
    router.push("/peta");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1>Pilih penjelajahmu</h1>
      <p>Siapa yang akan menemani petualanganmu di angkasa digital?</p>

      <form onSubmit={kirim} className="kartu" style={{ display: "grid", gap: 14 }}>
        <div className="pilihan-grid" role="group" aria-label="Pilih penjelajah">
          {PILIHAN.map((p) => (
            <button
              key={p.id}
              type="button"
              className="pilihan"
              aria-pressed={pilihan === p.id}
              onClick={() => {
                setPilihan(p.id);
                bunyi("klik");
              }}
            >
              <img src={p.gambar} alt="" width={140} height={140} />
              <strong style={{ fontFamily: "Fredoka", fontSize: 24 }}>{p.nama}</strong>
              <span className="caption">{p.deskripsi}</span>
            </button>
          ))}
        </div>

        <label htmlFor="nama" style={{ fontFamily: "Fredoka", fontSize: 20, color: "#14204f" }}>
          Nama panggilanmu (2 sampai 12 huruf)
        </label>
        <input
          id="nama"
          className="input-nama"
          value={nama}
          maxLength={12}
          autoComplete="off"
          placeholder="Contoh: Rafi"
          onChange={(e) => setNama(e.target.value.replace(/[^\p{L}\p{N} ]/gu, ""))}
        />
        <p className="caption" style={{ margin: 0 }}>
          Nama ini hanya disimpan di perangkatmu. Jangan tulis nama lengkap atau data pribadi lainnya.
        </p>
        <div>
          <button type="submit" className="btn btn-primary" disabled={!valid}>
            Mulai Petualangan
          </button>
        </div>
      </form>
    </motion.div>
  );
}
