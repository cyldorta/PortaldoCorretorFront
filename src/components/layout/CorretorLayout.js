import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Building2, Users, LogOut, Menu } from 'lucide-react';

const MENU_ITEMS = [
  { path: '/corretor/dashboard', icon: Home,      label: 'Dashboard'    },
  { path: '/corretor/imoveis',   icon: Building2, label: 'Meus Imoveis' },
  { path: '/corretor/leads',     icon: Users,     label: 'Meus Leads'   },
];

const PAGE_TITLES = {
  '/corretor/dashboard': 'Dashboard',
  '/corretor/imoveis':   'Meus Imoveis',
  '/corretor/leads':     'Meus Leads',
};

// ── SIDEBAR ──────────────────────────────────────────────────
function CorretorSidebar({ collapsed }) {
  const location         = useLocation();
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={`
        relative flex flex-col bg-[#111111] text-white h-screen flex-shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/[0.06] h-[57px] transition-all duration-300 ${collapsed ? 'justify-center px-4' : 'px-5'}`}>
        {collapsed ? (
          <span className="text-white font-black text-xl">M</span>
        ) : (
          <img src="/logoMOVV.png" alt="MOVV" className="h-8 object-contain" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={`
              relative flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group
              ${collapsed ? 'justify-center px-0' : 'px-3'}
              ${isActive(item.path)
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}
            `}
          >
            {isActive(item.path) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-full" />
            )}

            <item.icon size={20} className="flex-shrink-0" />

            <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              {item.label}
            </span>

            {/* Tooltip */}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.04]">
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-0.5">
              Logado como
            </p>
            <p className="text-sm text-white font-semibold truncate">{user?.nomeCompleto}</p>
            <p className="text-xs text-white/30 truncate">{user?.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sair' : undefined}
          className={`
            flex items-center gap-3 py-3 rounded-xl w-full
            text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${collapsed ? 'justify-center px-0' : 'px-3'}
          `}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            Sair
          </span>
        </button>
      </div>
    </div>
  );
}

// ── HEADER ───────────────────────────────────────────────────
function CorretorHeader({ toggleSidebar, sidebarCollapsed }) {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'MOVV';
  const initial   = (user?.nomeCompleto || 'C').charAt(0).toUpperCase();

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-black/[0.06] shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-5 py-3">

        {/* Esquerda */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-black/[0.06] transition-colors text-gray-500"
          >
            <Menu size={20} />
          </button>

          {/* Logo aparece no header quando sidebar recolhida */}
          <div
            className={`
              hidden lg:flex items-center gap-3 overflow-hidden transition-all duration-300
              ${sidebarCollapsed ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}
            `}
          >
            <img src="/logoMOVV.png" alt="MOVV" className="h-7 object-contain flex-shrink-0" />
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
          </div>

          <h2 className="text-base font-semibold text-gray-700 hidden lg:block">
            {pageTitle}
          </h2>
        </div>

        {/* Direita */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user?.nomeCompleto || 'Corretor'}
            </p>
            <p className="text-xs text-gray-400">Corretor</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
            <span className="text-white text-sm font-bold">{initial}</span>
          </div>
        </div>

      </div>
    </header>
  );
}

// ── LAYOUT ───────────────────────────────────────────────────
function CorretorLayout({ children }) {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-[#F5F5F7]">

      {/* Sidebar desktop — hover controlado aqui */}
      <div
        className="hidden lg:block"
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        <CorretorSidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Sidebar mobile — overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <CorretorSidebar collapsed={false} />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <CorretorHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

    </div>
  );
}

export default CorretorLayout;