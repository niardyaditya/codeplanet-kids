import json, re, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
erros = []
hasil = []

def cek(nama, kondisi, detail=""):
    hasil.append((nama, bool(kondisi)))
    print(("LULUS " if kondisi else "GAGAL ") + nama + ("" if kondisi or not detail else f" :: {detail}"), flush=True)

LAUNCH = dict(executable_path="/tmp/chromium", args=["--no-sandbox", "--single-process", "--no-zygote", "--disable-gpu"])

with sync_playwright() as p:
    browser = p.chromium.launch(**LAUNCH)
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    page.on("console", lambda m: erros.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: erros.append(f"pageerror: {e}"))

    page.goto(BASE + "/", wait_until="networkidle")
    cek("beranda tampil", page.get_by_role("heading", name=re.compile("Selamat datang")).is_visible())
    page.get_by_role("link", name="Mulai Misi").click()
    page.wait_for_url("**/pilih-penjelajah")
    page.fill("#nama", "Rafi")
    page.get_by_role("button", name="Mulai Petualangan").click()
    page.wait_for_url("**/peta")
    cek("masuk peta setelah isi nama", page.url.endswith("/peta"))
    page.get_by_role("link", name=re.compile("Planet Urutan")).click(force=True)
    page.wait_for_url("**/planet/urutan")
    cek("halaman planet urutan", page.get_by_role("heading", name="Planet Urutan").is_visible())

    page.get_by_role("link", name=re.compile("Langkah Pertama")).click()
    page.wait_for_url("**/planet/urutan/urutan-1")
    page.get_by_role("button", name="Tambah blok Maju").click()
    page.get_by_role("button", name="Tambah blok Maju").click()
    page.get_by_role("button", name="Tambah blok Ambil").click()
    page.get_by_role("button", name="Jalankan").click()
    page.get_by_text("Hebat sekali").wait_for(timeout=20000)
    cek("urutan-1 lulus 3 bintang", True)
    prog = json.loads(page.evaluate("localStorage.getItem('cp-kids-v1')"))
    cek("progres tersimpan selesai", "urutan-1" in prog["selesai"], str(prog["selesai"]))
    cek("XP bertambah", prog["xp"] > 0, str(prog["xp"]))
    cek("badge pemula didapat", "starter-explorer" in prog["badge"], str(prog["badge"]))

    page.get_by_role("link", name=re.compile("Level berikutnya")).click()
    page.wait_for_url("**/planet/urutan/urutan-2")
    page.get_by_role("button", name="Tambah blok Maju").click()
    page.get_by_role("button", name="Tambah blok Ambil").click()
    page.get_by_role("button", name="Jalankan").click()
    page.get_by_text("Hampir!").wait_for(timeout=20000)
    cek("gagal menampilkan respons Hampir", True)
    page.get_by_role("button", name=re.compile("Petunjuk")).click()
    cek("petunjuk terbuka", page.locator(".hint-list li").count() >= 1)
    page.get_by_role("button", name=re.compile("Ulang$")).click()
    cek("tombol Ulang mereset robot", page.get_by_role("status").filter(has_text="Coba lagi").count() > 0)
    page.screenshot(path="/tmp/shot-lesson-mobile.png", full_page=True)

    page.goto(BASE + "/planet/logika/logika-1", wait_until="networkidle")
    cek("level terkunci ditolak", page.get_by_text("masih terkunci").is_visible())

    page.goto(BASE + "/bito", wait_until="networkidle")
    page.get_by_role("button", name="Apa itu Ulangi?").click()
    page.get_by_text("Ulangi dipakai").wait_for(timeout=15000)
    cek("Bito menjawab topik materi", True)
    page.get_by_label("Tulis pertanyaanmu").fill("Siapa presiden Indonesia?")
    page.get_by_role("button", name="Kirim").click()
    page.get_by_text("Aku belum yakin").wait_for(timeout=15000)
    cek("Bito menolak topik di luar materi", True)

    page.goto(BASE + "/quest", wait_until="networkidle")
    page.wait_for_url("**/planet/urutan/urutan-2", timeout=10000)
    cek("quest mengarah ke level belum selesai", True)

    page.goto(BASE + "/pencapaian", wait_until="networkidle")
    cek("halaman badge tampil", page.get_by_role("heading", name="Pencapaian").is_visible())

    page.goto(BASE + "/sertifikat", wait_until="networkidle")
    cek("sertifikat terkunci di awal", page.get_by_text("belum terbuka").is_visible())
    semua = ["urutan-1","urutan-2","urutan-3","loop-1","loop-2","loop-3","logika-1","logika-2","logika-3"]
    page.evaluate("""(semua) => {
      const raw = localStorage.getItem('cp-kids-v1');
      const d = raw ? JSON.parse(raw) : {};
      d.nama = d.nama || 'Rafi'; d.selesai = semua; d.xp = 900; d.versi = 1; d.penjelajah = 'byte-cat';
      localStorage.setItem('cp-kids-v1', JSON.stringify(d));
    }""", semua)
    page.reload(wait_until="networkidle")
    page.get_by_role("button", name="Unduh PNG").wait_for(timeout=10000)
    cek("sertifikat terbuka setelah semua selesai", True)
    page.screenshot(path="/tmp/shot-sertifikat-mobile.png", full_page=True)

    page.goto(BASE + "/profil", wait_until="networkidle")
    page.get_by_role("button", name="Ulang progres").click()
    page.get_by_role("dialog").wait_for()
    page.get_by_role("button", name="Ya, ulang").click()
    page.wait_for_timeout(300)
    prog = json.loads(page.evaluate("localStorage.getItem('cp-kids-v1')"))
    cek("reset progres mengosongkan selesai", prog["selesai"] == [] and prog["xp"] == 0)
    browser.close()

    dbrowser = p.chromium.launch(**LAUNCH)
    dctx = dbrowser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
    d = dctx.new_page()
    d.on("pageerror", lambda e: erros.append(f"desktop pageerror: {e}"))
    d.goto(BASE + "/peta", wait_until="networkidle")
    cek("sidebar desktop tampil", d.locator(".sidebar").is_visible())
    cek("bottom nav tersembunyi di desktop", not d.locator(".bottomnav").is_visible())
    d.screenshot(path="/tmp/shot-peta-desktop.png")
    d.goto(BASE + "/planet/urutan/urutan-1", wait_until="networkidle")
    d.screenshot(path="/tmp/shot-lesson-desktop.png", full_page=True)
    dbrowser.close()

print("\n--- konsol & error ---", flush=True)
for e in erros: print(e, flush=True)
print("total error/warning konsol:", len(erros), flush=True)
gagal = [h for h in hasil if not h[1]]
print(f"Ringkasan: {len(hasil)-len(gagal)}/{len(hasil)} lulus", flush=True)
sys.exit(1 if gagal else 0)
