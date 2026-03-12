import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

function Header({ toggleSidebar, sidebarCollapsed }) {
  const { user } = useAuth();

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
          <div className={`hidden lg:flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}`}>
            <img src="/logoMOVV.png" alt="MOVV" className="h-7 object-contain flex-shrink-0" />
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
          </div>

          <h2 className="text-base font-semibold text-gray-700 hidden lg:block">
            Painel Administrativo
          </h2>
        </div>

        {/* Direita */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user?.username || 'Administrador'}
            </p>
            <p className="text-xs text-gray-400">{user?.role || 'ADMIN'}</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-full flex items-center justify-center shadow-md shadow-violet-500/30 flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {(user?.username || user?.nomeCompleto || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;