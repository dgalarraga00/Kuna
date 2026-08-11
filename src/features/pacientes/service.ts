import type { Paciente } from "./types";
/**
 * Hacemos la petición(fetch) al endpoint del backend para obtener los pacientes
 * 1. La petición se hace de forma asíncrona
 * 2. Hacemos la petición con await para que espere la respuesta
 */
export const obtenerPacientes = async (): Promise<Paciente[]> => {
  try {
    const respuesta = await fetch("http://127.0.0.1:8000/api/pacientes/");
    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.statusText} `);
    }
    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error("Hubo un problema al traer a los pacientes", error);
    throw error;
  }
};
