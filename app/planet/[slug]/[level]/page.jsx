import { notFound } from "next/navigation";
import LessonClient from "@/components/LessonClient";
import { getLevel, PLANET_AKTIF } from "@/lib/content";

export function generateStaticParams() {
  return PLANET_AKTIF.flatMap((p) => p.levels.map((l) => ({ slug: p.slug, level: l.id })));
}

export default async function LevelPage({ params }) {
  const { slug, level } = await params;
  if (!getLevel(slug, level)) notFound();
  return <LessonClient key={`${slug}-${level}`} slug={slug} levelId={level} />;
}
