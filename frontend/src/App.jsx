import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import PreparationModules from "./pages/PreparationModules.jsx";
import StudyModule from "./pages/StudyModule.jsx";

const isAuthed = () => !!localStorage.getItem("token");

const Private = ({ children }) => (isAuthed() ? children : <Navigate to="/login" />);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <Private>
            <Dashboard />
          </Private>
        }
      />
      <Route
        path="/profile"
        element={
          <Private>
            <Profile />
          </Private>
        }
      />
            <Route
        path="/preparation"
        element={
          <Private>
            <PreparationModules />
          </Private>
        }
      />
       <Route
        path="/study"
        element={
          <Private>
            <StudyModule />
          </Private>
        }
      />
    </Routes>
  );
}
