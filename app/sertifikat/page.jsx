"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLANET_AKTIF } from "@/lib/content";
import { useProgress, sudahSelesai } from "@/lib/progress";
import { bunyi } from "@/lib/audio";

const LEBAR = 1600;
const TINGGI = 1131;

async function gambarSertifikat(canvas, nama) {
  const ctx = canvas.getContext("2d");
  try {
    await document.fonts.load('700 72px "Fredoka"');
    await document.fonts.load('500 36px "Nunito"');
  } catch {
    // font sistem dipakai jika gagal dimuat
  }
  ctx.clearRect(0, 0, LEBAR, TINGGI);
  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(0, 0, LEBAR, TINGGI);

  ctx.lineWidth = 16;
  ctx.strokeStyle = "#2563eb";
  ctx.strokeRect(36, 36, LEBAR - 72, TINGGI - 72);
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 16]);
  ctx.strokeStyle = "#facc15";
  ctx.strokeRect(78, 78, LEBAR - 156, TINGGI - 156);
  ctx.setLineDash([]);

  ctx.textAlign = "center";
  ctx.fillStyle = "#2563eb";
  ctx.font = '700 84px "Fredoka", sans-serif';
  ctx.fillText("SERTIFIKAT PENJELAJAH KODE", LEBAR / 2, 230);

  ctx.fillStyle = "#475a94";
  ctx.font = '500 38px "Nunito", sans-serif';
  ctx.fillText("CodePlanet Kids memberikan penghargaan kepada", LEBAR / 2, 320);

  ctx.fillStyle = "#8b5cf6";
  ctx.font = '700 110px "Fredoka", sans-serif';
  ctx.fillText(nama || "Penjelajah Muda", LEBAR / 2, 480);

  ctx.strokeStyle = "#14204f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(300, 520);
  ctx.lineTo(LEBAR - 300, 520);
  ctx.stroke();

  ctx.fillStyle = "#475a94";
  ctx.font = '500 38px "Nunito", sans-serif';
  ctx.fillText("atas keberhasilan menyelesaikan semua planet di CodePlanet Kids:", LEBAR / 2, 600);
  ctx.fillText("Planet Urutan, Planet Loop, dan Planet Logika", LEBAR / 2, 656);

  try {
    const img = new Image();
    img.src = "/art/rewards/reward-05-badge-starter-explorer.svg";
    await img.decode();
    ctx.drawImage(img, LEBAR / 2 - 110, 700, 220, 220);
  } catch {
    // medali opsional, sertifikat tetap valid
  }

  const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillStyle = "#14204f";
  ctx.font = '700 36px "Fredoka", sans-serif';
  ctx.fillText(tanggal, LEBAR - 400, 950);
  ctx.fillText("Bito AI Robot", 400, 950);
  ctx.font = '500 28px "Nunito", sans-serif';
  ctx.fillStyle = "#475a94";
  ctx.fillText("Tanggal", LEBAR - 400, 994);
  ctx.fillText("Mentor AI", 400, 994);
}

export default function Sertifikat() {
  const progress = useProgress();
  const canvasRef = useRef(null);
  const [siap, setSiap] = useState(false);
  const semuaLevel = PLANET_AKTIF.flatMap((p) => p.levels);
  const lengkap = semuaLevel.every((l) => sudahSelesai(progress, l.id));

  useEffect(() => setSiap(true), []);

  useEffect(() => {
    if (!siap || !lengkap || !canvasRef.current) return;
    gambarSertifikat(canvasRef.current, progress.nama);
  }, [siap, lengkap, progress.nama]);

  function unduh() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `sertifikat-codeplanet-kids-${(progress.nama || "penjelajah").replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    bunyi("benar");
  }

  if (!siap) return null;

  if (!lengkap) {
    return (
      <section className="kartu" style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
        <img src="/art/characters/bito-ai-robot/bito-06-loading.svg" alt="" width={160} height={160} />
        <h1 style={{ color: "#14204f", fontSize: 28 }}>Sertifikat belum terbuka</h1>
        <p>Selesaikan semua level di tiga planet aktif untuk membuka sertifikat.</p>
        <Link className="btn btn-primary" href="/peta">Lanjut ke peta</Link>
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <h1>Sertifikatmu sudah siap!</h1>
      <canvas
        ref={canvasRef}
        width={LEBAR}
        height={TINGGI}
        className="sertifikat-canvas"
        role="img"
        aria-label={`Sertifikat penjelajah kode atas nama ${progress.nama || "penjelajah"}`}
      />
      <div className="aksi-baris">
        <button className="btn btn-primary" onClick={unduh}>Unduh PNG</button>
        <Link className="btn btn-ghost btn-kecil" href="/profil">Kembali ke profil</Link>
      </div>
    </div>
  );
}
