"use client";

import { useReducer, useEffect } from "react";
import { catalogService } from "@/lib/api/catalog";
import type { Breed, PetSpecies } from "@/types/pets";

type State = { breeds: Breed[]; loading: boolean };
type Action =
  | { type: "fetched"; breeds: Breed[] }
  | { type: "failed" };

function reducer(_: State, action: Action): State {
  if (action.type === "fetched") return { breeds: action.breeds, loading: false };
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
        if (!cancelled) dispatch({ type: "fetched", breeds: data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "failed" });
      });

    return () => {
      cancelled = true;
    };
  }, [species]);

  return state;
}

