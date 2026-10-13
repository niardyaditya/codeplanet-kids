# Docs Acuan AI Agent — CodePlanet Kids

> Draf awal. Tinjau, sesuaikan, dan pastikan tanggal pembuatan berada SETELAH 5 Okt 2026 09.30 WIB.
> Tanggal dokumen ini dibuat: ____ (isi sendiri)

## Tujuan
Membangun website edukasi coding untuk anak SD (kelas 1–6) dengan tema petualangan antariksa digital,
sesuai tema lomba "Innovating Education Through Technology", subtema "Web Education for Kids".

## Stack
Next.js 15 (App Router), React 19, framer-motion, canvas-confetti. Tanpa database.
Satu serverless route `/api/bito` untuk memanggil API LLM gratis (Groq).

## Fitur wajib
Peta planet, level belajar dengan editor blok, validasi quest di sisi klien, XP dan badge,
sertifikat PNG, tanya Bito, responsif mobile dan desktop.

## Aturan kerja untuk AI Agent
1. Semua teks antarmuka memakai Bahasa Indonesia sederhana, kalimat instruksi maksimal 12 kata.
2. Target sentuh minimal 48 px, kontras teks minimal 4,5 banding 1, setiap tombol ikon punya label.
3. Animasi hanya memakai transform dan opacity, dan wajib menghormati `prefers-reduced-motion`.
4. Jangan menulis kunci API di kode. Kunci hanya dibaca dari environment variable.
5. Penilaian quest dilakukan deterministik di klien. AI hanya dipakai untuk petunjuk Bito.
6. Bito tidak memberi jawaban langsung untuk quest, hanya satu petunjuk per balasan, dan menolak topik di luar coding.
7. Jangan menyimpan data pribadi anak. Hanya nama panggilan di `localStorage`.
8. Satu commit per fitur kecil, pesan commit berbentuk kata kerja, tanpa force push.
9. Setelah mengubah kode, jalankan `npm run build` dan pastikan tidak ada error.

## Struktur data
Materi: `content/planets/*.json`. Progres: `localStorage` kunci `cp-kids-v1`.
