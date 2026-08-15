import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Comparacion, Plan, TiempoComida, TipoComida } from "./types";
import { ETIQUETAS_COMIDA, ETIQUETAS_OBJETIVO, ORDEN_COMIDAS } from "./types";
import {
  obtenerPlanPorId,
  obtenerComidasDelPlan,
  compararPlan,
  crearTiempoComida,
  actualizarPlatosDeComida,
  eliminarTiempoComida,
  urlPdfDelPlan,
} from "./service";
import type { Plato } from "../platos/types";
import { obtenerPlatos } from "../platos/service";
import type { Medicion } from "../mediciones/types";
import { obtenerMedicionPorId } from "../mediciones/service";
import { mostrar } from "../../utils/formato";

/** Un medidor por macro: magnitud de lo real contra el objetivo del plan. */
const MACROS = [
  { clave: "kcal", etiqueta: "Calorías", unidad: "kcal" },
  { clave: "proteina", etiqueta: "Proteína", unidad: "g" },
  { clave: "carbohidratos", etiqueta: "Carbohidratos", unidad: "g" },
  { clave: "grasas", etiqueta: "Grasas", unidad: "g" },
] as const;

export default function DetallePlan() {
  const { id } = useParams();
  const planId = Number(id);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [medicion, setMedicion] = useState<Medicion | null>(null);
  const [comidas, setComidas] = useState<TiempoComida[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [comparacion, setComparacion] = useState<Comparacion | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarComparacion = async () => {
    try {
      setComparacion(await compararPlan(planId));
    } catch (error) {
      console.error("Fallo la comparación", error);
    }
  };

  useEffect(() => {
    if (!planId) return;
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const datosPlan = await obtenerPlanPorId(planId);
        setPlan(datosPlan);
        setMedicion(await obtenerMedicionPorId(datosPlan.medicion));
        setComidas(await obtenerComidasDelPlan(planId));
        setPlatos(await obtenerPlatos());
        setComparacion(await compararPlan(planId));
        setError(null);
      } catch (error) {
        console.error("Fallo la carga del plan", error);
        setError("Hubo un error al cargar el plan");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [planId]);

  const nombrePlato = (platoId: number) =>
    platos.find((plato) => plato.id === platoId)?.nombre ?? `Plato #${platoId}`;

  const comidaPorTipo = (tipo: TipoComida) =>
    comidas.find((comida) => comida.tipo === tipo);

  /**
   * Agregar un plato a un tiempo de comida. Si ese tiempo todavía no existe
   * en el plan, se crea ya con el plato adentro: TiempoComida es una fila
   * propia (no un campo del plan) y su lista de platos no admite vacío.
   */
  const manejarAgregarPlato = async (tipo: TipoComida, platoId: number) => {
    if (!platoId) return;
    try {
      const comida = comidaPorTipo(tipo);

      if (!comida) {
        const creada = await crearTiempoComida(planId, tipo, [platoId]);
        setComidas((prev) => [...prev, creada]);
      } else {
        if (comida.platos.includes(platoId)) return;
        const actualizada = await actualizarPlatosDeComida(comida.id, [
          ...comida.platos,
          platoId,
        ]);
        setComidas((prev) =>
          prev.map((c) => (c.id === actualizada.id ? actualizada : c)),
        );
      }
      await cargarComparacion();
    } catch (error) {
      console.error("Error al agregar el plato", error);
      setError(String(error));
    }
  };

  const manejarQuitarPlato = async (comida: TiempoComida, platoId: number) => {
    const restantes = comida.platos.filter((p) => p !== platoId);
    try {
      /**
       * Quitar el último plato dejaría la lista vacía, que el backend rechaza.
       * En ese caso se borra el tiempo de comida entero: una comida sin
       * ningún plato no tiene por qué existir como fila.
       */
      if (restantes.length === 0) {
        await eliminarTiempoComida(comida.id);
        setComidas((prev) => prev.filter((c) => c.id !== comida.id));
      } else {
        const actualizada = await actualizarPlatosDeComida(
          comida.id,
          restantes,
        );
        setComidas((prev) =>
          prev.map((c) => (c.id === actualizada.id ? actualizada : c)),
        );
      }
      await cargarComparacion();
    } catch (error) {
      console.error("Error al quitar el plato", error);
      setError(String(error));
    }
  };

  if (cargando) return <p className="loading">Cargando plan...</p>;
  if (error && !plan)
    return (
      <div className="page">
        <p className="alert">{error}</p>
      </div>
    );
  if (!plan)
    return (
      <div className="page">
        <p className="empty">Plan no encontrado</p>
      </div>
    );

  return (
    <div className="page">
      {medicion && (
        <Link to={`/pacientes/${medicion.paciente}`} className="back-link">
          ← Volver al paciente
        </Link>
      )}

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Plan nutricional</span>
          <h2>{ETIQUETAS_OBJETIVO[plan.objetivo_plan]}</h2>
        </div>
        <div className="actions">
          <span className={plan.activo ? "chip" : "chip chip--off"}>
            {plan.activo ? "Activo" : "Inactivo"}
          </span>
          <a href={urlPdfDelPlan(planId)} className="btn btn--ghost">
            ↓ Descargar PDF
          </a>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <div className="stat-grid">
        <div className="stat">
          <span className="stat__label">Calorías objetivo</span>
          <span className="stat__value">
            {mostrar(plan.calorias_objetivo)}
            <span className="stat__unit">kcal</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Proteínas</span>
          <span className="stat__value">
            {mostrar(plan.proteinas_objetivo)}
            <span className="stat__unit">g</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Carbohidratos</span>
          <span className="stat__value">
            {mostrar(plan.carbohidratos_objetivo)}
            <span className="stat__unit">g</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Grasas</span>
          <span className="stat__value">
            {mostrar(plan.grasas_objetivo)}
            <span className="stat__unit">g</span>
          </span>
        </div>
      </div>

      <section>
        <div className="section-head">
          <h3>Objetivo vs. real</h3>
          <span className="muted">
            Agua: {mostrar(plan.cantidad_agua, " L")}
          </span>
        </div>

        {!comparacion ? (
          <p className="empty">No se pudo calcular la comparación</p>
        ) : (
          <div className="card meters">
            {MACROS.map((macro) => {
              const objetivo = comparacion.objetivo[macro.clave];
              const real = comparacion.reales[macro.clave] ?? 0;
              const faltante = comparacion.faltantes[macro.clave];
              const porcentaje =
                objetivo && objetivo > 0
                  ? Math.round((real / objetivo) * 100)
                  : null;
              const excedido = porcentaje !== null && porcentaje > 100;

              return (
                <div className="meter" key={macro.clave}>
                  <div className="meter__head">
                    <span className="meter__name">{macro.etiqueta}</span>
                    <span className="meter__figures">
                      <b>{real}</b> / {mostrar(objetivo)} {macro.unidad}
                      {porcentaje !== null && ` · ${porcentaje}%`}
                    </span>
                  </div>
                  <div
                    className="meter__track"
                    role="meter"
                    aria-label={macro.etiqueta}
                    aria-valuenow={real}
                    aria-valuemin={0}
                    aria-valuemax={objetivo ?? undefined}
                  >
                    <div
                      className={
                        excedido ? "meter__fill is-over" : "meter__fill"
                      }
                      style={{
                        width: `${Math.min(porcentaje ?? 0, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="meter__note">
                    {faltante === null || faltante === undefined
                      ? "Sin objetivo calculado"
                      : faltante > 0
                        ? `Faltan ${faltante} ${macro.unidad}`
                        : `Excedido en ${Math.abs(faltante)} ${macro.unidad}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h3>Menú del día</h3>
          {platos.length === 0 && (
            <Link to="/platos" className="btn btn--ghost btn--sm">
              Crear platos primero
            </Link>
          )}
        </div>

        <div className="meals">
          {ORDEN_COMIDAS.map((tipo) => {
            const comida = comidaPorTipo(tipo);
            return (
              <div className="meal" key={tipo}>
                <div className="meal__head">
                  <span className="meal__name">{ETIQUETAS_COMIDA[tipo]}</span>
                  <select
                    value=""
                    onChange={(e) =>
                      manejarAgregarPlato(tipo, Number(e.target.value))
                    }
                    disabled={platos.length === 0}
                  >
                    <option value="">+ Agregar plato...</option>
                    {platos.map((plato) => (
                      <option key={plato.id} value={plato.id}>
                        {plato.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {!comida || comida.platos.length === 0 ? (
                  <p className="meal__empty">Sin platos</p>
                ) : (
                  <ul className="plates">
                    {comida.platos.map((platoId) => (
                      <li key={platoId} className="plate">
                        <Link to={`/platos/${platoId}`}>
                          {nombrePlato(platoId)}
                        </Link>
                        <button
                          type="button"
                          className="plate__remove"
                          aria-label={`Quitar ${nombrePlato(platoId)}`}
                          onClick={() => manejarQuitarPlato(comida, platoId)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {plan.observaciones && (
        <section>
          <div className="section-head">
            <h3>Observaciones</h3>
          </div>
          <p className="card">{plan.observaciones}</p>
        </section>
      )}
    </div>
  );
}
