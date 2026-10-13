import { NextResponse } from "next/server";
import { bitoLokal } from "@/lib/bito-lokal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAKS_PESAN = 300;
const MAKS_RIWAYAT = 6;
const LIMIT_PER_MENIT = 10;
const TIMEOUT_MS = 8000;

const SYSTEM_PROMPT = [
  "Kamu adalah Bito, robot mentor coding untuk anak SD di CodePlanet Kids.",
  "Jawab hanya tentang coding, blok perintah (Maju, Belok Kiri, Belok Kanan, Ambil, Ulangi, Jika), dan materi CodePlanet Kids.",
  "Gunakan Bahasa Indonesia yang sederhana. Maksimal 3 kalimat.",
  "Jangan memberi jawaban langsung untuk quest. Beri satu petunjuk per balasan.",
  "Jika anak salah, puji usahanya dulu, lalu beri satu petunjuk.",
  "Jika pertanyaan di luar topik, arahkan kembali ke materi dengan ramah.",
  "Jangan meminta atau menyimpan data pribadi. Jika anak menyebut nama asli, alamat, atau sekolah, minta mereka jangan membagikannya dan kembali ke coding.",
].join("\n");

// Pembatas laju sederhana per IP, disimpan di memori server.
const catatan = new Map();

function boleh(ip) {
  const sekarang = Date.now();
  const riwayat = (catatan.get(ip) || []).filter((t) => sekarang - t < 60_000);
  if (riwayat.length >= LIMIT_PER_MENIT) {
    catatan.set(ip, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  catatan.set(ip, riwayat);
  return true;
}

function ambilIP(request) {
  const teruskan = request.headers.get("x-forwarded-for") || "";
  return teruskan.split(",")[0].trim() || "lokal";
}

function bersihkanRiwayat(riwayat) {
  if (!Array.isArray(riwayat)) return [];
  return riwayat
    .slice(-MAKS_RIWAYAT)
    .map((item) => ({
      role: item?.peran === "bito" ? "assistant" : "user",
      content: String(item?.isi ?? "").slice(0, MAKS_PESAN),
    }))
    .filter((item) => item.content.trim().length > 0);
}

async function tanyaGroq(pesan, riwayat) {
  const kunci = process.env.GROQ_API_KEY;
  if (!kunci) return null;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${kunci}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...bersihkanRiwayat(riwayat),
          { role: "user", content: pesan },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const teks = data?.choices?.[0]?.message?.content?.trim();
    return teks ? teks.slice(0, 600) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request) {
  let body = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const pesan = String(body?.pesan ?? "").trim().slice(0, MAKS_PESAN);
  if (!pesan) {
    return NextResponse.json({
      balasan: "Tulis pertanyaanmu dulu ya, nanti Bito bantu!",
      mode: "lokal",
    });
  }

  if (!boleh(ambilIP(request))) {
    return NextResponse.json({
      balasan: "Sebentar ya, Bito istirahat dulu. Coba tanya lagi sebentar lagi!",
      mode: "lokal",
    });
  }

  const dariAI = await tanyaGroq(pesan, body?.riwayat);
  if (dariAI) return NextResponse.json({ balasan: dariAI, mode: "ai" });

  return NextResponse.json({ balasan: bitoLokal(pesan), mode: "lokal" });
}
