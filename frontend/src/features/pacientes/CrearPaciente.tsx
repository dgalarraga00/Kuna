import React, { useState, type ChangeEvent } from "react";
import type { NuevoPaciente } from "./types";
import { crearPaciente } from "./service";
import { useNavigate, Link } from "react-router-dom";
import FormularioPaciente from "./FormularioPaciente";

export default function CrearPaciente() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<NuevoPaciente>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    restricciones_alimentarias: "",
    alergias_alimentarias: "",
    enfermedades_existentes: "",
    medicamentos_actuales: "",
    observaciones: "",
    sexo: "M",
    fecha_nacimiento: "",
  });

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setPaciente((prevPaciente) => ({
      ...prevPaciente,
      [name]: value,
    }));
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await crearPaciente(paciente);
      navigate("/");
    } catch (error) {
      console.error("Error al crear el paciente", error);
      setError(String(error));
    }
  };

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Volver a pacientes
      </Link>

      <div className="page-head">
        <div>
          <span className="page-head__eyebrow">Alta</span>
          <h2>Nuevo paciente</h2>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <form className="card" onSubmit={manejarEnvio}>
        <FormularioPaciente paciente={paciente} onChange={manejarCambio} />
        <div className="form-foot">
          <Link to="/" className="btn btn--ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn btn--primary">
            Registrar paciente
          </button>
        </div>
      </form>
    </div>
  );
}
