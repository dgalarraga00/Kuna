/**
 * Los valores calculados (@property del modelo) pueden llegar como null,
 * o directamente no llegar si el serializer todavía no los expone.
 * En los tres casos la UI muestra un guión en vez de "undefined".
 */
export const mostrar = (
  valor: number | string | null | undefined,
  sufijo = "",
) => (valor === null || valor === undefined ? "—" : `${valor}${sufijo}`);
