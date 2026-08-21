import { apiFetch } from "../../api/client";
import type {
  Componente,
  Ingrediente,
  NuevoComponente,
  NuevoPlato,
  Plato,
} from "./types";

export const obtenerPlatos = () => apiFetch<Plato[]>("/platos/");

export const obtenerPlatoPorId = (id: number) =>
  apiFetch<Plato>(`/platos/${id}/`);

export const crearPlato = (plato: NuevoPlato) =>
  apiFetch<Plato>("/platos/", {
    method: "POST",
    body: JSON.stringify(plato),
  });

export const actualizarPlato = (id: number, plato: Partial<Plato>) =>
  apiFetch<Plato>(`/platos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(plato),
  });

export const eliminarPlato = (id: number) =>
  apiFetch<void>(`/platos/${id}/`, { method: "DELETE" });

/** Filtrado en el backend vía django-filter (filterset_fields = ["plato"]). */
export const obtenerComponentesDePlato = (platoId: number) =>
  apiFetch<Componente[]>(`/componentes/?plato=${platoId}`);

export const crearComponente = (componente: NuevoComponente) =>
  apiFetch<Componente>("/componentes/", {
    method: "POST",
    body: JSON.stringify(componente),
  });

export const eliminarComponente = (id: number) =>
  apiFetch<void>(`/componentes/${id}/`, { method: "DELETE" });

/**
 * Este endpoint NO es un ViewSet: es la vista buscar_ingredientes,
 * solo GET y filtrando por ?nombre= con icontains.
 */
export const buscarIngredientes = (nombre: string) =>
  apiFetch<Ingrediente[]>(`/ingredientes/?nombre=${encodeURIComponent(nombre)}`);
