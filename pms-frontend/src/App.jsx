import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { TOKEN_KEY, isAdminUser } from "./constants/auth";

function RequireAuth({ children }) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  if (!isAdminUser()) return <Navigate to="/tasks" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to={isAdminUser() ? "/dashboard" : "/tasks"} replace />} />
          <Route
            path="dashboard"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="projects"
            element={
              <RequireAdmin>
                <Projects />
              </RequireAdmin>
            }
          />
          <Route
            path="projects/:id"
            element={
              <RequireAdmin>
                <ProjectDetails />
              </RequireAdmin>
            }
          />
          <Route path="tasks" element={<Tasks />} />
          <Route
            path="users"
            element={
              <RequireAdmin>
                <Users />
              </RequireAdmin>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to={isAdminUser() ? "/dashboard" : "/tasks"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
