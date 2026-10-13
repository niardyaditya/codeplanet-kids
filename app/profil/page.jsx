"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PLANET_AKTIF } from "@/lib/content";
import { useProgress, setProfil, setSuara, resetProgress, levelDariXP, sudahSelesai } from "@/lib/progress";
import { bunyi } from "@/lib/audio";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";

export default function Profil() {
  const progress = useProgress();
  const [namaEdit, setNamaEdit] = useState(progress.nama);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [toast, setToast] = useState(null);

  const avatar =
    progress.penjelajah === "byte-cat"
      ? "/art/characters/byte-cat/byte-cat-02-happy.svg"
      : "/art/characters/explorer-boy/explorer-boy-05-celebration.svg";
  const semuaLevel = PLANET_AKTIF.flatMap((p) => p.levels);
  const selesaiCount = semuaLevel.filter((l) => sudahSelesai(progress, l.id)).length;
  const bintangTotal = Object.values(progress.bintang).reduce((t, n) => t + n, 0);
  const sertifikatSiap = selesaiCount === semuaLevel.length;
  const bersih = namaEdit.trim();

  function simpanNama(e) {
    e.preventDefault();
    if (bersih.length < 2) {
      setToast("Nama minimal 2 huruf");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setProfil({ nama: bersih, penjelajah: progress.penjelajah });
    bunyi("benar");
    setToast("Nama tersimpan!");
    setTimeout(() => setToast(null), 2000);
  }

  function ganti(penjelajah) {
    setProfil({ nama: progress.nama, penjelajah });
    bunyi("klik");
  }

  return (
    <div className="profil-grid">
      <motion.section className="kartu" style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <img src={avatar} alt="" width={180} height={180} />
        <h1 style={{ color: "#14204f", margin: 0, fontSize: 30 }}>{progress.nama || "Penjelajah"}</h1>
        <span className="chip chip-kuning">Level {levelDariXP(progress.xp)}</span>

        <div className="stat-grid" style={{ width: "100%" }}>
          <div className="stat" style={{ color: "#14204f", background: "rgba(37,99,235,.1)" }}><b style={{ color: "#2563eb" }}>{progress.xp}</b>XP</div>
          <div className="stat" style={{ color: "#14204f", background: "rgba(37,99,235,.1)" }}><b style={{ color: "#2563eb" }}>{selesaiCount}</b>Level</div>
          <div className="stat" style={{ color: "#14204f", background: "rgba(37,99,235,.1)" }}><b style={{ color: "#2563eb" }}>{bintangTotal}</b>Bintang</div>
        </div>

        <div className="aksi-baris" style={{ justifyContent: "center" }}>
          {sertifikatSiap ? (
            <Link className="btn btn-primary btn-kecil" href="/sertifikat">Ambil sertifikat</Link>
          ) : (
            <span className="caption">Selesaikan semua level untuk sertifikat</span>
          )}
        </div>
      </motion.section>

      <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
        <section className="kartu" aria-labelledby="judul-nama">
          <h2 id="judul-nama">Nama & penjelajah</h2>
          <form onSubmit={simpanNama} style={{ display: "grid", gap: 12 }}>
            <input
              className="input-nama"
              value={namaEdit}
              maxLength={12}
              aria-label="Nama panggilan"
              onChange={(e) => setNamaEdit(e.target.value.replace(/[^\p{L}\p{N} ]/gu, ""))}
            />
            <button type="submit" className="btn btn-secondary btn-kecil">Simpan nama</button>
          </form>
          <div className="aksi-baris" style={{ marginTop: 12 }} role="group" aria-label="Pilih penjelajah">
            <button className="btn btn-kecil" style={{ background: progress.penjelajah === "explorer-boy" ? "var(--cyan)" : "#e2e8f0", color: "#14204f" }} aria-pressed={progress.penjelajah === "explorer-boy"} onClick={() => ganti("explorer-boy")}>Explorer Boy</button>
            <button className="btn btn-kecil" style={{ background: progress.penjelajah === "byte-cat" ? "var(--cyan)" : "#e2e8f0", color: "#14204f" }} aria-pressed={progress.penjelajah === "byte-cat"} onClick={() => ganti("byte-cat")}>Byte Cat</button>
          </div>
        </section>

        <section className="kartu" aria-labelledby="judul-pengaturan">
          <h2 id="judul-pengaturan">Pengaturan</h2>
          <div className="aksi-baris">
            <button
              className="btn btn-kecil btn-ghost"
              aria-pressed={progress.suara}
              onClick={() => {
                setSuara(!progress.suara);
              }}
            >
              {progress.suara ? "🔊 Suara: nyala" : "🔇 Suara: mati"}
            </button>
            <button className="btn btn-kecil" style={{ background: "var(--danger-soft)", color: "#fff" }} onClick={() => setKonfirmasi(true)}>
              Ulang progres
            </button>
          </div>
        </section>
      </div>

      {konfirmasi && (
        <Modal
          judul="Ulang semua progres?"
          onTutup={() => setKonfirmasi(false)}
          aksi={
            <>
              <button className="btn btn-ghost btn-kecil" style={{ background: "#e2e8f0", color: "#14204f", boxShadow: "0 6px 0 #94a3b8" }} onClick={() => setKonfirmasi(false)}>Batal</button>
              <button
                className="btn btn-kecil"
                style={{ background: "var(--danger-soft)", color: "#fff" }}
                onClick={() => {
                  resetProgress();
                  setKonfirmasi(false);
                  setToast("Progres sudah diulang");
                  setTimeout(() => setToast(null), 2000);
                }}
              >
                Ya, ulang
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: "#14204f" }}>Semua XP, bintang, dan badge akan hilang. Tindakan ini tidak bisa dibatalkan.</p>
        </Modal>
      )}
      <Toast pesan={toast} />
    </div>
  );
}
