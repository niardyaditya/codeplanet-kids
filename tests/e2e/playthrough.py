import json, re, sys
from playwright.sync_api import sync_playwright
BASE="http://localhost:3100"
LAUNCH=dict(executable_path="/tmp/chromium", args=["--no-sandbox","--single-process","--no-zygote","--disable-gpu"])
LABEL={"maju":"Maju","kiri":"Belok Kiri","kanan":"Belok Kanan","ambil":"Ambil","ulangi":"Ulangi","jika":"Jika"}
errs=[]; ok=0; total=0
with sync_playwright() as p:
    b=p.chromium.launch(**LAUNCH)
    ctx=b.new_context(viewport={"width":390,"height":844}, accept_downloads=True)
    pg=ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto(BASE+"/pilih-penjelajah", wait_until="networkidle")
    pg.fill("#nama","Rafi"); pg.get_by_role("button", name="Mulai Petualangan").click(); pg.wait_for_url("**/peta")
    for slug in ["urutan","loop","logika"]:
        planet=json.load(open(f"/home/claude/app/content/planets/{slug}.json"))
        for lv in planet["levels"]:
            total+=1
            pg.goto(f"{BASE}/planet/{slug}/{lv['id']}", wait_until="networkidle")
            for i,blok in enumerate(lv["solusi"]):
                pg.get_by_role("button", name=f"Tambah blok {LABEL[blok['tipe']]}").click()
                if blok["tipe"]=="ulangi":
                    for _ in range(4):
                        lab=pg.get_by_role("button", name=re.compile(rf"^Blok {i+1}: Ulangi")).get_attribute("aria-label")
                        if f"Ulangi {blok['n']} kali" in lab: break
                        pg.get_by_role("button", name=re.compile(rf"^Blok {i+1}: Ulangi")).click()
            pg.get_by_role("button", name=re.compile("Jalankan")).click()
            try:
                pg.get_by_text("Hebat sekali").wait_for(timeout=25000)
                ok+=1; print("LULUS", lv["id"], flush=True)
            except Exception as e:
                print("GAGAL", lv["id"], flush=True)
                pg.screenshot(path=f"/tmp/gagal-{lv['id']}.png")
    prog=json.loads(pg.evaluate("localStorage.getItem('cp-kids-v1')"))
    print("selesai:", len(prog["selesai"]), "xp:", prog["xp"], "badge:", prog["badge"])
    pg.goto(BASE+"/sertifikat", wait_until="networkidle")
    with pg.expect_download(timeout=15000) as dl:
        pg.get_by_role("button", name="Unduh PNG").click()
    d=dl.value; d.save_as("/tmp/sertifikat-test.png")
    print("unduhan:", d.suggested_filename)
    pg.screenshot(path="/tmp/v-sertifikat.png", full_page=True)
    b.close()
print(f"level lulus lewat UI: {ok}/{total}; error konsol: {len(errs)}")
for e in errs: print(" ", e)
sys.exit(0 if ok==total and not errs else 1)
