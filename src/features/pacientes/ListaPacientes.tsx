import { useState, useEffect } from "react";
import type { Paciente } from "./types";
import { obtenerPacientes } from "./service";

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

  if (cargando) {
    return <p>Cargando pacientes...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  return (
    <div>
      <h2>Mis pacientes</h2>
      {pacientes.length === 0 ? (
        <p>Aun no hay pacientes registrados</p>
      ) : (
        <ul>
          {pacientes.map((paciente) => (
            <li key={paciente.id}>
              {paciente.nombre} {paciente.apellido}
              <p>Fecha de nacimiento: {paciente.fecha_nacimiento}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
