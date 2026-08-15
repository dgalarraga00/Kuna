import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Componente, Ingrediente, Plato } from "./types";
import {
  obtenerPlatoPorId,
  obtenerComponentesDePlato,
  crearComponente,
  eliminarComponente,
  buscarIngredientes,
} from "./service";
import { mostrar } from "../../utils/formato";

/**
 * Desglose por ingrediente, solo para lectura de la tabla: el backend
 * expone el total del plato pero no el aporte de cada componente.
 * El TOTAL autoritativo viene de plato.macros, nunca de esta suma.
 */
const aporte = (valorPor100g: string, gramaje: string) =>
  (Number(valorPor100g) / 100) * Number(gramaje);

const MACROS = [
  { clave: "calorias", etiqueta: "Kcal" },
  { clave: "proteina", etiqueta: "Proteína" },
  { clave: "carbohidratos", etiqueta: "Carbohidratos" },
  { clave: "grasa_total", etiqueta: "Grasas" },
] as const;

export default function DetallePlato() {
  const { id } = useParams();
  const platoId = Number(id);

  const [plato, setPlato] = useState<Plato | null>(null);
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [resultados, setResultados] = useState<Ingrediente[]>([]);
  const [seleccionado, setSeleccionado] = useState<Ingrediente | null>(null);
  const [gramaje, setGramaje] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!platoId) return;
    const cargarDatos = async () => {
      setCargando(true);
      try {
        setPlato(await obtenerPlatoPorId(platoId));
        setComponentes(await obtenerComponentesDePlato(platoId));
        /**
         * El catálogo completo se trae una vez para poder resolver el nombre
         * de cada ingrediente de los componentes por su id.
         */
        setIngredientes(await buscarIngredientes(""));
        setError(null);
      } catch (error) {
        console.error("Fallo la carga del plato", error);
        setError("Hubo un error al cargar el plato");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [platoId]);

  const ingredienteDe = (ingredienteId: number) =>
    ingredientes.find((ingrediente) => ingrediente.id === ingredienteId);

  /** Vuelve a pedir el plato para que macros lo recalcule el backend. */
  const refrescarMacros = async () => {
    try {
      setPlato(await obtenerPlatoPorId(platoId));
    } catch (error) {
      console.error("No se pudo refrescar los macros", error);
    }
  };

  const manejarBuscar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setResultados(await buscarIngredientes(busqueda));
    } catch (error) {
      console.error("Fallo la búsqueda", error);
      setError("No se pudo buscar ingredientes");
    }
  };

  const manejarAgregar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!seleccionado || !gramaje) return;
    try {
      const creado = await crearComponente({
        plato: platoId,
        ingrediente: seleccionado.id,
        gramaje,
      });
      setComponentes((prev) => [...prev, creado]);
      setSeleccionado(null);
      setGramaje("");
      setResultados([]);
      setBusqueda("");
      await refrescarMacros();
    } catch (error) {
      console.error("Error al agregar el componente", error);
      setError(String(error));
    }
  };

  const manejarQuitar = async (componenteId: number) => {
    try {
      await eliminarComponente(componenteId);
      setComponentes((prev) =>
        prev.filter((componente) => componente.id !== componenteId),
      );
      await refrescarMacros();
    } catch (error) {
      console.error("Error al quitar el componente", error);
      setError("No se pudo quitar el ingrediente");
    }
  };

  if (cargando) return <p className="loading">Cargando plato...</p>;
  if (error && !plato)
    return (
      <div className="page">
        <p className="alert">{error}</p>
      </div>
    );
  if (!plato)
    return (
      <div className="page">
        <p className="empty">Plato no encontrado</p>
      </div>
    );

  return (
    <div className="page">
      <Link to="/platos" className="back-link">
        ← Volver a platos
      </Link>

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Plato</span>
          <h2>{plato.nombre}</h2>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {plato.preparacion && <p className="card">{plato.preparacion}</p>}

      <div className="stat-grid">
        {MACROS.map((macro) => (
          <div className="stat" key={macro.clave}>
            <span className="stat__label">{macro.etiqueta}</span>
            <span className="stat__value">
              {mostrar(plato.macros?.[macro.clave])}
              <span className="stat__unit">
                {macro.clave === "calorias" ? "kcal" : "g"}
              </span>
            </span>
          </div>
        ))}
      </div>

      <section>
        <div className="section-head">
          <h3>Ingredientes</h3>
        </div>
        {componentes.length === 0 ? (
          <p className="empty">Este plato todavía no tiene ingredientes</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Gramaje</th>
                  {MACROS.map((macro) => (
                    <th key={macro.clave}>{macro.etiqueta}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {componentes.map((componente) => {
                  const ingrediente = ingredienteDe(componente.ingrediente);
                  return (
                    <tr key={componente.id}>
                      <td>
                        {ingrediente?.nombre ??
                          `Ingrediente #${componente.ingrediente}`}
                      </td>
                      <td>{componente.gramaje} g</td>
                      {MACROS.map((macro) => (
                        <td key={macro.clave}>
                          {ingrediente
                            ? aporte(
                                ingrediente[macro.clave],
                                componente.gramaje,
                              ).toFixed(2)
                            : "—"}
                        </td>
                      ))}
                      <td>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => manejarQuitar(componente.id)}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={2}>
                    Total del plato
                  </th>
                  {MACROS.map((macro) => (
                    <td key={macro.clave}>
                      {mostrar(plato.macros?.[macro.clave])}
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h3>Agregar ingrediente</h3>
        </div>
        <div className="card">
          <form className="inline-form" onSubmit={manejarBuscar}>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en el catálogo..."
            />
            <button type="submit" className="btn">
              Buscar
            </button>
          </form>

          {resultados.length > 0 && (
            <ul className="results">
              {resultados.map((ingrediente) => (
                <li key={ingrediente.id} className="result">
                  <span className="result__name">{ingrediente.nombre}</span>
                  <span className="result__kcal">
                    {ingrediente.calorias} kcal/100g
                  </span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setSeleccionado(ingrediente)}
                  >
                    Elegir
                  </button>
                </li>
              ))}
            </ul>
          )}

          {seleccionado && (
            <form className="picked" onSubmit={manejarAgregar}>
              <span className="picked__name">{seleccionado.nombre}</span>
              <label className="field">
                <span>Gramaje (g)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={gramaje}
                  onChange={(e) => setGramaje(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <button type="submit" className="btn btn--primary">
                Agregar al plato
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
