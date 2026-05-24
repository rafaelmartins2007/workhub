import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import LoginForm from "./pages/login/LoginForm";
import RegisterForm from "./pages/register/RegisterForm";
import Spaces from "./pages/spaces/Spaces";
import SpaceDetail from "./pages/spaces/SpaceDetail";
import MyReservations from "./pages/client/MyReservations";
import Profile from "./pages/client/Profile";

function App() {
    return (
        <div className="App">
            <Navbar />
            <main>
                <Routes>
                    <Route path="/"                  element={<Spaces />} />
                    <Route path="/login"             element={<LoginForm />} />
                    <Route path="/register"          element={<RegisterForm />} />
                    <Route path="/spaces"            element={<Spaces />} />
                    <Route path="/spaces/:id"        element={<SpaceDetail />} />
                    <Route path="/reservations/my"   element={<MyReservations />} />
                    <Route path="/profile"           element={<Profile />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;