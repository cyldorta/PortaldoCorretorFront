import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ collapsed }) {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Painel' },
    { path: '/admin/corretores', icon: Users, label: 'Corretores' },
    { path: '/admin/imoveis', icon: Home, label: 'Imoveis' },
    { path: '/admin/leads', icon: MessageSquare, label: 'Leads' },
  ];

  const isActive = (path) => location.pathname === path;

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
        {menuItems.map((item) => (
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

      {/* Logout */}
      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={logout}
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

export default Sidebar;