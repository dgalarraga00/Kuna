import type { ChangeEvent } from "react";
import type { NuevoPaciente } from "./types";
import { ETIQUETAS_SEXO } from "./types";

/**
 * Campos compartidos entre crear y editar: los dos formularios manejan
 * exactamente los mismos datos, así que el marcado vive en un solo lugar.
 */
interface Props {
  paciente: NuevoPaciente;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
}

const TEXTOS = [
  { name: "restricciones_alimentarias", label: "Restricciones alimentarias" },
  { name: "alergias_alimentarias", label: "Alergias alimentarias" },
  { name: "enfermedades_existentes", label: "Enfermedades existentes" },
  { name: "medicamentos_actuales", label: "Medicamentos actuales" },
  { name: "observaciones", label: "Observaciones" },
] as const;

export default function FormularioPaciente({ paciente, onChange }: Props) {
  return (
    <div className="form-grid">
      <label className="field">
        <span>Nombre</span>
        <input name="nombre" value={paciente.nombre} onChange={onChange} required />
      </label>
      <label className="field">
        <span>Apellido</span>
        <input
          name="apellido"
          value={paciente.apellido}
          onChange={onChange}
          required
        />
      </label>
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          value={paciente.email}
          onChange={onChange}
          required
        />
      </label>
      <label className="field">
        <span>Teléfono</span>
        <input name="telefono" value={paciente.telefono} onChange={onChange} />
      </label>
      <label className="field">
        <span>Fecha de nacimiento</span>
        <input
          name="fecha_nacimiento"
          type="date"
          value={paciente.fecha_nacimiento}
          onChange={onChange}
          required
        />
      </label>
      <label className="field">
        <span>Sexo</span>
        <select name="sexo" value={paciente.sexo} onChange={onChange}>
          {Object.entries(ETIQUETAS_SEXO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </label>

      {TEXTOS.map((campo) => (
        <label key={campo.name} className="field field--wide">
          <span>{campo.label}</span>
          <textarea
            name={campo.name}
            value={paciente[campo.name]}
            onChange={onChange}
          />
        </label>
      ))}
    </div>
  );
}
