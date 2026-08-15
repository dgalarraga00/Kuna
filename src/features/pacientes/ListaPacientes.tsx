import { useState, useEffect } from "react";
import type { Paciente } from "./types";
import { obtenerPacientes, eliminarPaciente } from "./service";
import { Link } from "react-router-dom";

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargandoDatos = async () => {
      try {
        const data = await obtenerPacientes();
        setPacientes(data);
      } catch (error) {
        console.error("Fallo la carga", error);
        setError("Hubo un error al cargar los pacientes");
      } finally {
        setCargando(false);
      }
    };
    cargandoDatos();
  }, []);

  const manejarEliminar = async (id: number) => {
    if (!window.confirm("¿Seguro que querés eliminar este paciente?")) {
      return;
    }
    try {
      await eliminarPaciente(id);
      /**
       * Actualizamos el estado local en vez de volver a pedir la lista:
       * el backend ya confirmó el borrado con un 204.
       */
      setPacientes((prevPacientes) =>
        prevPacientes.filter((paciente) => paciente.id !== id),
      );
    } catch (error) {
      console.error("Fallo el borrado", error);
      /**
       * El backend puede rechazar el borrado por reglas de negocio
       * (por ejemplo, un paciente con planes asociados), así que mostramos
       * su mensaje en vez de uno genérico.
       */
      setError(
        error instanceof Error
          ? error.message
          : "Hubo un error al eliminar el paciente",
      );
    }
  };

  if (cargando) {
    return <p className="loading">Cargando pacientes...</p>;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Consultorio</span>
          <h2>Mis pacientes</h2>
        </div>
        <Link to="/add" className="btn btn--primary">
          + Nuevo paciente
        </Link>
      </div>

      {error && <p className="alert">{error}</p>}

      {pacientes.length === 0 ? (
        <p className="empty">Aun no hay pacientes registrados</p>
      ) : (
        <ul className="tiles">
          {pacientes.map((paciente) => (
            <li key={paciente.id} className="tile">
              <Link to={`/pacientes/${paciente.id}`} className="tile__name">
                {paciente.nombre} {paciente.apellido}
              </Link>
              <span className="tile__meta">
                Nac. {paciente.fecha_nacimiento}
                {paciente.edad != null && ` · ${paciente.edad} años`}
              </span>
              <div className="tile__foot">
                <Link
                  to={`/pacientes/${paciente.id}/editar`}
                  className="btn btn--ghost btn--sm"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => manejarEliminar(paciente.id)}
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
