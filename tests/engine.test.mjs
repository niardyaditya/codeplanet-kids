// Menguji bahwa solusi setiap level menyelesaikan quest dengan 3 bintang,
// dan bahwa kesalahan umum memang gagal. Jalankan: npm test
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jalankanProgram } from "../lib/engine.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "planets");
const muat = (f) => JSON.parse(fs.readFileSync(path.join(dir, `${f}.json`), "utf8"));
let gagal = 0;
const cek = (nama, kondisi) => {
  console.log(`${kondisi ? "LULUS" : "GAGAL"} ${nama}`);
  if (!kondisi) gagal++;
};

for (const slug of ["urutan", "loop", "logika"]) {
  for (const level of muat(slug).levels) {
    const program = level.solusi.map((b, i) => ({ id: `t${i}`, ...b }));
    const h = jalankanProgram(level, program);
    cek(`${level.id}: solusi berhasil dengan 3 bintang`, h.berhasil && h.rating === 3);
  }
}

const l1 = muat("logika").levels[0];
const tabrak = jalankanProgram(l1, [{ id: "a", tipe: "maju" }, { id: "b", tipe: "maju" }]);
cek("logika-1: tanpa Jika, robot menabrak batu", !tabrak.berhasil && tabrak.alasan === "tabrak");

const lp = muat("loop").levels[0];
const kurang = jalankanProgram(lp, [{ id: "a", tipe: "ulangi", n: 2 }, { id: "b", tipe: "maju" }, { id: "c", tipe: "ambil" }]);
cek("loop-1: Ulangi 2x tidak cukup untuk bintang 3 langkah", !kurang.berhasil);

const kosong = jalankanProgram(lp, []);
cek("program kosong tidak berhasil dan tidak error", !kosong.berhasil);

console.log(gagal === 0 ? "\nSemua tes lulus" : `\n${gagal} tes gagal`);
process.exit(gagal === 0 ? 0 : 1);
