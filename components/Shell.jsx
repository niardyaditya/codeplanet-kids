"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { useProgress, levelDariXP } from "@/lib/progress";

const NAV = [
  { href: "/", label: "Beranda", ikon: "/art/icons/navigation/icon-nav-01-home.svg" },
  { href: "/peta", label: "Peta", ikon: "/art/icons/navigation/icon-nav-02-world-map.svg" },
  { href: "/quest", label: "Quest", ikon: "/art/icons/navigation/icon-nav-03-quest.svg" },
  { href: "/bito", label: "Bito", ikon: "/art/icons/navigation/icon-nav-04-ai-buddy.svg" },
  { href: "/pencapaian", label: "Badge", ikon: "/art/icons/navigation/icon-nav-05-achievement.svg" },
];

function latarUntuk(path) {
  if (path.startsWith("/peta")) return "/art/bg/bg-02-world-map.webp";
  if (path.startsWith("/pencapaian") || path.startsWith("/profil") || path.startsWith("/sertifikat"))
    return "/art/bg/bg-04-achievement-room.webp";
  if (path.startsWith("/planet") || path.startsWith("/bito") || path.startsWith("/pilih") || path.startsWith("/quest"))
    return "/art/bg/bg-03-learning-classroom.webp";
  return "/art/bg/bg-01-hero-galaxy.webp";
}

export default function Shell({ children }) {
  const path = usePathname() || "/";
  const progress = useProgress();
  const level = levelDariXP(progress.xp);
  const avatar =
    progress.penjelajah === "byte-cat"
      ? "/art/characters/byte-cat/byte-cat-01-idle.svg"
      : "/art/characters/explorer-boy/explorer-boy-01-standing.svg";
  const aktif = (href) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-layer" style={{ backgroundImage: `url(${latarUntuk(path)})` }} aria-hidden="true" />
      <div className="bg-shade" aria-hidden="true" />
      <div className="shell">
        <aside className="sidebar" aria-label="Navigasi utama">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${aktif(item.href) ? " aktif" : ""}`}
              aria-current={aktif(item.href) ? "page" : undefined}
            >
              <img src={item.ikon} alt="" width={40} height={40} />
              {item.label}
            </Link>
          ))}
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header className="topbar">
            <Link href="/" className="brand">
              <img src="/art/logo/logo-icon.svg" alt="" width={40} height={40} />
              <span>CodePlanet Kids</span>
            </Link>
            <div className="topbar-kanan">
              <span className="chip chip-kuning" aria-label={`Level ${level}, ${progress.xp} XP`}>
                Lv {level}<span className="xp-teks"> · {progress.xp} XP</span>
              </span>
              <Link href="/profil" className="avatar-btn" aria-label="Buka profil">
                <img src={avatar} alt="" />
              </Link>
            </div>
          </header>
          <main className="main">{children}</main>
        </div>

        <nav className="bottomnav" aria-label="Navigasi bawah">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${aktif(item.href) ? " aktif" : ""}`}
              aria-current={aktif(item.href) ? "page" : undefined}
            >
              <img src={item.ikon} alt="" width={30} height={30} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </MotionConfig>
  );
}
