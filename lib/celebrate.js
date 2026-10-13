// Confetti dimuat lazy, dan dilewati jika pengguna meminta gerak berkurang.
export async function rayakan() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  const warna = ["#FACC15", "#22D3EE", "#8B5CF6", "#22C55E", "#FDBA74", "#F472B6"];
  confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 }, colors: warna });
  setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: warna }), 220);
  setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: warna }), 420);
}
