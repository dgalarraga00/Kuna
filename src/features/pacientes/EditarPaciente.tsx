import React, { useState, useEffect, type ChangeEvent } from "react";
import type { NuevoPaciente, Paciente } from "./types";
import { obtenerPacientePorId, actualizarPaciente } from "./service";
import { useNavigate, useParams, Link } from "react-router-dom";
import FormularioPaciente from "./FormularioPaciente";

export default function EditarPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    obtenerPacientePorId(Number(id))
      .then((datos) => {
        setPaciente(datos);
      })
      .catch((error) => {
        console.error("Error al traer datos:", error);
        setError("No se pudo cargar el paciente");
      });
  }, [id]);

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setPaciente((prevPaciente) => {
      if (!prevPaciente) return null;
      return {
        ...prevPaciente,
        [name]: value,
      };
    });
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paciente) return;
    /**
     * id, created_at y updated_at son de solo lectura en el backend,
     * así que mandamos únicamente los campos editables.
     */
    const camposEditables: NuevoPaciente = {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      email: paciente.email,
      telefono: paciente.telefono,
      restricciones_alimentarias: paciente.restricciones_alimentarias,
      alergias_alimentarias: paciente.alergias_alimentarias,
      enfermedades_existentes: paciente.enfermedades_existentes,
      medicamentos_actuales: paciente.medicamentos_actuales,
      observaciones: paciente.observaciones,
      sexo: paciente.sexo,
      fecha_nacimiento: paciente.fecha_nacimiento,
    };
    try {
      await actualizarPaciente(paciente.id, camposEditables);
      navigate(`/pacientes/${paciente.id}`);
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
      setError(String(error));
    }
  };

  if (!paciente) {
    return error ? (
      <div className="page">
        <p className="alert">{error}</p>
      </div>
    ) : (
      <p className="loading">Cargando paciente...</p>
    );
  }

  return (
    <div className="page">
      <Link to={`/pacientes/${paciente.id}`} className="back-link">
        ← Volver al paciente
      </Link>

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Edición</span>
          <h2>
            {paciente.nombre} {paciente.apellido}
          </h2>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <form className="card" onSubmit={manejarEnvio}>
        <FormularioPaciente paciente={paciente} onChange={manejarCambio} />
        <div className="form-foot">
          <Link to={`/pacientes/${paciente.id}`} className="btn btn--ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn btn--primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
