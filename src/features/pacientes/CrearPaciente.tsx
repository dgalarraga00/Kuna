import React, { useState, type ChangeEvent } from "react";
import type { NuevoPaciente } from "./types";
import { crearPaciente } from "./service";
import { useNavigate } from "react-router-dom";

export default function CrearPaciente() {
  const navigate = useNavigate();
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
  const manejarEnvio = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await crearPaciente(paciente);
      navigate("/");
    } catch (error) {
      console.error("Error al crear el paciente", error);
    }
  };

  return (
    <form onSubmit={manejarEnvio}>
      <input name="nombre" value={paciente.nombre} onChange={manejarCambio} />
      <input
        name="apellido"
        value={paciente.apellido}
        onChange={manejarCambio}
      />
      <input name="email" value={paciente.email} onChange={manejarCambio} />
      <input
        name="telefono"
        value={paciente.telefono}
        onChange={manejarCambio}
      />
      <input
        name="restricciones_alimentarias"
        value={paciente.restricciones_alimentarias}
        onChange={manejarCambio}
      />
      <input
        name="alergias_alimentarias"
        value={paciente.alergias_alimentarias}
        onChange={manejarCambio}
      />
      <input
        name="enfermedades_existentes"
        value={paciente.enfermedades_existentes}
        onChange={manejarCambio}
      />
      <input
        name="medicamentos_actuales"
        value={paciente.medicamentos_actuales}
        onChange={manejarCambio}
      />
      <input
        name="observaciones"
        value={paciente.observaciones}
        onChange={manejarCambio}
      />
      <select name="sexo" value={paciente.sexo} onChange={manejarCambio}>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="N">No Aplica</option>
      </select>
      <input
        name="fecha_nacimiento"
        type="date"
        value={paciente.fecha_nacimiento}
        onChange={manejarCambio}
      />
      <button type="submit">Registrar Paciente</button>
    </form>
  );
}
