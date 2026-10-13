import "./globals.css";
import Shell from "@/components/Shell";

export const metadata = {
  title: "CodePlanet Kids — Petualangan Coding untuk Anak SD",
  description: "Belajar coding sambil menjelajah planet digital bersama Bito, Byte Cat, dan Explorer Boy.",
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
