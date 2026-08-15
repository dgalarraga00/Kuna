import "./App.css";
import { Routes, Route, NavLink } from "react-router-dom";
import ListaPacientes from "./features/pacientes/ListaPacientes";
import CrearPaciente from "./features/pacientes/CrearPaciente";
import EditarPaciente from "./features/pacientes/EditarPaciente";
import DetallePaciente from "./features/pacientes/DetallePaciente";
import CrearMedicion from "./features/mediciones/CrearMedicion";
import CrearPlan from "./features/planes/CrearPlan";
import DetallePlan from "./features/planes/DetallePlan";
import ListaPlatos from "./features/platos/ListaPlatos";
import DetallePlato from "./features/platos/DetallePlato";

const claseNav = ({ isActive }: { isActive: boolean }) =>
  isActive ? "is-active" : "";

export default function App() {
  return (
    <>
      <header className="topbar">
        <span className="brand">
          Kuna<span className="brand__tag">nutrición</span>
        </span>
        <nav className="nav">
          <NavLink to="/" end className={claseNav}>
            Pacientes
          </NavLink>
          <NavLink to="/platos" className={claseNav}>
            Platos
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ListaPacientes />} />
          <Route path="/add" element={<CrearPaciente />} />
          <Route path="/pacientes/:id" element={<DetallePaciente />} />
          <Route path="/pacientes/:id/editar" element={<EditarPaciente />} />
          <Route
            path="/pacientes/:id/mediciones/nueva"
            element={<CrearMedicion />}
          />
          <Route
            path="/mediciones/:medicionId/planes/nuevo"
            element={<CrearPlan />}
          />
          <Route path="/planes/:id" element={<DetallePlan />} />
          <Route path="/platos" element={<ListaPlatos />} />
          <Route path="/platos/:id" element={<DetallePlato />} />
          <Route
            path="*"
            element={
              <div className="page">
                <p className="empty">Página no encontrada</p>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}
