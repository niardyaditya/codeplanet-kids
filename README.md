# CodePlanet Kids

Platform belajar coding berbasis blok untuk anak SD, bertema petualangan antariksa digital.
Anak menjelajah planet, menyusun blok perintah untuk menggerakkan robot, dan dibantu Bito, robot mentor AI.

## Fitur

- 3 planet aktif (Urutan, Loop, Logika), 9 level, penilaian 1–3 bintang
- Editor blok tap-to-add: Maju, Belok, Ambil, Ulangi, Jika
- XP, level, badge, dan sertifikat PNG yang bisa diunduh
- Bito AI (Groq, paket gratis) dengan batasan topik coding, serta mode lokal tanpa kunci
- Tombol Dengarkan (Web Speech API) dan efek suara (Web Audio), keduanya tanpa file audio
- Responsif mobile dan desktop, mendukung `prefers-reduced-motion`
- Progres tersimpan di `localStorage`, tanpa login dan tanpa database

## Menjalankan

```bash
npm install
cp .env.example .env.local   # opsional: isi GROQ_API_KEY
npm run dev                  # http://localhost:3000
npm run build && npm start   # versi produksi
```

## Deploy (Vercel)

1. Push repo ke GitHub (public).
2. Import repo di Vercel.
3. Tambahkan environment variable `GROQ_API_KEY` di pengaturan proyek (jangan di kode).
4. Deploy, lalu buka URL dari HP dan laptop.

## Struktur

```
app/            halaman dan route /api/bito
components/     Shell, LessonClient, PlanetClient, Modal, Toast
content/planets materi per planet (JSON)
lib/            engine blok, progres, audio, suara, Bito lokal
public/art      aset visual (logo, karakter, ikon, planet, background WebP)
docs/           docs acuan AI Agent dan jurnal prompt
```

## Privasi anak

Tidak ada chat antar pengguna, tidak ada tautan keluar, dan hanya nama panggilan yang disimpan di perangkat.
Pertanyaan ke Bito dibatasi 300 karakter dan hanya soal coding. Riwayat chat tidak disimpan di server.
Paket gratis penyedia AI mungkin memakai data untuk pelatihan, jadi anak diminta tidak menulis data pribadi.

## Lisensi font

Fredoka dan Nunito berlisensi SIL OFL 1.1.
