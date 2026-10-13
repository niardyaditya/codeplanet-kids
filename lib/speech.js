// Membacakan materi dengan Web Speech API (gratis, bawaan browser).
export function bacakan(teks) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = "id-ID";
  u.rate = 0.9;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
  return true;
}

export function hentikanBacaan() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
