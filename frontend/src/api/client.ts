const BASE_URL = "http://127.0.0.1:8000/api";

/**
 * DRF describe sus errores de tres formas distintas y todas terminan en la
 * misma pantalla, así que las normalizamos a una sola frase legible:
 *   {"detail": "..."}                     -> excepciones (404, 409, permisos)
 *   {"campo": ["error 1", "error 2"]}     -> validación de serializer
 *   HTML                                  -> un 500 con stacktrace
 */
const mensajeDeError = async (respuesta: Response): Promise<string> => {
  const crudo = await respuesta.text();

  try {
    const cuerpo = JSON.parse(crudo);

    if (typeof cuerpo?.detail === "string") {
      return cuerpo.detail;
    }
    if (cuerpo && typeof cuerpo === "object") {
      return Object.entries(cuerpo)
        .map(([campo, errores]) => {
          const texto = Array.isArray(errores) ? errores.join(" ") : errores;
          return campo === "non_field_errors" ? texto : `${campo}: ${texto}`;
        })
        .join(" · ");
    }
  } catch {
    /**
     * Un 500 de Django devuelve la página de debug en HTML. Mostrarla entera
     * no le sirve a nadie, así que dejamos un mensaje corto: el detalle real
     * está en la consola del servidor.
     */
    if (respuesta.status >= 500) {
      return `El servidor falló (${respuesta.status}). Revisá la consola de Django.`;
    }
  }

  return `Error ${respuesta.status}: ${respuesta.statusText}`;
};

/**
 * Envoltorio único sobre fetch para toda la API.
 *
 * Concentra acá lo que antes se repetía en cada función del service:
 * armado de URL, cabecera JSON, chequeo de respuesta.ok y parseo.
 *
 * Recordar que fetch SOLO rechaza ante un fallo de red: un 400 o un 500
 * son respuestas válidas para fetch, por eso el chequeo de `ok` es a mano.
 */
export const apiFetch = async <T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> => {
  const { body, headers, ...resto } = opciones;
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...resto,
    body,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  if (!respuesta.ok) {
    throw new Error(await mensajeDeError(respuesta));
  }

  // DELETE responde 204 No Content: no hay cuerpo que parsear.
  if (respuesta.status === 204) {
    return undefined as T;
  }
  return respuesta.json();
};

/** URL absoluta, para links directos al backend (por ejemplo, la descarga del PDF). */
export const urlAbsoluta = (ruta: string) => `${BASE_URL}${ruta}`;
