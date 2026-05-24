import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginForm from "./pages/login/LoginForm";
import RegisterForm from "./pages/register/RegisterForm";
import Spaces from "./pages/spaces/Spaces";
import SpaceDetail from "./pages/spaces/SpaceDetail";
import ReservationForm from "./pages/spaces/ReservationForm";
import MyReservations from "./pages/client/MyReservations";
import Profile from "./pages/client/Profile";
import AdminSpaces from "./pages/admin/AdminSpaces";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";

function App() {
    return (
        <div className="App">
            <Navbar />
            <main>
                <Routes>
                    {/* ── Rotas públicas ── */}
                    <Route path="/"              element={<Spaces />} />
                    <Route path="/login"         element={<LoginForm />} />
                    <Route path="/register"      element={<RegisterForm />} />
                    <Route path="/spaces"        element={<Spaces />} />
                    <Route path="/spaces/:id"    element={<SpaceDetail />} />

                    {/* ── Rotas do cliente (requerem login) ── */}
                    <Route path="/spaces/:id/reserve" element={
                        <ProtectedRoute>
                            <ReservationForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/reservations/my" element={
                        <ProtectedRoute>
                            <MyReservations />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    {/* ── Rotas do admin (requerem login + role admin) ── */}
                    <Route path="/admin/spaces" element={
                        <ProtectedRoute requireAdmin>
                            <AdminSpaces />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/reservations" element={
                        <ProtectedRoute requireAdmin>
                            <AdminReservations />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute requireAdmin>
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/services" element={
                        <ProtectedRoute requireAdmin>
                            <AdminServices />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;