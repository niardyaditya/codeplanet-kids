import urutan from "@/content/planets/urutan.json";
import loop from "@/content/planets/loop.json";
import logika from "@/content/planets/logika.json";

// Planet 4 sampai 6 ditampilkan sebagai "segera hadir" dan belum punya level.
const SEGERA = [
  {
    slug: "variabel",
    urutan: 4,
    judul: "Planet Variabel",
    tagline: "Segera hadir: simpan skor di dalam kotak angka.",
    warna: "#FACC15",
    art: "/art/planets-and-parts/planet-05-pixel-pink.svg",
    levels: [],
  },
  {
    slug: "fungsi",
    urutan: 5,
    judul: "Planet Fungsi",
    tagline: "Segera hadir: buat aksimu sendiri.",
    warna: "#60A5FA",
    art: "/art/planets-and-parts/planet-04-function-blue.svg",
    levels: [],
  },
  {
    slug: "ai",
    urutan: 6,
    judul: "Planet AI",
    tagline: "Segera hadir: kenalan lebih dekat dengan Bito.",
    warna: "#22D3EE",
    art: "/art/planets-and-parts/planet-06-robot-cyan.svg",
    levels: [],
  },
];

export const PLANET_AKTIF = [urutan, loop, logika];
export const PLANET_SEMUA = [...PLANET_AKTIF, ...SEGERA];

export function getPlanet(slug) {
  return PLANET_SEMUA.find((p) => p.slug === slug) || null;
}

export function getLevel(slug, levelId) {
  const planet = getPlanet(slug);
  if (!planet) return null;
  const index = planet.levels.findIndex((l) => l.id === levelId);
  if (index === -1) return null;
  return { planet, level: planet.levels[index], index };
}

export function semuaLevel() {
  return PLANET_AKTIF.flatMap((p) => p.levels.map((l) => ({ planet: p, level: l })));
}

export function levelBerikutnya(levelId) {
  const list = semuaLevel();
  const i = list.findIndex((x) => x.level.id === levelId);
  if (i === -1 || i === list.length - 1) return null;
  return list[i + 1];
}
