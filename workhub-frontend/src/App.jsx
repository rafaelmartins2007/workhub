import "./App.css";
import { Routes, Route } from "react-router-dom";

// import HomePage from "./pages/HomePage";
import LoginForm from "./pages/login/LoginForm";
import RegisterForm from "./pages/register/RegisterForm";
import Spaces from "./pages/spaces/Spaces";
// import MyReservations from "./pages/MyReservations";

// Admin (vamos criar depois)
// import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Spaces />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/spaces" element={<Spaces />} />
      {/* <Route path="/my-reservations" element={<MyReservations />} /> */}

      {/* Admin */}
      {/* <Route path="/admin" element={<AdminDashboard />} /> */}
    </Routes>
  );
}

export default App;