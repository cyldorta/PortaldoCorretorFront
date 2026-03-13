import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-[#F5F5F7]">

      {/* Sidebar desktop — hover expand */}
      <div
        className="hidden lg:block flex-shrink-0"
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Sidebar mobile — overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <Sidebar collapsed={false} />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />
        {/* p-3 no mobile, p-6 no desktop, p-10 em telas grandes (TV) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-8 2xl:p-10">
          <div className="max-w-screen-2xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;
