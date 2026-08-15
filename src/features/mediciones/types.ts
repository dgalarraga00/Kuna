/**
 * Los DecimalField de Django llegan como STRING por defecto en DRF
 * (COERCE_DECIMAL_TO_STRING viene en True). Por eso peso, talla y pliegues
 * se tipan como string y no como number.
 */
export interface Medicion {
  id: number;
  paciente: number;
  fecha: string;
  peso: string;
  talla: string;
  pliegue_1: string;
  pliegue_2: string;
  pliegue_3: string;
  actividad_fisica: NivelActividad;
  /**
   * Cálculos que viven como @property en el modelo.
   * Solo llegan si MedicionSerializer los declara como ReadOnlyField.
   */
  imc?: number | null;
  porcentaje_grasa?: number | null;
  geb?: number | null;
  gasto_total?: number | null;
}

export type NivelActividad = "1.2" | "1.375" | "1.55" | "1.725" | "1.9";

export type NuevaMedicion = Omit<
  Medicion,
  "id" | "imc" | "porcentaje_grasa" | "geb" | "gasto_total"
>;

/** Texto completo: para el select, donde el detalle ayuda a elegir. */
export const ETIQUETAS_ACTIVIDAD: Record<NivelActividad, string> = {
  "1.2": "Sedentario (sin ejercicio)",
  "1.375": "Ligero (ejercicio 1-3 días a la semana)",
  "1.55": "Moderado (ejercicio 3-5 días a la semana)",
  "1.725": "Muy activo (ejercicio 6-7 días a la semana)",
  "1.9": "Extremadamente activo (ejercicio intenso 2 veces al día)",
};

/**
 * El backend calcula el porcentaje de grasa con las ecuaciones de
 * Jackson-Pollock de 3 pliegues, y cada sexo usa un protocolo distinto:
 * los SITIOS del cuerpo donde se mide no son los mismos.
 *
 * Masculino: pecho, abdomen, muslo.
 * Femenino:  tríceps, suprailíaco, muslo.
 *
 * La suma que hace el modelo es la misma (pliegue_1 + 2 + 3), pero medir el
 * sitio equivocado da un resultado equivocado sin ningún error visible.
 */
export const PLIEGUES_POR_SEXO: Record<
  Sexo,
  readonly [string, string, string]
> = {
  M: ["Pecho", "Abdomen", "Muslo"],
  F: ["Tríceps", "Suprailíaco", "Muslo"],
  N: ["Pliegue 1", "Pliegue 2", "Pliegue 3"],
};

export type Sexo = "M" | "F" | "N";

/** Texto corto: para la tabla, donde el detalle rompe el ancho de la fila. */
export const ETIQUETAS_ACTIVIDAD_CORTAS: Record<NivelActividad, string> = {
  "1.2": "Sedentario",
  "1.375": "Ligero",
  "1.55": "Moderado",
  "1.725": "Muy activo",
  "1.9": "Extremo",
};
