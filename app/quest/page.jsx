"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProgress, levelBerikutnyaBelumSelesai } from "@/lib/progress";

export default function Quest() {
  const router = useRouter();
  const progress = useProgress();
  const [siap, setSiap] = useState(false);
  const berikut = levelBerikutnyaBelumSelesai(progress);

  useEffect(() => setSiap(true), []);

  useEffect(() => {
    if (siap && berikut) {
      router.replace(`/planet/${berikut.planet.slug}/${berikut.level.id}`);
    }
  }, [siap, berikut, router]);

  if (!siap) return null;
  if (berikut) {
    return <p className="caption">Membuka quest berikutnya...</p>;
  }
  return (
    <section className="kartu" style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
      <img src="/art/characters/bito-ai-robot/bito-04-celebration.svg" alt="" width={180} height={180} />
      <h1 style={{ color: "#14204f", fontSize: 30 }}>Semua quest selesai!</h1>
      <p>Kamu sudah menyelesaikan semua planet yang tersedia. Ambil sertifikatmu sekarang.</p>
      <Link className="btn btn-primary" href="/sertifikat">Lihat sertifikat</Link>
    </section>
  );
}
