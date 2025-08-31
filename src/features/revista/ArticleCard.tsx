import React from "react";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  section: "editorial" | "posfacio" | "fala" | "bpm" | "achadinhos";
  readingTimeMin?: number;
  dateISO: string;
};

export default function ArticleCard({ a }: { a: Article }) {
  return (
    <article className="rounded-2xl overflow-hidden border bg-white hover:shadow-md transition">
      <a href={`/revista/${a.slug}`} className="block">
        <div className="aspect-video w-full bg-gray-100 overflow-hidden">
          <img src={a.coverUrl} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="p-4 grid gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full border capitalize">
              {a.section === "bpm" ? "ROLÊ.bpm" : a.section === "fala" ? "Fala, ROLÊ" : a.section}
            </span>
            {a.readingTimeMin ? <span>{a.readingTimeMin} min</span> : null}
            <time dateTime={a.dateISO}>{new Date(a.dateISO).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</time>
          </div>
          <h3 className="text-base font-semibold leading-tight line-clamp-2">{a.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
        </div>
      </a>
    </article>
  );
}