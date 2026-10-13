"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getLevel, levelBerikutnya, PLANET_AKTIF } from "@/lib/content";
import { jalankanProgram, alasanGagal, hitungXP, buatProgramId } from "@/lib/engine";
import { useProgress, selesaikanLevel, sudahSelesai, levelTerbuka } from "@/lib/progress";
import { bunyi } from "@/lib/audio";
import { bacakan, hentikanBacaan } from "@/lib/speech";
import { rayakan } from "@/lib/celebrate";
import Toast from "@/components/Toast";

const LABEL = { maju: "Maju", kiri: "Belok Kiri", kanan: "Belok Kanan", ambil: "Ambil", ulangi: "Ulangi", jika: "Jika" };
const IKON = { maju: "↑", kiri: "↺", kanan: "↻", ambil: "★", ulangi: "⟳", jika: "?" };
const KONDISI_LABEL = { rintangan: "ada batu di depan", bintang: "ada bintang di sini" };
const PILIHAN_ULANG = [2, 3, 4];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kunci = (x, y) => `${x},${y}`;

function posisiAwal(level) {
  if (!level) return { x: 0, y: 0, dir: 1 };
  return { ...level.grid.start };
}

export default function LessonClient({ slug, levelId }) {
  const found = getLevel(slug, levelId);
  const level = found?.level;
  const progress = useProgress();

  const [program, setProgram] = useState([]);
  const [pos, setPos] = useState(() => posisiAwal(level));
  const [kumpul, setKumpul] = useState([]);
  const [status, setStatus] = useState("siap");
  const [hasil, setHasil] = useState(null);
  const [pesanBito, setPesanBito] = useState("Susun blok perintahmu, lalu tekan Jalankan!");
  const [gagal, setGagal] = useState(0);
  const [petunjuk, setPetunjuk] = useState(0);
  const [toast, setToast] = useState(null);
  const [goyang, setGoyang] = useState(false);
  const aktif = useRef(false);

  useEffect(() => {
    aktif.current = true;
    return () => {
      aktif.current = false;
      hentikanBacaan();
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const ubahStatus = useCallback((s) => {
    if (aktif.current) setStatus(s);
  }, []);

  if (!level) return null;

  const planetIndex = PLANET_AKTIF.findIndex((p) => p.slug === slug);
  if (planetIndex === -1 || !levelTerbuka(progress, planetIndex, found.index)) {
    return (
      <section className="kartu" style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
        <img src="/art/characters/bito-ai-robot/bito-06-loading.svg" alt="" width={160} height={160} />
        <h1 style={{ color: "#14204f", fontSize: 28 }}>Level ini masih terkunci</h1>
        <p>Selesaikan level sebelumnya dulu, ya. Bito menunggumu di peta!</p>
        <Link className="btn btn-primary" href={`/planet/${found.planet.slug}`}>Kembali ke daftar level</Link>
      </section>
    );
  }

  const { w, h } = level.grid;
  const bintangSet = new Set(level.grid.bintang.map((b) => kunci(b.x, b.y)));
  const rintanganSet = new Set(level.grid.rintangan.map((b) => kunci(b.x, b.y)));
  const kumpulSet = new Set(kumpul);
  const sudahDulu = sudahSelesai(progress, level.id);
  const bintangTersimpan = progress.bintang[level.id] || 0;
  const berikutnya = levelBerikutnya(level.id);

  function tambahBlok(tipe) {
    if (status === "jalan") return;
    if (program.length >= level.maksBlok) {
      setToast(`Blok sudah penuh (maksimal ${level.maksBlok})`);
      bunyi("salah");
      return;
    }
    const blok = { id: buatProgramId(), tipe };
    if (tipe === "ulangi") blok.n = 2;
    if (tipe === "jika") blok.kondisi = (level.kondisi || ["rintangan"])[0];
    setProgram((p) => [...p, blok]);
    setStatus("siap");
    setHasil(null);
    bunyi("klik");
  }

  function hapusBlok(id) {
    if (status === "jalan") return;
    setProgram((p) => p.filter((b) => b.id !== id));
    setStatus("siap");
    setHasil(null);
    bunyi("klik");
  }

  function ubahBlok(id) {
    if (status === "jalan") return;
    setProgram((p) =>
      p.map((b) => {
        if (b.id !== id) return b;
        if (b.tipe === "ulangi") {
          const i = PILIHAN_ULANG.indexOf(b.n);
          return { ...b, n: PILIHAN_ULANG[(i + 1) % PILIHAN_ULANG.length] };
        }
        if (b.tipe === "jika" && (level.kondisi || []).length > 1) {
          const daftar = level.kondisi;
          const i = daftar.indexOf(b.kondisi);
          return { ...b, kondisi: daftar[(i + 1) % daftar.length] };
        }
        return b;
      })
    );
    setStatus("siap");
    bunyi("klik");
  }

  function kosongkan() {
    if (status === "jalan") return;
    setProgram([]);
    setStatus("siap");
    setHasil(null);
    setPos(posisiAwal(level));
    setKumpul([]);
    setPesanBito("Susun blok perintahmu, lalu tekan Jalankan!");
  }

  function ulangLevel() {
    if (status === "jalan") return;
    setPos(posisiAwal(level));
    setKumpul([]);
    setHasil(null);
    setStatus("siap");
    setPesanBito("Coba lagi! Ubah urutan blokmu.");
  }

  async function jalankan() {
    if (status === "jalan") return;
    if (program.length === 0) {
      setToast("Susun dulu blok perintahnya ya!");
      bunyi("salah");
      return;
    }

    const run = jalankanProgram(level, program);
    setHasil(null);
    setStatus("jalan");
    setPos(posisiAwal(level));
    setKumpul([]);
    setPesanBito("Byte Cat sedang berjalan...");

    let terkumpul = [];
    for (const ev of run.kejadian) {
      if (!aktif.current) return;
      await sleep(ev.tipe === "lewati" ? 180 : 340);
      if (!aktif.current) return;
      setPos({ x: ev.x, y: ev.y, dir: ev.dir });
      if (ev.tipe === "maju") bunyi("jalan");
      if (ev.tipe === "putar") bunyi("klik");
      if (ev.tipe === "ambil") {
        bunyi("ambil");
        terkumpul = [...terkumpul, kunci(ev.x, ev.y)];
        setKumpul(terkumpul);
      }
      if (ev.tipe === "tabrak" || ev.tipe === "kosong") {
        bunyi("salah");
        setGoyang(true);
        setTimeout(() => aktif.current && setGoyang(false), 340);
      }
    }

    await sleep(260);
    if (!aktif.current) return;

    if (run.berhasil) {
      const xp = hitungXP(level, run.rating, sudahDulu);
      selesaikanLevel({ levelId: level.id, rating: run.rating, xp, pernahSalah: gagal > 0 });
      setHasil(run);
      setPesanBito(pesanSukses(run.rating));
      ubahStatus("benar");
      bunyi("benar");
      rayakan();
    } else {
      setHasil(run);
      setPesanBito(alasanGagal(run) || "Coba lagi ya!");
      setGagal((g) => g + 1);
      ubahStatus("salah");
      bunyi("salah");
    }
  }

  function pesanSukses(rating) {
    if (rating === 3) return "Hebat sekali! Programmu singkat dan tepat.";
    if (rating === 2) return "Kerja bagus! Coba buat programmu lebih ringkas lagi untuk bintang tiga.";
    return "Berhasil! Sekarang coba susun dengan blok lebih sedikit.";
  }

  function mintaPetunjuk() {
    if (petunjuk < level.hint.length) {
      setPetunjuk((n) => n + 1);
      bunyi("klik");
    } else {
      setToast("Semua petunjuk sudah terbuka");
    }
  }

  function dengarkan() {
    const ok = bacakan(`${level.judul}. ${level.cerita} ${level.konsep}`);
    if (!ok) setToast("Browser ini belum bisa membacakan teks");
  }

  const cells = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = kunci(x, y);
      const rintangan = rintanganSet.has(k);
      const bintang = bintangSet.has(k) && !kumpulSet.has(k);
      cells.push(
        <div key={k} className={`sel${rintangan ? " sel-rintangan" : ""}`} aria-hidden="true">
          {bintang && <img src="/art/rewards/reward-03-xp-star.svg" alt="" className="bintang-kelap" />}
        </div>
      );
    }
  }

  const sedangJalan = status === "jalan";

  return (
    <div className="pelajaran">
      <section className="kartu cerita-kartu" aria-labelledby="judul-level">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img className="bito-kecil" src="/art/characters/bito-ai-robot/bito-02-teaching.svg" alt="Bito" width={96} height={96} />
          <div>
            <p className="caption" style={{ margin: 0 }}>{found.planet.judul}</p>
            <h2 id="judul-level" style={{ margin: 0 }}>{level.judul}</h2>
          </div>
        </div>
        <p>{level.cerita}</p>
        <div className="konsep" style={{ background: "rgba(37,99,235,.08)", borderRadius: 16, padding: "12px 14px" }}>
          <strong>Konsep: </strong>
          {level.konsep}
        </div>
        <div className="aksi-baris">
          <button className="btn btn-ghost btn-kecil" onClick={dengarkan}>🔊 Dengarkan</button>
          <button className="btn btn-secondary btn-kecil" onClick={mintaPetunjuk} disabled={sedangJalan}>
            💡 Petunjuk ({petunjuk}/{level.hint.length})
          </button>
        </div>
        <AnimatePresence initial={false}>
          {petunjuk > 0 && (
            <motion.ol
              className="hint-list"
              key="hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              aria-label="Petunjuk dari Bito"
            >
              {level.hint.slice(0, petunjuk).map((teks, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                  {teks}
                </motion.li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>
      </section>

      <section className="papan" aria-label="Papan permainan">
        <div className="kartu" style={{ padding: 14 }}>
          <div
            className="grid-wrap"
            style={{ aspectRatio: `${w} / ${h}` }}
            role="img"
            aria-label={`Grid ${w} kali ${h}. Robot ada di kolom ${pos.x + 1}, baris ${pos.y + 1}. Bintang tersisa ${level.grid.bintang.length - kumpul.length}.`}
          >
            <div className="grid-sel" style={{ gridTemplateColumns: `repeat(${w}, 1fr)`, gridTemplateRows: `repeat(${h}, 1fr)` }}>
              {cells}
            </div>
            <div
              className={`rover${goyang ? " goyang" : ""}`}
              style={{
                left: `calc(8px + (100% - 16px) * ${pos.x} / ${w})`,
                top: `calc(8px + (100% - 16px) * ${pos.y} / ${h})`,
                width: `calc((100% - 16px) / ${w})`,
                height: `calc((100% - 16px) / ${h})`,
              }}
            >
              <img
                src="/art/characters/byte-cat/byte-cat-04-walking.svg"
                alt=""
                style={{ transform: pos.dir === 3 ? "scaleX(-1)" : "none" }}
              />
            </div>
          </div>
        </div>

        <div className="kartu" style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 10px" }}>Blok perintah</h3>
          <div className="palet" role="group" aria-label="Pilih blok">
            {found.planet.blokTersedia.map((tipe) => (
              <button
                key={tipe}
                type="button"
                className="blok"
                data-tipe={tipe}
                onClick={() => tambahBlok(tipe)}
                disabled={sedangJalan}
                aria-label={`Tambah blok ${LABEL[tipe]}`}
              >
                <span aria-hidden="true">{IKON[tipe]}</span>
                {LABEL[tipe]}
              </button>
            ))}
          </div>
          <p className="caption" style={{ margin: "10px 0 6px" }}>
            Programmu ({program.length}/{level.maksBlok} blok). Ketuk angka Ulangi atau syarat Jika untuk mengubahnya.
          </p>
          <div className="program" aria-label="Program robot">
            {program.length === 0 && <span className="program-kosong">Ketuk blok di atas untuk menyusun perintah.</span>}
            <AnimatePresence initial={false}>
              {program.map((b, i) => {
                const isiDari = i > 0 && (program[i - 1].tipe === "ulangi" || program[i - 1].tipe === "jika");
                return (
                  <motion.div
                    key={b.id}
                    layout
                    className="blok-program"
                    style={{ marginLeft: isiDari ? 22 : 0 }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  >
                    <button
                      type="button"
                      className="blok"
                      data-tipe={b.tipe}
                      onClick={() => ubahBlok(b.id)}
                      disabled={sedangJalan}
                      aria-label={`Blok ${i + 1}: ${LABEL[b.tipe]}${b.tipe === "ulangi" ? ` ${b.n} kali` : ""}`}
                    >
                      {isiDari && <span aria-hidden="true">↳</span>}
                      {LABEL[b.tipe]}
                      {b.tipe === "ulangi" && <span className="angka-pill">{b.n}x</span>}
                      {b.tipe === "jika" && <span className="jika-kondisi">{KONDISI_LABEL[b.kondisi]}</span>}
                    </button>
                    <button
                      type="button"
                      className="blok-hapus"
                      onClick={() => hapusBlok(b.id)}
                      disabled={sedangJalan}
                      aria-label={`Hapus blok ${i + 1}`}
                    >
                      ×
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="aksi-baris" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={jalankan} disabled={sedangJalan || program.length === 0}>
              ▶ Jalankan
            </button>
            <button className="btn btn-secondary btn-kecil" onClick={ulangLevel} disabled={sedangJalan}>
              ↺ Ulang
            </button>
            <button className="btn btn-ghost btn-kecil" onClick={kosongkan} disabled={sedangJalan}>
              Kosongkan
            </button>
          </div>
        </div>

        <div className="gelembung bito" role="status" aria-live="polite" style={{ maxWidth: "100%" }}>
          <strong>Bito: </strong>
          {pesanBito}
        </div>

        {status === "benar" && hasil && (
          <motion.div className="hasil benar kartu" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bintang-skor" aria-label={`${hasil.rating} dari 3 bintang`}>
              {"★".repeat(hasil.rating)}
              {"☆".repeat(3 - hasil.rating)}
            </div>
            <p style={{ margin: 0, color: "#14204f", fontWeight: 700 }}>
              {sudahDulu ? "Level ini sudah pernah selesai." : `+${hitungXP(level, hasil.rating, sudahDulu)} XP`}
            </p>
            <div className="aksi-baris">
              {berikutnya ? (
                <Link className="btn btn-primary btn-kecil" href={`/planet/${berikutnya.planet.slug}/${berikutnya.level.id}`}>
                  Level berikutnya →
                </Link>
              ) : (
                <Link className="btn btn-primary btn-kecil" href="/sertifikat">
                  Lihat sertifikat
                </Link>
              )}
              <Link className="btn btn-ghost btn-kecil" href={`/planet/${found.planet.slug}`}>
                Daftar level
              </Link>
            </div>
          </motion.div>
        )}

        {status === "salah" && hasil && (
          <motion.div className="hasil salah kartu" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ margin: 0, color: "#14204f", fontWeight: 700 }}>
              Hampir! Coba ubah urutan blokmu. Kamu bisa minta petunjuk juga.
            </p>
          </motion.div>
        )}

        {bintangTersimpan > 0 && status === "siap" && (
          <p className="caption" style={{ textAlign: "center" }}>
            Bintang terbaikmu di level ini: {"★".repeat(bintangTersimpan)}
          </p>
        )}
      </section>

      <Toast pesan={toast} />
    </div>
  );
}
