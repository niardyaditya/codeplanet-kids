import { notFound } from "next/navigation";
import PlanetClient from "@/components/PlanetClient";
import { getPlanet, PLANET_SEMUA } from "@/lib/content";

export function generateStaticParams() {
  return PLANET_SEMUA.map((p) => ({ slug: p.slug }));
}

export default async function PlanetPage({ params }) {
  const { slug } = await params;
  if (!getPlanet(slug)) notFound();
  return <PlanetClient slug={slug} />;
}
