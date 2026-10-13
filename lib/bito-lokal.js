// Jawaban cadangan Bito tanpa internet atau API key. Cocok untuk topik materi.
const ATURAN = [
  { kata: ["ulangi", "loop", "berkali"], jawab: "Ulangi dipakai kalau satu perintah perlu diulang. Ketuk angkanya untuk mengubah jumlah ulangan." },
  { kata: ["jika", "syarat", "kondisi"], jawab: "Jika mengecek syarat dulu. Kalau syaratnya benar, blok di bawahnya dijalankan." },
  { kata: ["batu", "tabrak", "rintangan"], jawab: "Kalau ada batu di depan, robot harus belok dulu. Coba blok Jika batu lalu Belok." },
  { kata: ["belok", "putar", "arah"], jawab: "Belok Kiri dan Belok Kanan mengubah arah robot. Robot selalu jalan ke arah yang sedang dihadapinya." },
  { kata: ["bintang", "ambil"], jawab: "Blok Ambil mengambil bintang di kotak tempat robot berdiri. Pastikan robot sudah sampai di atas bintang." },
  { kata: ["maju", "jalan", "langkah"], jawab: "Maju membuat robot jalan satu kotak sesuai arah yang dihadapinya." },
  { kata: ["coding", "kode", "program"], jawab: "Coding itu menyusun perintah satu per satu. Di CodePlanet Kids, setiap blok adalah satu perintah." },
];

export const BALASAN_DEFAULT =
  "Aku belum yakin pertanyaanmu. Coba tanya tentang Maju, Belok, Ambil, Ulangi, atau Jika ya!";

export function bitoLokal(pesan) {
  const teks = String(pesan || "").toLowerCase();
  for (const aturan of ATURAN) {
    if (aturan.kata.some((k) => teks.includes(k))) return aturan.jawab;
  }
  return BALASAN_DEFAULT;
}
