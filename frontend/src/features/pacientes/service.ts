import { apiFetch } from "../../api/client";
import type { NuevoPaciente, Paciente } from "./types";

export const obtenerPacientes = () => apiFetch<Paciente[]>("/pacientes/");

export const obtenerPacientePorId = (id: number) =>
  apiFetch<Paciente>(`/pacientes/${id}/`);

export const crearPaciente = (paciente: NuevoPaciente) =>
  apiFetch<Paciente>("/pacientes/", {
    method: "POST",
    body: JSON.stringify(paciente),
  });

export const actualizarPaciente = (id: number, paciente: Partial<Paciente>) =>
  apiFetch<Paciente>(`/pacientes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(paciente),
  });

export const eliminarPaciente = (id: number) =>
  apiFetch<void>(`/pacientes/${id}/`, { method: "DELETE" });
