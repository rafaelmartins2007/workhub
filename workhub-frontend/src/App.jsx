import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginForm from "./pages/login/LoginForm";
import RegisterForm from "./pages/register/RegisterForm";
import Spaces from "./pages/spaces/Spaces";
import MyReservations from "./pages/client/MyReservations";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Spaces />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/spaces" element={<Spaces />} />
      <Route path="/reservations/my" element={<MyReservations />} />
    </Routes>
  );
}

export default App;