"use client";
import { useSyncExternalStore } from "react";
import { PLANET_AKTIF } from "@/lib/content";

export const KUNCI = "cp-kids-v1";
const EVENT = "cp-progress-change";

export const BADGE = {
  "starter-explorer": { nama: "Penjelajah Pemula", art: "/art/rewards/reward-05-badge-starter-explorer.svg", syarat: "Selesaikan 1 level" },
  "loop-master": { nama: "Master Loop", art: "/art/rewards/reward-06-badge-loop-master.svg", syarat: "Selesaikan semua level Planet Loop" },
  "bug-hunter": { nama: "Pemburu Bug", art: "/art/rewards/reward-07-badge-bug-hunter.svg", syarat: "Lulus level setelah salah dulu" },
  creator: { nama: "Pencipta", art: "/art/rewards/reward-08-badge-creator.svg", syarat: "Selesaikan semua planet aktif" },
};

export const DEFAULT = {
  versi: 1,
  nama: "",
  penjelajah: "explorer-boy",
  xp: 0,
  selesai: [],
  bintang: {},
  badge: [],
  suara: true,
};

const SERVER_SNAPSHOT = JSON.stringify(DEFAULT);
let cacheRaw = null;
let cacheValue = DEFAULT;

function bacaRaw() {
  try {
    return window.localStorage.getItem(KUNCI);
  } catch {
    return null;
  }
}

function parse(raw) {
  if (!raw) return DEFAULT;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return DEFAULT;
    return {
      ...DEFAULT,
      ...data,
      selesai: Array.isArray(data.selesai) ? data.selesai : [],
      badge: Array.isArray(data.badge) ? data.badge : [],
      bintang: data.bintang && typeof data.bintang === "object" ? data.bintang : {},
    };
  } catch {
    return DEFAULT;
  }
}

function getSnapshot() {
  const raw = bacaRaw();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheValue = parse(raw);
  }
  return cacheValue;
}

function getServerSnapshot() {
  return DEFAULT;
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function simpanProgress(next) {
  try {
    window.localStorage.setItem(KUNCI, JSON.stringify(next));
  } catch {
    // penyimpanan penuh atau diblokir: progres tetap jalan di sesi ini
  }
  window.dispatchEvent(new Event(EVENT));
}

function ubah(fn) {
  const sekarang = getSnapshot();
  simpanProgress(fn(sekarang));
}

export function setProfil({ nama, penjelajah }) {
  ubah((p) => ({ ...p, nama: nama.slice(0, 12), penjelajah }));
}

export function setSuara(on) {
  ubah((p) => ({ ...p, suara: on }));
}

export function selesaikanLevel({ levelId, rating, xp, pernahSalah }) {
  const pernah = getSnapshot().selesai.includes(levelId);
  ubah((p) => {
    const selesai = pernah ? p.selesai : [...p.selesai, levelId];
    const bintang = { ...p.bintang, [levelId]: Math.max(rating, p.bintang[levelId] || 0) };
    const badge = new Set(p.badge);
    if (selesai.length >= 1) badge.add("starter-explorer");
    if (pernahSalah && !pernah) badge.add("bug-hunter");
    const semuaLoop = PLANET_AKTIF[1].levels.every((l) => selesai.includes(l.id));
    if (semuaLoop) badge.add("loop-master");
    const semuaAktif = PLANET_AKTIF.flatMap((pl) => pl.levels).every((l) => selesai.includes(l.id));
    if (semuaAktif) badge.add("creator");
    return {
      ...p,
      selesai,
      bintang,
      badge: [...badge],
      xp: p.xp + (pernah ? 5 : xp),
    };
  });
}

export function resetProgress() {
  simpanProgress({ ...DEFAULT, suara: getSnapshot().suara });
}

export function levelDariXP(xp) {
  return Math.floor(xp / 100) + 1;
}

export function sudahSelesai(progress, levelId) {
  return progress.selesai.includes(levelId);
}

export function levelTerbuka(progress, planetIndex, levelIndex) {
  if (planetIndex === 0 && levelIndex === 0) return true;
  if (levelIndex > 0) {
    const sebelumnya = PLANET_AKTIF[planetIndex].levels[levelIndex - 1];
    return sudahSelesai(progress, sebelumnya.id);
  }
  // level pertama planet berikutnya: semua level planet sebelumnya harus selesai
  const sebelum = PLANET_AKTIF[planetIndex - 1];
  return sebelum.levels.every((l) => sudahSelesai(progress, l.id));
}

export function planetTerbuka(progress, planetIndex) {
  return levelTerbuka(progress, planetIndex, 0);
}

export function levelBerikutnyaBelumSelesai(progress) {
  for (let pi = 0; pi < PLANET_AKTIF.length; pi++) {
    for (let li = 0; li < PLANET_AKTIF[pi].levels.length; li++) {
      const level = PLANET_AKTIF[pi].levels[li];
      if (!sudahSelesai(progress, level.id) && levelTerbuka(progress, pi, li)) {
        return { planet: PLANET_AKTIF[pi], level };
      }
    }
  }
  return null;
}
