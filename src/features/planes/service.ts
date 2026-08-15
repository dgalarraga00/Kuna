import { apiFetch, urlAbsoluta } from "../../api/client";
import type {
  Comparacion,
  NuevoPlan,
  Plan,
  TiempoComida,
  TipoComida,
} from "./types";

export const obtenerPlanes = () => apiFetch<Plan[]>("/planes/");

export const obtenerPlanPorId = (id: number) => apiFetch<Plan>(`/planes/${id}/`);

/**
 * Atraviesa la relación Plan -> Medicion -> Paciente en una sola request,
 * gracias al lookup medicion__paciente de django-filter.
 */
export const obtenerPlanesDePaciente = (pacienteId: number) =>
  apiFetch<Plan[]>(`/planes/?medicion__paciente=${pacienteId}`);

export const crearPlan = (plan: NuevoPlan) =>
  apiFetch<Plan>("/planes/", {
    method: "POST",
    body: JSON.stringify(plan),
  });

export const eliminarPlan = (id: number) =>
  apiFetch<void>(`/planes/${id}/`, { method: "DELETE" });

export const compararPlan = (id: number) =>
  apiFetch<Comparacion>(`/planes/${id}/comparar/`);

/** El PDF es una descarga directa: se enlaza, no se hace fetch. */
export const urlPdfDelPlan = (id: number) => urlAbsoluta(`/planes/${id}/pdf/`);

export const obtenerComidasDelPlan = (planId: number) =>
  apiFetch<TiempoComida[]>(`/tiempos_comida/?plan=${planId}`);

/**
 * TiempoComida.platos es un M2M sin blank=True, así que DRF lo serializa con
 * allow_empty=False: la lista NUNCA puede ir vacía, ni al crear ni al editar.
 * Por eso el tiempo de comida se crea ya con su primer plato adentro.
 */
export const crearTiempoComida = (
  planId: number,
  tipo: TipoComida,
  platoIds: number[],
) =>
  apiFetch<TiempoComida>("/tiempos_comida/", {
    method: "POST",
    body: JSON.stringify({ plan: planId, tipo, platos: platoIds }),
  });

/**
 * Para un ManyToMany, DRF espera el array COMPLETO de ids: no existe
 * un "agregar uno". Por eso mandamos la lista entera ya modificada.
 */
export const actualizarPlatosDeComida = (
  comidaId: number,
  platoIds: number[],
) =>
  apiFetch<TiempoComida>(`/tiempos_comida/${comidaId}/`, {
    method: "PATCH",
    body: JSON.stringify({ platos: platoIds }),
  });

export const eliminarTiempoComida = (id: number) =>
  apiFetch<void>(`/tiempos_comida/${id}/`, { method: "DELETE" });
