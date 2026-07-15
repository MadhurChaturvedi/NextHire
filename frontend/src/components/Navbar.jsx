import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sun,
  Moon,
  Menu,
  X,
  Cpu,
  LogOut,
  LayoutDashboard,
  UploadCloud,
  UserCircle2,
  MessageSquare,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme) return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-250
    ${
      isActive(path)
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
    }
  `;

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-250">
              <Cpu size={20} className="animate-pulse-slow" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Next
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Hire
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/features" className={linkClass("/features")}>
              Features
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className={linkClass("/dashboard")}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link to="/upload" className={linkClass("/upload")}>
                  <UploadCloud size={16} />
                  Upload
                </Link>
                <Link to="/chat" className={linkClass("/chat")}>
                  <MessageSquare size={16} className="text-indigo-500" />
                  AI Assistant
                </Link>
                <Link to="/profile" className={linkClass("/profile")}>
                  <UserCircle2 size={16} />
                  Profile
                </Link>
              </>
            ) : null}
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/features"
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Upload Resume
              </Link>
              <Link
                to="/chat"
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                AI Assistant
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2 border-t border-slate-200/50 dark:border-slate-800/40">
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
