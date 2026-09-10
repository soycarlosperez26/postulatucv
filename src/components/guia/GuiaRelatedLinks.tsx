import Link from "next/link";

interface GuideLink {
  href: string;
  title: string;
}

interface GuiaRelatedLinksProps {
  currentPath: string;
}

const ALL_GUIDES: GuideLink[] = [
  {
    href: "/guia/filtro-ats-computrabajo",
    title: "Filtro ATS en Computrabajo y Elempleo",
  },
  {
    href: "/guia/adaptar-hoja-de-vida-a-una-oferta",
    title: "Adaptar la hoja de vida a una oferta",
  },
  {
    href: "/guia/por-que-no-me-llaman",
    title: "Por qué no te llaman",
  },
  {
    href: "/guia/formato-ats-hoja-de-vida-colombia",
    title: "Formato ATS para hoja de vida en Colombia",
  },
  {
    href: "/guia/palabras-clave-ats-sin-inventar",
    title: "Palabras clave ATS sin inventar experiencia",
  },
  {
    href: "/guia/hoja-de-vida-computrabajo",
    title: "Hoja de vida para Computrabajo",
  },
  {
    href: "/guia/primera-oferta-gratis-como-probar-postula",
    title: "Cómo probar Postula gratis",
  },
];

export function GuiaRelatedLinks({ currentPath }: GuiaRelatedLinksProps) {
  const relatedGuides = ALL_GUIDES.filter(
    (guide) => guide.href !== currentPath
  ).slice(0, 4);

  if (relatedGuides.length === 0) return null;

  return (
    <div className="mt-16 border-t border-line-soft pt-10">
      <h2 className="text-xl font-bold text-ink">Sigue leyendo</h2>
      <ul className="mt-6 space-y-3">
        {relatedGuides.map((guide) => (
          <li key={guide.href}>
            <Link
              href={guide.href}
              className="text-lg text-brand hover:underline"
            >
              {guide.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
