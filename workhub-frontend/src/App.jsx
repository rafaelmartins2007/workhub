import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./components/Protectedroute";

import LoginForm from "./pages/login/LoginForm";
import RegisterForm from "./pages/register/RegisterForm";
import Spaces from "./pages/spaces/Spaces";
import SpaceDetail from "./pages/spaces/SpaceDetail";
import ReservationForm from "./pages/spaces/ReservationForm";
import MyReservations from "./pages/client/MyReservations";
import ReservationHistory from "./pages/client/ReservationHistory";
import Profile from "./pages/client/Profile";
import AdminSpaces from "./pages/admin/Adminspaces";
import AdminReservations from "./pages/admin/Adminreservations";
import AdminUsers from "./pages/admin/Adminusers";
import AdminServices from "./pages/admin/Adminservices";
import AdminReports from "./pages/admin/AdminReports";

function App() {
    return (
        <div className="App">
            <Navbar />
            <main>
                <Routes>
                    {/* ── Rotas públicas ── */}
                    <Route path="/"           element={<Spaces />} />
                    <Route path="/login"      element={<LoginForm />} />
                    <Route path="/register"   element={<RegisterForm />} />
                    <Route path="/spaces"     element={<Spaces />} />
                    <Route path="/spaces/:id" element={<SpaceDetail />} />

                    {/* ── Rotas do cliente (requerem login) ── */}
                    <Route path="/spaces/:id/reserve" element={
                        <ProtectedRoute><ReservationForm /></ProtectedRoute>
                    } />
                    <Route path="/reservations/my" element={
                        <ProtectedRoute><MyReservations /></ProtectedRoute>
                    } />
                    <Route path="/reservations/history" element={
                        <ProtectedRoute><ReservationHistory /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />

                    {/* ── Rotas do admin ── */}
                    <Route path="/admin/spaces" element={
                        <ProtectedRoute requireAdmin><AdminSpaces /></ProtectedRoute>
                    } />
                    <Route path="/admin/reservations" element={
                        <ProtectedRoute requireAdmin><AdminReservations /></ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>
                    } />
                    <Route path="/admin/services" element={
                        <ProtectedRoute requireAdmin><AdminServices /></ProtectedRoute>
                    } />
                    <Route path="/admin/reports" element={
                        <ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;