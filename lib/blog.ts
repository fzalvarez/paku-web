/**
 * Blog: tipos, categorías y consultas sobre los artículos de `lib/data/articles.ts`.
 * Todo se resuelve en build (páginas estáticas), sin llamadas a la API.
 */
import { ARTICLES } from "@/lib/data/articles";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/** Bloques del cuerpo de un artículo. Los `h2` arman el índice y llevan ancla. */
export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "tip"; text: string };

export type CategorySlug = "cuidado" | "salud" | "comportamiento" | "temporadas";

export interface Article {
  slug: string;
  title: string;
  /** Bajada visible y meta description (idealmente ≤ 160 caracteres). */
  excerpt: string;
  category: CategorySlug;
  tags: string[];
  /** Fechas ISO (YYYY-MM-DD). */
  publishedAt: string;
  updatedAt?: string;
  author: string;
  image: string;
  imageAlt: string;
  /** Resumen práctico del costado. */
  takeaways: string[];
  blocks: ArticleBlock[];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  emoji: string;
  description: string;
}

// ── Categorías ────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  {
    slug: "cuidado",
    name: "Cuidado e higiene",
    emoji: "🛁",
    description: "Baño, pelaje, piel y rutinas para que tu mascota se vea y se sienta bien.",
  },
  {
    slug: "salud",
    name: "Salud",
    emoji: "🩺",
    description: "Señales que conviene vigilar y hábitos que previenen problemas.",
  },
  {
    slug: "comportamiento",
    name: "Comportamiento",
    emoji: "🐾",
    description: "Qué siente, qué necesita y qué te quiere decir tu perro o tu gato.",
  },
  {
    slug: "temporadas",
    name: "Temporadas",
    emoji: "🌦️",
    description: "Cuidados según el clima: frío, calor y humedad.",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// ── Consultas ─────────────────────────────────────────────────────────────────

/** Artículos del más reciente al más antiguo (empates: orden del archivo de datos). */
export function getAllArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: CategorySlug): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

/** Relacionados: misma categoría primero, luego los que comparten más etiquetas. */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const score = (a: Article) =>
    (a.category === article.category ? 10 : 0) + a.tags.filter((t) => article.tags.includes(t)).length;
  return getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a) => ({ a, s: score(a) }))
    .filter(({ s }) => s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map(({ a }) => a);
}

/** Categorías que tienen al menos un artículo, con su conteo. */
export function getCategoriesWithCount(): (Category & { count: number })[] {
  return CATEGORIES.map((c) => ({ ...c, count: ARTICLES.filter((a) => a.category === c.slug).length })).filter(
    (c) => c.count > 0,
  );
}

// ── Utilidades ────────────────────────────────────────────────────────────────

const WORDS_PER_MINUTE = 200;

export function readingMinutes(article: Article): number {
  const text = article.blocks
    .map((b) => (b.type === "ul" ? b.items.join(" ") : b.text))
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function readingTimeLabel(article: Article): string {
  return `${readingMinutes(article)} min de lectura`;
}

/** "8 oct. 2026" — fecha de negocio sin hora, se interpreta como fecha local. */
export function formatArticleDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

/** Ancla estable para un título: "¿Cada cuánto?" → "cada-cuanto". */
export function headingId(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Enlace al RSS para `metadata.alternates.types` (el `alternates` de una página reemplaza al del layout). */
export const RSS_ALTERNATE = {
  "application/rss+xml": [{ url: "/blog/rss.xml", title: "Paku — Tips y chismes caninos" }],
};

export function articleUrl(slug: string): string {
  return `/blog/${slug}`;
}

export function categoryUrl(slug: CategorySlug): string {
  return `/blog/categoria/${slug}`;
}
