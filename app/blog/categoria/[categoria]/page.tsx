import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/blog/BlogListing";
import { RSS_ALTERNATE, categoryUrl, getArticlesByCategory, getCategoriesWithCount, getCategory } from "@/lib/blog";

// Solo existen las categorías con artículos; cualquier otra da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategoriesWithCount().map((c) => ({ categoria: c.slug }));
}

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).categoria);
  if (!category) return {};
  const title = `${category.name} — Blog`;
  return {
    title,
    description: category.description,
    alternates: { canonical: categoryUrl(category.slug), types: RSS_ALTERNATE },
    openGraph: { title: `${category.name} — Blog de Paku`, description: category.description, url: categoryUrl(category.slug) },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const category = getCategory((await params).categoria);
  if (!category) notFound();

  return (
    <BlogListing
      articles={getArticlesByCategory(category.slug)}
      activeCategory={category.slug}
      eyebrow={`${category.emoji} El rincón perruno`}
      title={category.name}
      description={category.description}
    />
  );
}
