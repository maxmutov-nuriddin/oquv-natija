import { Navigate, Route, Routes } from "react-router-dom";
import { useTeacherAuth } from "./hooks/useTeacherAuth";
import { LoadingState } from "./components/ui/LoadingState";
import { AuthPage } from "./pages/AuthPage";
import { DashboardApp } from "./pages/DashboardApp";

export default function App() {
  const { teacher, loading, login, register, resetPassword, logout, normalizePhone, updateProfile, changePassword } = useTeacherAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <LoadingState compact />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={teacher ? <Navigate to="/" replace /> : <AuthPage login={login} resetPassword={resetPassword} normalizePhone={normalizePhone} />}
      />
      <Route
        path="/*"
        element={teacher ? <DashboardApp teacher={teacher} logout={logout} updateProfile={updateProfile} changePassword={changePassword} register={register} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
