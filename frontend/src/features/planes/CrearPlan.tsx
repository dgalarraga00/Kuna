import React, { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { NuevoPlan, ObjetivoPlan } from "./types";
import { ETIQUETAS_OBJETIVO } from "./types";
import { crearPlan } from "./service";
import type { Medicion } from "../mediciones/types";
import { obtenerMedicionPorId } from "../mediciones/service";
import { mostrar } from "../../utils/formato";

export default function CrearPlan() {
  const { medicionId } = useParams();
  const navigate = useNavigate();
  const [medicion, setMedicion] = useState<Medicion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<NuevoPlan>({
    medicion: Number(medicionId),
    objetivo_plan: "1.0",
    observaciones: "",
    cantidad_agua: "",
    activo: true,
  });

  useEffect(() => {
    if (!medicionId) return;
    obtenerMedicionPorId(Number(medicionId))
      .then(setMedicion)
      .catch((error) => {
        console.error("Error al traer la medición", error);
        setError("No se pudo cargar la medición de base");
      });
  }, [medicionId]);

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPlan((prevPlan) => ({
      ...prevPlan,
      [name]: value,
    }));
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      /**
       * cantidad_agua es null=True en el modelo: si quedó vacío mandamos null,
       * porque el string vacío no es un decimal válido para DRF.
       */
      const creado = await crearPlan({
        ...plan,
        cantidad_agua: plan.cantidad_agua === "" ? null : plan.cantidad_agua,
      });
      navigate(`/planes/${creado.id}`);
    } catch (error) {
      console.error("Error al crear el plan", error);
      setError(String(error));
    }
  };

  return (
    <div className="page">
      {medicion && (
        <Link to={`/pacientes/${medicion.paciente}`} className="back-link">
          ← Volver al paciente
        </Link>
      )}

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Prescripción</span>
          <h2>Nuevo plan nutricional</h2>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      {medicion && (
        <div className="stat-grid">
          <div className="stat">
            <span className="stat__label">Medición base</span>
            <span className="stat__value" style={{ fontSize: "1.1rem" }}>
              {medicion.fecha}
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Peso</span>
            <span className="stat__value">
              {medicion.peso}
              <span className="stat__unit">kg</span>
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Gasto total</span>
            <span className="stat__value">
              {mostrar(medicion.gasto_total)}
              <span className="stat__unit">kcal</span>
            </span>
          </div>
        </div>
      )}

      <form className="card" onSubmit={manejarEnvio}>
        <div className="form-grid">
          <label className="field">
            <span>Objetivo</span>
            <select
              name="objetivo_plan"
              value={plan.objetivo_plan}
              onChange={manejarCambio}
            >
              {Object.entries(ETIQUETAS_OBJETIVO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor as ObjetivoPlan}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Cantidad de agua (L)</span>
            <input
              name="cantidad_agua"
              type="number"
              step="0.01"
              min="0"
              value={plan.cantidad_agua ?? ""}
              onChange={manejarCambio}
            />
          </label>
          <label className="field field--wide">
            <span>Observaciones</span>
            <textarea
              name="observaciones"
              value={plan.observaciones}
              onChange={manejarCambio}
            />
          </label>
        </div>

        <div className="form-foot">
          <button type="submit" className="btn btn--primary">
            Crear plan
          </button>
        </div>
      </form>

      <p className="muted">
        Las calorías y los macros objetivo los calcula el backend en
        Plan.save() al crear el plan.
      </p>
    </div>
  );
}
