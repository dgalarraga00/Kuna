import React, { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { NuevaMedicion, NivelActividad } from "./types";
import { ETIQUETAS_ACTIVIDAD, PLIEGUES_POR_SEXO } from "./types";
import { crearMedicion } from "./service";
import type { Paciente } from "../pacientes/types";
import { obtenerPacientePorId } from "../pacientes/service";

/** Formato YYYY-MM-DD, que es el que espera DRF para un DateField. */
const hoyISO = () => new Date().toISOString().slice(0, 10);

const BASICOS = [
  { name: "peso", label: "Peso", unidad: "kg" },
  { name: "talla", label: "Talla", unidad: "cm" },
] as const;

const PLIEGUES = ["pliegue_1", "pliegue_2", "pliegue_3"] as const;

export default function CrearMedicion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [medicion, setMedicion] = useState<NuevaMedicion>({
    paciente: Number(id),
    fecha: hoyISO(),
    peso: "",
    talla: "",
    pliegue_1: "",
    pliegue_2: "",
    pliegue_3: "",
    actividad_fisica: "1.2",
  });

  useEffect(() => {
    if (!id) return;
    obtenerPacientePorId(Number(id))
      .then(setPaciente)
      .catch((error) => {
        console.error("Error al traer el paciente", error);
        setError("No se pudo cargar el paciente");
      });
  }, [id]);

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setMedicion((prevMedicion) => ({
      ...prevMedicion,
      [name]: value,
    }));
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await crearMedicion(medicion);
      navigate(`/pacientes/${id}`);
    } catch (error) {
      console.error("Error al crear la medición", error);
      setError(String(error));
    }
  };

  /**
   * Los sitios de medición dependen del sexo del paciente: hasta que no
   * sepamos cuál es, mostramos los nombres genéricos.
   */
  const sitios = paciente
    ? PLIEGUES_POR_SEXO[paciente.sexo]
    : PLIEGUES_POR_SEXO.N;

  const sinProtocolo = paciente?.sexo === "N";

  return (
    <div className="page">
      <Link to={`/pacientes/${id}`} className="back-link">
        ← Volver al paciente
      </Link>

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">
            Antropometría
            {paciente && ` · ${paciente.nombre} ${paciente.apellido}`}
          </span>
          <h2>Nueva medición</h2>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      {sinProtocolo && (
        <p className="alert">
          Este paciente tiene el sexo en "No Aplica". Las ecuaciones de
          Jackson-Pollock necesitan un protocolo masculino o femenino, así que
          el porcentaje de grasa y el gasto energético van a quedar sin
          calcular.
        </p>
      )}

      <form className="card" onSubmit={manejarEnvio}>
        <div className="form-grid">
          <label className="field">
            <span>Fecha</span>
            <input
              name="fecha"
              type="date"
              value={medicion.fecha}
              onChange={manejarCambio}
              required
            />
          </label>

          {BASICOS.map((campo) => (
            <label key={campo.name} className="field">
              <span>
                {campo.label} ({campo.unidad})
              </span>
              <input
                name={campo.name}
                type="number"
                step="0.01"
                min="0"
                value={medicion[campo.name]}
                onChange={manejarCambio}
                required
              />
            </label>
          ))}
        </div>

        <div className="protocol">
          <div className="protocol__head">
            <h4>Pliegues cutáneos</h4>
            {paciente && !sinProtocolo && (
              <span className="chip">
                Protocolo {paciente.sexo === "M" ? "masculino" : "femenino"}
              </span>
            )}
          </div>

          <div className="form-grid">
            {PLIEGUES.map((campo, indice) => (
              <label key={campo} className="field">
                <span>
                  {sitios[indice]} (mm)
                </span>
                <input
                  name={campo}
                  type="number"
                  step="0.01"
                  min="0"
                  value={medicion[campo]}
                  onChange={manejarCambio}
                  required
                />
              </label>
            ))}
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: "1.1rem" }}>
          <label className="field field--wide">
            <span>Nivel de actividad</span>
            <select
              name="actividad_fisica"
              value={medicion.actividad_fisica}
              onChange={manejarCambio}
            >
              {Object.entries(ETIQUETAS_ACTIVIDAD).map(([valor, etiqueta]) => (
                <option key={valor} value={valor as NivelActividad}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-foot">
          <Link to={`/pacientes/${id}`} className="btn btn--ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn btn--primary">
            Guardar medición
          </button>
        </div>
      </form>

      <p className="muted">
        El IMC, el porcentaje de grasa (Jackson-Pollock 3 pliegues + Siri) y el
        gasto energético los calcula el backend a partir de estos datos.
      </p>
    </div>
  );
}
