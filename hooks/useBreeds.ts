"use client";

import { useReducer, useEffect } from "react";
import { catalogService } from "@/lib/api/catalog";
import type { Breed, PetSpecies } from "@/types/pets";

type State = { breeds: Breed[]; loading: boolean };
type Action = { type: "fetched"; breeds: Breed[] } | { type: "failed" };

function reducer(_: State, action: Action): State {
  if (action.type === "fetched")
    return { breeds: action.breeds, loading: false };
  return { breeds: [], loading: false };
}

/**
 * Hook que carga las razas del catálogo filtradas por especie.
 * Se re-ejecuta automáticamente cuando cambia la especie seleccionada.
 */
export function useBreeds(species: PetSpecies) {
  const [state, dispatch] = useReducer(reducer, { breeds: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    catalogService
      .listBreeds(species)
      .then((data) => {
        // Log de la data que llega
        console.log("Datos de razas recibidos:", data);

        const data_temp = data[0];
        const breeds = data_temp.breeds;

        if (!cancelled)
          dispatch({ type: "fetched", breeds: breeds as Breed[] });
      })
      .catch((error) => {
        console.error("Error al cargar las razas:", error);
        if (!cancelled) dispatch({ type: "failed" });
      });

    return () => {
      cancelled = true;
    };
  }, [species]);

  return state;
}
