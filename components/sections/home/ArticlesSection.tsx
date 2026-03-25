import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  image: string;
  imageAlt: string;
  href: string;
}

// Datos de ejemplo — reemplazar con llamada a la API
const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Cómo cuidar la piel de perros y gatos",
    excerpt:
      "El mantenimiento de la barrera cutánea es fundamental para prevenir alergias y dermatitis estacionales...",
    category: "Cuidado",
    readingTime: "5 min de lectura",
    date: "12 Oct 2024",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    imageAlt: "Profesional revisando la piel de un perro",
    href: "#",
  },
  {
    id: 2,
    title: "Beneficios del baño regular en casa",
    excerpt:
      "Mantener una higiene constante entre servicios profesionales ayuda a fortalecer el vínculo afectivo...",
    category: "Tips",
    readingTime: "4 min de lectura",
    date: "10 Oct 2024",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    imageAlt: "Perro feliz durante su baño",
    href: "#",
  },
  {
    id: 3,
    title: "Protección para el frío: Guía completa",
    excerpt:
      "No todas las razas necesitan abrigo, descubre cómo identificar si tu mascota requiere protección extra...",
    category: "Invierno",
    readingTime: "7 min de lectura",
    date: "05 Oct 2024",
    image:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800&q=80",
    imageAlt: "Cachorro con suéter de invierno",
    href: "#",
  },
];

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={article.href} className="group flex flex-col">
      {/* Imagen */}
      <div className="relative mb-6 aspect-4/3 overflow-hidden rounded-xl shadow-md">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Badge categoría */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-md">
            {article.category}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <h3
        className={cn(
          "mb-3 text-xl font-bold leading-snug",
          "text-foreground transition-colors group-hover:text-primary"
        )}
      >
        {article.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span>{article.readingTime}</span>
        <span className="size-1 rounded-full bg-border" />
        <span>{article.date}</span>
      </div>
    </Link>
  );
}

export function ArticlesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Consejos de Santuario
            </h2>
            <p className="text-muted-foreground">
              Aprende a cuidar el bienestar de tu mascota con nuestros expertos.
            </p>
          </div>

          <Link
            href="#"
            className="group flex shrink-0 items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3"
          >
            Ver todos los artículos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid de artículos */}
        <div className="grid gap-8 md:grid-cols-3">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
