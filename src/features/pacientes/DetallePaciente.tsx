import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Paciente } from "./types";
import { ETIQUETAS_SEXO } from "./types";
import { obtenerPacientePorId } from "./service";
import type { Medicion } from "../mediciones/types";
import { ETIQUETAS_ACTIVIDAD_CORTAS } from "../mediciones/types";
import {
  obtenerMedicionesDePaciente,
  eliminarMedicion,
} from "../mediciones/service";
import type { Plan } from "../planes/types";
import { ETIQUETAS_OBJETIVO } from "../planes/types";
import { obtenerPlanesDePaciente } from "../planes/service";
import { mostrar } from "../../utils/formato";

export default function DetallePaciente() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const pacienteId = Number(id);

    const cargarDatos = async () => {
      setCargando(true);
      try {
        const datosPaciente = await obtenerPacientePorId(pacienteId);
        const datosMediciones = await obtenerMedicionesDePaciente(pacienteId);
        const datosPlanes = await obtenerPlanesDePaciente(pacienteId);
        setPaciente(datosPaciente);
        setMediciones(datosMediciones);
        setPlanes(datosPlanes);
        setError(null);
      } catch (error) {
        console.error("Fallo la carga del paciente", error);
        setError("Hubo un error al cargar el paciente");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const manejarEliminarMedicion = async (medicionId: number) => {
    if (!window.confirm("¿Eliminar esta medición?")) return;
    try {
      await eliminarMedicion(medicionId);
      setMediciones((prev) => prev.filter((m) => m.id !== medicionId));
    } catch (error) {
      console.error("Fallo el borrado de la medición", error);
      /**
       * Plan.medicion es on_delete=PROTECT: si la medición ya tiene un plan,
       * el backend rechaza el borrado y explica por qué.
       */
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la medición.",
      );
    }
  };

  const ultima = mediciones[0];

  if (cargando) return <p className="loading">Cargando paciente...</p>;
  if (error && !paciente)
    return (
      <div className="page">
        <p className="alert">{error}</p>
      </div>
    );
  if (!paciente)
    return (
      <div className="page">
        <p className="empty">Paciente no encontrado</p>
      </div>
    );

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Volver a pacientes
      </Link>

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">
            {ETIQUETAS_SEXO[paciente.sexo]}
            {paciente.edad != null && ` · ${paciente.edad} años`}
          </span>
          <h2>
            {paciente.nombre} {paciente.apellido}
          </h2>
        </div>
        <div className="actions">
          <Link
            to={`/pacientes/${paciente.id}/editar`}
            className="btn btn--ghost"
          >
            Editar ficha
          </Link>
          <Link
            to={`/pacientes/${paciente.id}/mediciones/nueva`}
            className="btn btn--primary"
          >
            + Nueva medición
          </Link>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      {ultima && (
        <div className="stat-grid">
          <div className="stat">
            <span className="stat__label">IMC</span>
            <span className="stat__value">{mostrar(ultima.imc)}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Grasa corporal</span>
            <span className="stat__value">
              {mostrar(ultima.porcentaje_grasa)}
              <span className="stat__unit">%</span>
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Gasto basal</span>
            <span className="stat__value">
              {mostrar(ultima.geb)}
              <span className="stat__unit">kcal</span>
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Gasto total</span>
            <span className="stat__value">
              {mostrar(ultima.gasto_total)}
              <span className="stat__unit">kcal</span>
            </span>
          </div>
        </div>
      )}

      <section>
        <div className="section-head">
          <h3>Ficha clínica</h3>
        </div>
        <dl className="facts">
          <div>
            <dt>Fecha de nacimiento</dt>
            <dd>{paciente.fecha_nacimiento}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{paciente.email}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{paciente.telefono || "—"}</dd>
          </div>
          <div>
            <dt>Restricciones</dt>
            <dd>{paciente.restricciones_alimentarias || "—"}</dd>
          </div>
          <div>
            <dt>Alergias</dt>
            <dd>{paciente.alergias_alimentarias || "—"}</dd>
          </div>
          <div>
            <dt>Enfermedades</dt>
            <dd>{paciente.enfermedades_existentes || "—"}</dd>
          </div>
          <div>
            <dt>Medicamentos</dt>
            <dd>{paciente.medicamentos_actuales || "—"}</dd>
          </div>
          <div>
            <dt>Observaciones</dt>
            <dd>{paciente.observaciones || "—"}</dd>
          </div>
        </dl>
      </section>

      <section>
        <div className="section-head">
          <h3>Mediciones</h3>
          <Link
            to={`/pacientes/${paciente.id}/mediciones/nueva`}
            className="btn btn--ghost btn--sm"
          >
            + Agregar
          </Link>
        </div>
        {mediciones.length === 0 ? (
          <p className="empty">Todavía no hay mediciones cargadas</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Talla</th>
                  <th>IMC</th>
                  <th>% Grasa</th>
                  <th>GEB</th>
                  <th>GET</th>
                  <th>Actividad</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {mediciones.map((medicion) => (
                  <tr key={medicion.id}>
                    <td>{medicion.fecha}</td>
                    <td>{medicion.peso} kg</td>
                    <td>{medicion.talla} cm</td>
                    <td>{mostrar(medicion.imc)}</td>
                    <td>{mostrar(medicion.porcentaje_grasa, " %")}</td>
                    <td>{mostrar(medicion.geb)}</td>
                    <td>{mostrar(medicion.gasto_total)}</td>
                    <td>
                      {ETIQUETAS_ACTIVIDAD_CORTAS[medicion.actividad_fisica]}
                    </td>
                    <td>
                      <div className="actions">
                        <Link
                          to={`/mediciones/${medicion.id}/planes/nuevo`}
                          className="btn btn--ghost btn--sm"
                        >
                          Crear plan
                        </Link>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => manejarEliminarMedicion(medicion.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h3>Planes nutricionales</h3>
        </div>
        {planes.length === 0 ? (
          <p className="empty">Todavía no hay planes para este paciente</p>
        ) : (
          <ul className="tiles">
            {planes.map((plan) => (
              <li key={plan.id} className="tile">
                <Link to={`/planes/${plan.id}`} className="tile__name">
                  {ETIQUETAS_OBJETIVO[plan.objetivo_plan]}
                </Link>
                <span className="tile__meta">
                  {mostrar(plan.calorias_objetivo, " kcal")} ·{" "}
                  {mostrar(plan.proteinas_objetivo, " g")} proteína
                </span>
                <div className="tile__foot">
                  <span className={plan.activo ? "chip" : "chip chip--off"}>
                    {plan.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
