import { NavLink, useNavigate } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-slate-800 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Sidebar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">HireMate AI</h1>
          {name && <p className="text-sm text-gray-500 mt-1">{name}</p>}
        </div>

        <nav className="p-4 space-y-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <NavLink to="/preparation" className={linkClass}>
            Preparation Modules
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}