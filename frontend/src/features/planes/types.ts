export type ObjetivoPlan = "0.8" | "1.0" | "1.2";

export interface Plan {
  id: number;
  medicion: number;
  objetivo_plan: ObjetivoPlan;
  calorias_objetivo: string | null;
  proteinas_objetivo: string;
  carbohidratos_objetivo: string | null;
  grasas_objetivo: string;
  cantidad_agua: string | null;
  observaciones: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  /**
   * @property del modelo: solo llegan si PlanSerializer las declara
   * como ReadOnlyField.
   */
  calorias_meta?: number | null;
  g_proteina?: number | null;
  g_grasa?: number | null;
  gramos_carbos?: number | null;
}

/**
 * En el POST solo mandamos medicion, objetivo y observaciones:
 * Plan.save() calcula y puebla los *_objetivo la primera vez que se guarda.
 */
export interface NuevoPlan {
  medicion: number;
  objetivo_plan: ObjetivoPlan;
  observaciones: string;
  cantidad_agua: string | null;
  activo: boolean;
}

export interface Comparacion {
  plan_id: number;
  objetivo: MacrosComparados;
  reales: MacrosComparados;
  faltantes: MacrosComparados;
}

export interface MacrosComparados {
  kcal: number | null;
  proteina: number | null;
  carbohidratos: number | null;
  grasas: number | null;
}

export type TipoComida = "DES" | "MM" | "ALM" | "MT" | "CEN";

export interface TiempoComida {
  id: number;
  plan: number;
  tipo: TipoComida;
  /** ManyToMany: DRF lo serializa como un array de ids. */
  platos: number[];
}

export const ETIQUETAS_OBJETIVO: Record<ObjetivoPlan, string> = {
  "0.8": "Perdida de peso",
  "1.0": "Mantenimiento",
  "1.2": "Ganancia muscular",
};

/**
 * El backend ya devuelve las comidas en orden cronológico
 * (TiempoComida.Meta.ordering con un Case/When).
 * Este array se usa para dibujar los cinco espacios del día, incluidos
 * los que todavía no existen como fila en la base.
 */
export const ORDEN_COMIDAS: TipoComida[] = ["DES", "MM", "ALM", "MT", "CEN"];

export const ETIQUETAS_COMIDA: Record<TipoComida, string> = {
  DES: "Desayuno",
  MM: "Media Mañana",
  ALM: "Almuerzo",
  MT: "Media Tarde",
  CEN: "Cena",
};
