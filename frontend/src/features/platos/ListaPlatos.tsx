import React, { useState, useEffect, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import type { NuevoPlato, Plato } from "./types";
import { obtenerPlatos, crearPlato, eliminarPlato } from "./service";
import { mostrar } from "../../utils/formato";

export default function ListaPlatos() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState<NuevoPlato>({
    nombre: "",
    preparacion: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setPlatos(await obtenerPlatos());
      } catch (error) {
        console.error("Fallo la carga de platos", error);
        setError("Hubo un error al cargar los platos");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNuevo((prevPlato) => ({ ...prevPlato, [name]: value }));
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const creado = await crearPlato(nuevo);
      setPlatos((prev) => [...prev, creado]);
      setNuevo({ nombre: "", preparacion: "" });
    } catch (error) {
      console.error("Error al crear el plato", error);
      setError(String(error));
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este plato?")) return;
    try {
      await eliminarPlato(id);
      setPlatos((prev) => prev.filter((plato) => plato.id !== id));
    } catch (error) {
      console.error("Fallo el borrado del plato", error);
      setError("No se pudo eliminar el plato");
    }
  };

  if (cargando) return <p className="loading">Cargando platos...</p>;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Recetario</span>
          <h2>Platos</h2>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <form className="card" onSubmit={manejarEnvio}>
        <div className="form-grid">
          <label className="field">
            <span>Nombre del plato</span>
            <input
              name="nombre"
              value={nuevo.nombre}
              onChange={manejarCambio}
              placeholder="Bowl de quinua con huevo"
              required
            />
          </label>
          <label className="field">
            <span>Preparación</span>
            <textarea
              name="preparacion"
              value={nuevo.preparacion}
              onChange={manejarCambio}
              placeholder="Cocina la quinua y sirve con huevo revuelto."
            />
          </label>
        </div>
        <div className="form-foot">
          <button type="submit" className="btn btn--primary">
            + Crear plato
          </button>
        </div>
      </form>

      {platos.length === 0 ? (
        <p className="empty">Todavía no hay platos cargados</p>
      ) : (
        <ul className="tiles">
          {platos.map((plato) => (
            <li key={plato.id} className="tile">
              <Link to={`/platos/${plato.id}`} className="tile__name">
                {plato.nombre}
              </Link>
              <span className="tile__meta">
                {mostrar(plato.macros?.calorias)} kcal ·{" "}
                {mostrar(plato.macros?.proteina)} g proteína
              </span>
              <div className="tile__foot">
                <Link
                  to={`/platos/${plato.id}`}
                  className="btn btn--ghost btn--sm"
                >
                  Ingredientes
                </Link>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => manejarEliminar(plato.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
