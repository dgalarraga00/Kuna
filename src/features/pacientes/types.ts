/**
 * Es la representacion del modelo de django
 */
export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  created_at: string;
  updated_at: string;
  restricciones_alimentarias: string;
  alergias_alimentarias: string;
  enfermedades_existentes: string;
  medicamentos_actuales: string;
  observaciones: string;
  sexo: "M" | "F" | "N";
  fecha_nacimiento: string;
}

export type NuevoPaciente = Omit<Paciente, "id" | "created_at" | "updated_at">;
