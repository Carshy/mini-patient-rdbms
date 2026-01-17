import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Calendar, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

function Layout({ children }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Doctors', path: '/doctors', icon: UserCog },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  const [collapsed, setCollapsed] = useState(false);

  // Start collapsed on small screens for better UX
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                Patient Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Backend Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header area - no toggle here; toggle placed in sidebar top-right */}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 w-64 transform transition-transform duration-300 ease-in-out z-40 ${
            collapsed ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Toggle inside sidebar: top-right */}
          <div className="relative">
            <div className="absolute right-3 top-3">
              <button
                aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
                onClick={() => setCollapsed((s) => !s)}
                className="bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md focus:outline-none"
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          <nav className="mt-14 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Floating handle visible when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Open sidebar"
            className="fixed top-24 left-0 z-50 -ml-3 bg-white border border-gray-200 rounded-r-md px-2 py-2 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Main content shifts when sidebar is visible */}
        <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-64'}`}>
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;