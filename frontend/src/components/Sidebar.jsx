import {
  LayoutDashboard,
  User,
  BookOpen,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Sidebar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">

        <h1 className="text-2xl font-bold text-blue-600">
          HireMate AI
        </h1>

        {name && (
          <p className="text-sm text-gray-500 mt-2">
            Welcome, <span className="font-semibold text-gray-800">{name}</span>
          </p>
        )}

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <User size={18} />
          Profile
        </NavLink>

        <NavLink to="/preparation" className={linkClass}>
          <GraduationCap size={18} />
          Preparation
        </NavLink>

        <NavLink to="/study" className={linkClass}>
          <BookOpen size={18} />
          Study Module
        </NavLink>

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-3 rounded-xl hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}