export interface Plato {
  id: number;
  nombre: string;
  preparacion: string;
  /** Calculado por el backend en PlatoSerializer.get_macros(). */
  macros?: MacrosPlato;
}

export interface MacrosPlato {
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasa_total: number;
}

export type NuevoPlato = Omit<Plato, "id">;

export interface Componente {
  id: number;
  plato: number;
  ingrediente: number;
  gramaje: string;
}

export type NuevoComponente = Omit<Componente, "id">;

/** Valores nutricionales por cada 100 g, según la carga del backend. */
export interface Ingrediente {
  id: number;
  nombre: string;
  calorias: string;
  proteina: string;
  carbohidratos: string;
  grasa_total: string;
  fibra: string;
  azucares: string;
  grasa_saturada: string;
  grasas_trans: string;
  sodio: string;
  potasio: string;
  es_local: boolean;
}
