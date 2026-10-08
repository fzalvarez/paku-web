"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { InlineAlert } from "@/components/account/InlineAlert";
import { ActivityCard } from "@/components/pets/panel/ActivityCard";
import { BathCard } from "@/components/pets/panel/BathCard";
import { HealthCard } from "@/components/pets/panel/HealthCard";
import { HistoryCard } from "@/components/pets/panel/HistoryCard";
import { NutritionCard } from "@/components/pets/panel/NutritionCard";
import { PanelHeader } from "@/components/pets/panel/PanelHeader";
import { ProfileCompletion } from "@/components/pets/panel/ProfileCompletion";
import { Readings } from "@/components/pets/panel/Readings";
import { WeightCard } from "@/components/pets/panel/WeightCard";
import { catalogService } from "@/lib/api/catalog";
import { ordersService } from "@/lib/api/orders";
import { petRecordsService } from "@/lib/api/pet-records";
import { petsService } from "@/lib/api/pets";
import { todayLima } from "@/lib/utils/dates";
import {
  activityInsight,
  bathInfo,
  breedReference,
  humanAge,
  lifeStage,
  missingFields,
  nutritionInsight,
  petAge,
  petOrders,
  preventiveChecklist,
  suggestedArticles,
  weightAssessment,
  weightSeries,
} from "@/lib/pet-insights";
import type { OrderOut } from "@/types/orders";
import type { PetRecordOut } from "@/types/pet-records";
import type { Breed, Pet } from "@/types/pets";

/** Raza de la mascota en el catálogo del backend (para su manto). */
async function loadBreed(pet: Pet): Promise<Breed | null> {
  if (!pet.breed_id) return null;
  const groups = await catalogService.listBreeds(pet.species === "cat" ? "cat" : "dog");
  return groups.flatMap((g) => g.breeds ?? []).find((b) => b.id === pet.breed_id) ?? null;
}

/**
 * Panel de la mascota (spec 0003). Sección adicional a la ficha: solo lee datos.
 * Las reglas están en lib/pet-insights; esta página carga datos y reparte.
 */
export default function PetPanelPage() {
  const { id: petId } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [breed, setBreed] = useState<Breed | null>(null);
  const [records, setRecords] = useState<PetRecordOut[]>([]);
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [partialError, setPartialError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let partial = false;
    // Registros, pedidos y raza son opcionales: si fallan, el panel se muestra con lo que haya
    const optional = <T,>(promise: Promise<T>, fallback: T) =>
      promise.catch(() => {
        partial = true;
        return fallback;
      });
    try {
      const [petData, recordsData, ordersData] = await Promise.all([
        petsService.detail(petId),
        optional(petRecordsService.list(petId, { limit: 200 }), [] as PetRecordOut[]),
        optional(ordersService.list(), [] as OrderOut[]),
      ]);
      const breedData = await optional(loadBreed(petData), null);
      setPet(petData);
      setBreed(breedData);
      setRecords(recordsData);
      setOrders(ordersData);
      setPartialError(partial);
    } catch {
      setError("No se pudo cargar la mascota.");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayLima();
  const insights = useMemo(() => {
    if (!pet) return null;
    const age = petAge(pet, today);
    const stage = age ? lifeStage(pet, age) : null;
    const weights = weightSeries(records);
    const currentKg = weights.at(-1)?.kg ?? pet.weight_kg ?? null;
    const weight = weightAssessment(pet, currentKg, stage);
    return {
      age,
      stage,
      human: age ? humanAge(pet, age) : null,
      breedRef: breedReference(pet.breed_id),
      weights,
      currentKg,
      weight,
      bath: bathInfo(pet, breed, orders, records, today),
      preventive: preventiveChecklist(pet, age, records, today),
      activity: activityInsight(pet),
      nutrition: nutritionInsight(pet, stage, weight),
      history: petOrders(orders, pet.id).slice(0, 4),
      readings: suggestedArticles(pet, stage),
      missing: missingFields(pet),
    };
  }, [pet, breed, records, orders, today]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !pet || !insights) {
    return <InlineAlert onRetry={load}>{error ?? "Mascota no encontrada."}</InlineAlert>;
  }

  const i = insights;
  const bookingHref = `/booking?pet=${pet.id}`;
  const fichaHref = `/account/pets/${pet.id}`;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account/pets" className="flex items-center gap-1.5 transition-colors hover:text-primary">
          <ArrowLeft className="size-3.5" />
          Mis mascotas
        </Link>
        <ChevronRight className="size-3" />
        <Link href={fichaHref} className="transition-colors hover:text-primary">{pet.name}</Link>
        <ChevronRight className="size-3" />
        <span className="font-semibold text-foreground">Panel</span>
      </nav>

      {partialError && <InlineAlert onRetry={load}>Parte de la información no se pudo cargar.</InlineAlert>}

      <PanelHeader
        pet={pet}
        age={i.age}
        stage={i.stage}
        human={i.human}
        breed={i.breedRef}
        bookingHref={bookingHref}
        fichaHref={fichaHref}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BathCard petName={pet.name} bath={i.bath} bookingHref={bookingHref} />
        <WeightCard points={i.weights} currentKg={i.currentKg} assessment={i.weight} fichaHref={fichaHref} />
        {i.activity.energy && <ActivityCard activity={i.activity} />}
        {i.nutrition && <NutritionCard nutrition={i.nutrition} />}
        <HealthCard items={i.preventive} />
        <HistoryCard orders={i.history} />
      </div>

      <ProfileCompletion petName={pet.name} missing={i.missing} fichaHref={fichaHref} />
      <Readings petName={pet.name} articles={i.readings} />

      <p className="text-xs text-muted-foreground">
        Los valores del panel son estimados y orientativos, basados en promedios de su raza y etapa; no reemplazan la
        consulta con tu veterinario.
      </p>
    </div>
  );
}
