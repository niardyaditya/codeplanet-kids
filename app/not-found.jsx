import Link from "next/link";

export default function NotFound() {
  return (
    <section className="kartu" style={{ textAlign: "center", display: "grid", gap: 14, justifyItems: "center", marginTop: 24 }}>
      <img src="/art/characters/bito-ai-robot/bito-03-thinking.svg" alt="Bito sedang berpikir" width={180} height={180} />
      <h1 style={{ color: "#14204f", fontSize: 30 }}>Planet ini belum ditemukan</h1>
      <p>Bito tidak menemukan halaman itu. Kembali ke peta untuk melanjutkan petualangan!</p>
      <Link className="btn btn-primary" href="/peta">Ke peta planet</Link>
    </section>
  );
}
