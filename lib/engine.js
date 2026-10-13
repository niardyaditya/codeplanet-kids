// Mesin program blok: murni (tanpa React) supaya mudah diuji.
// Arah: 0 atas, 1 kanan, 2 bawah, 3 kiri. Belok kanan = +1, belok kiri = -1.
export const DIRS = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

export const MAX_LANGKAH = 80;
const KONTROL = new Set(["ulangi", "jika"]);
const kunci = (x, y) => `${x},${y}`;

export function buatProgramId() {
  return Math.random().toString(36).slice(2, 10);
}

// Menjalankan program pada level. Mengembalikan jejak kejadian untuk animasi
// dan hasil akhir (berhasil, jumlah bintang, alasan gagal).
export function jalankanProgram(level, program) {
  const g = level.grid;
  const bintang = new Set(g.bintang.map((b) => kunci(b.x, b.y)));
  const rintangan = new Set(g.rintangan.map((b) => kunci(b.x, b.y)));
  const terkumpul = new Set();
  const kejadian = [];
  let x = g.start.x;
  let y = g.start.y;
  let dir = g.start.dir;
  let langkah = 0;
  let salah = 0;
  let alasan = null;

  const dalamArea = (nx, ny) => nx >= 0 && ny >= 0 && nx < g.w && ny < g.h;
  const adaHalangan = (nx, ny) => !dalamArea(nx, ny) || rintangan.has(kunci(nx, ny));
  const catat = (tipe, extra = {}) =>
    kejadian.push({ tipe, x, y, dir, ...extra });

  function eksekusi(blok) {
    if (!blok || KONTROL.has(blok.tipe)) {
      catat("lewati");
      return;
    }
    const { dx, dy } = DIRS[dir];
    switch (blok.tipe) {
      case "maju": {
        const nx = x + dx;
        const ny = y + dy;
        if (adaHalangan(nx, ny)) {
          salah++;
          alasan = "tabrak";
          catat("tabrak");
        } else {
          x = nx;
          y = ny;
          catat("maju");
        }
        return;
      }
      case "kiri":
        dir = (dir + 3) % 4;
        catat("putar");
        return;
      case "kanan":
        dir = (dir + 1) % 4;
        catat("putar");
        return;
      case "ambil": {
        const k = kunci(x, y);
        if (bintang.has(k) && !terkumpul.has(k)) {
          terkumpul.add(k);
          catat("ambil");
        } else {
          salah++;
          catat("kosong");
        }
        return;
      }
      default:
        catat("lewati");
    }
  }

  function syaratTerpenuhi(kondisi) {
    const { dx, dy } = DIRS[dir];
    if (kondisi === "rintangan") return adaHalangan(x + dx, y + dy);
    if (kondisi === "bintang") {
      const k = kunci(x, y);
      return bintang.has(k) && !terkumpul.has(k);
    }
    return false;
  }

  for (let i = 0; i < program.length; i++) {
    if (langkah >= MAX_LANGKAH) {
      alasan = alasan || "kehabisan";
      break;
    }
    langkah++;
    const blok = program[i];

    if (blok.tipe === "ulangi") {
      const isi = program[i + 1];
      const n = Math.max(1, Math.min(4, Number(blok.n) || 2));
      for (let r = 0; r < n; r++) {
        eksekusi(isi);
        langkah++;
        if (langkah >= MAX_LANGKAH) break;
      }
      i++;
      continue;
    }

    if (blok.tipe === "jika") {
      const isi = program[i + 1];
      if (syaratTerpenuhi(blok.kondisi)) {
        eksekusi(isi);
      } else {
        catat("lewati");
      }
      i++;
      continue;
    }

    eksekusi(blok);
  }

  const total = level.grid.bintang.length;
  const sudahSemua = terkumpul.size === total;
  if (!sudahSemua && !alasan) alasan = "belum-bintang";

  let bintangRating = 1;
  if (program.length <= level.par) bintangRating = 3;
  else if (program.length <= level.par + 2) bintangRating = 2;

  return {
    berhasil: sudahSemua,
    kejadian,
    terkumpul: terkumpul.size,
    total,
    salah,
    alasan: sudahSemua ? null : alasan,
    rating: sudahSemua ? bintangRating : 0,
    akhir: { x, y, dir },
  };
}

// Menghitung hint alasan gagal dalam bahasa anak.
export function alasanGagal(hasil) {
  if (hasil.berhasil) return null;
  if (hasil.alasan === "tabrak") return "Robot menabrak batu atau tepi area. Coba cek arahnya dulu!";
  if (hasil.alasan === "kehabisan") return "Programmu terlalu panjang. Coba lebih ringkas.";
  return `Bintang belum semua terambil (${hasil.terkumpul} dari ${hasil.total}). Coba jalan ke bintangnya lalu gunakan Ambil.`;
}

export function hitungXP(level, rating, sudahPernahSelesai) {
  if (sudahPernahSelesai) return 5;
  return level.xp + rating * 10;
}
