/** Artículos del blog sugeridos según especie, etapa y perfil. */
import { getAllArticles, type Article } from "@/lib/blog";
import type { Pet } from "@/types/pets";
import type { LifeStage } from "./age";

export function suggestedArticles(pet: Pet, stage: LifeStage | null, limit = 3): Article[] {
  const isCat = pet.species === "cat";
  const species = isCat ? "gatos" : "perros";
  const wanted = new Map<string, number>([
    // Los gatos tienen menos artículos propios: pesan más para que salgan primero
    [species, isCat ? 4 : 2],
    ["baño", 1],
    ["pelaje", 1],
  ]);
  if (stage === "puppy") wanted.set("cachorros", 3);
  if (stage === "senior") wanted.set("senior", 3);
  if (pet.skin_sensitivity) wanted.set("piel", 6); // señal más fuerte del perfil
  if (!isCat && stage !== "puppy") wanted.set("dientes", 2);

  const speciesTags = (a: Article) => a.tags.filter((t) => t === "perros" || t === "gatos");

  return getAllArticles()
    .filter((a) => {
      // Un artículo etiquetado solo para la otra especie no se sugiere
      const tagged = speciesTags(a);
      return tagged.length === 0 || tagged.includes(species);
    })
    .map((a) => {
      const tagged = speciesTags(a);
      // Plus a los artículos solo de su especie (p. ej. "Conoce a tu gato")
      const exclusive = tagged.length === 1 && tagged[0] === species ? 2 : 0;
      return { a, score: a.tags.reduce((s, t) => s + (wanted.get(t) ?? 0), 0) + exclusive };
    })
    .filter(({ score }) => score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(({ a }) => a);
}
