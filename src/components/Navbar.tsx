import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, History, User, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-gray-900 bg-gray-100 font-medium"
      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50";

  const navLinks = [
    { to: "/historico", icon: <History size={15} />, label: "Histórico" },
    ...(user ? [{ to: "/perfil", icon: <User size={15} />, label: "Perfil" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">
            Confere<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${isActive(l.to)}`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all ml-2"
            >
              <LogOut size={15} />
              Sair
            </button>
          ) : (
            <Link
              to="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ml-2 ${isActive("/login")}`}
            >
              <LogIn size={15} />
              Entrar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-2 flex flex-col gap-0.5 bg-white animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${isActive(l.to)}`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={15} />
              Sair
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <LogIn size={15} />
              Entrar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
