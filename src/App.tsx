import "./App.css";
import ListaPacientes from "./features/pacientes/ListaPacientes";
import CrearPaciente from "./features/pacientes/CrearPaciente";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ListaPacientes />} />
      <Route path="/add" element={<CrearPaciente />} />
    </Routes>
  );
}
