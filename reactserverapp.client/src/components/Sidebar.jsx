import React, { useMemo } from 'react';
import { Menu, User, ArrowLeft, LogOut, LayoutDashboard, HardDrive, Settings, KeyRound } from 'lucide-react';
import { NAV_ITEMS, ROLES } from '../constants';

// Icon mapping
const iconMap = {
  LayoutDashboard,
  HardDrive,
  Settings,
  KeyRound,
};

/**
 * Sol Taraftaki Açılır Kapanır Navbar Bileşeni
 */
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeView, setActiveView, currentUser, handleLogout }) => {
  // Kullanıcının rolüne göre menü öğelerini filtrele
  const filteredNavItems = useMemo(() => {
    return NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser.role]);

  // Mobil cihazlarda menü öğesine tıklanıldığında menüyü kapatmak için yardımcı işlev
  const handleNavClick = (id) => {
    setActiveView(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    // Sidebar Ana Konteyneri
    <div
      // Mobile: w-0 if closed, w-64 if open. Desktop: w-20 if closed, w-64 if open.
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-indigo-800 shadow-2xl z-40 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden`}
    >
      <div className="flex flex-col h-full p-4 text-white">
        {/* Logo, Başlık ve Toggle Butonu */}
        <div className="flex items-center justify-between pb-4 border-b border-white/20 flex-shrink-0 mb-4">
          {/* Logo/Başlık - Sadece açıkken görünür */}
          <h1 className={`text-xl font-bold text-white mr-auto transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
            <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">KRAL DEPODA</span>
          </h1>
          {/* Toggle Butonu - Her zaman görünür */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className={`text-white hover:bg-white/20 p-2 rounded-xl transition 
              ${!isSidebarOpen && 'mx-auto'}`}
            aria-label="Menüyü Aç/Kapat"
          >
            {isSidebarOpen ? <ArrowLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Kullanıcı Profili (İçerik sadece açıkken görünür) */}
        <div className={`bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-6 flex-shrink-0 transition-all duration-300 overflow-hidden border border-white/20 ${isSidebarOpen ? 'opacity-100 h-auto' : 'opacity-0 h-0 p-0 m-0'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 p-2 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className='overflow-hidden'>
              <p className={`font-bold text-white truncate ${!isSidebarOpen && 'hidden'}`}>{currentUser.userName}</p>
              <p className={`text-xs text-white/80 truncate ${!isSidebarOpen && 'hidden'}`}>{currentUser.userEmail}</p>
              <span className={`px-2 py-0.5 mt-1 text-xs rounded-full font-semibold ${!isSidebarOpen && 'hidden'} ${currentUser.role === ROLES.ADMIN
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-emerald-400 text-emerald-900'
              }`}>
                {currentUser.role === ROLES.ADMIN ? 'Yönetici' : 'Kullanıcı'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigasyon Linkleri */}
        <nav className="flex-grow space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = iconMap[item.icon];
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group 
                  ${isActive
                    ? 'bg-white text-indigo-700 shadow-xl transform scale-105 font-semibold'
                    : 'text-white/90 hover:bg-white/20 hover:text-white hover:transform hover:scale-105'
                  }
                ${!isSidebarOpen && 'justify-center'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-white/90 group-hover:text-white'}`} />
                {/* Metin sadece açıkken görünür */}
                <span className={`ml-3 font-medium whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Çıkış Butonu */}
        <div className={`pt-4 border-t border-white/20 flex-shrink-0`}>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-xl text-white bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 hover:border-red-400/50 transition duration-150 
              ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 text-white flex-shrink-0" />
            {/* Metin sadece açıkken görünür */}
            <span className={`ml-3 font-medium whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
