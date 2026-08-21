import { apiFetch } from "../../api/client";
import type { Medicion, NuevaMedicion } from "./types";

export const obtenerMediciones = () => apiFetch<Medicion[]>("/mediciones/");

export const obtenerMedicionPorId = (id: number) =>
  apiFetch<Medicion>(`/mediciones/${id}/`);

/** Filtrado en el backend vía django-filter (filterset_fields = ["paciente"]). */
export const obtenerMedicionesDePaciente = (pacienteId: number) =>
  apiFetch<Medicion[]>(`/mediciones/?paciente=${pacienteId}`);

export const crearMedicion = (medicion: NuevaMedicion) =>
  apiFetch<Medicion>("/mediciones/", {
    method: "POST",
    body: JSON.stringify(medicion),
  });

export const eliminarMedicion = (id: number) =>
  apiFetch<void>(`/mediciones/${id}/`, { method: "DELETE" });
