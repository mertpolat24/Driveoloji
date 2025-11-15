import React, { useState, useMemo, useCallback } from 'react';
import { Menu, LayoutDashboard } from 'lucide-react';
import { INITIAL_MOCK_USERS } from './data/mockData';
import { NAV_ITEMS, ROLES } from './constants';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import StorageManagementView from './views/StorageManagementView';
import SettingsView from './views/SettingsView';
import AdminManagementView from './views/AdminManagementView';
import FilePreviewModal from './components/FilePreviewModal';

/**
 * Ana Uygulama Bileşeni
 */
const App = () => {
  const [allUsers, setAllUsers] = useState(INITIAL_MOCK_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop'ta varsayılan olarak açık
  const [activeView, setActiveView] = useState(NAV_ITEMS[0].id);
  const [previewFile, setPreviewFile] = useState(null);

  const isLoggedIn = !!currentUser; // Giriş yapıldı mı?

  // Giriş başarılı olduğunda çağrılır
  const handleLogin = (user) => {
    // allUsers'dan güncel kullanıcı verisini al
    const updatedUser = allUsers.find(u => u.userId === user.userId) || user;
    setCurrentUser(updatedUser);
    setActiveView(NAV_ITEMS[0].id); // Panoya yönlendir
  };

  // Çıkış yapıldığında çağrılır
  const handleLogout = () => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
  };

  // Mevcut kullanıcının dosyalarını ve kotasını al
  const currentFiles = useMemo(() => currentUser?.files || [], [currentUser]);
  const currentQuotaGB = useMemo(() => currentUser?.storageQuotaGB || 0, [currentUser]);

  // Depolama kullanımını dinamik olarak hesapla (MB cinsinden)
  const usedMB = useMemo(() => {
    return currentFiles.reduce((total, file) => total + file.size, 0);
  }, [currentFiles]);

  // Kullanıcı verilerini güncelleyen ana fonksiyon
  const updateUserData = useCallback((field, value) => {
    if (!currentUser) return;

    // allUsers listesini güncelle
    const updatedUsers = allUsers.map(user => {
      if (user.userId === currentUser.userId) {
        // Özel durum: Eğer dosya listesi güncelleniyorsa, doğrudan yeni değeri kullan
        if (field === 'files') {
          return { ...user, files: value };
        }
        // Diğer tüm alanlar için
        return { ...user, [field]: value };
      }
      return user;
    });

    setAllUsers(updatedUsers);

    // Güncellenen kullanıcıyı setCurrentUser ile de ayarla
    const updatedCurrentUser = updatedUsers.find(user => user.userId === currentUser.userId);
    if (updatedCurrentUser) {
      setCurrentUser(updatedCurrentUser);
    }
  }, [allUsers, currentUser]);

  // Görünümü seçmek için switch case yapısı
  const renderContentView = useCallback(() => {
    if (!currentUser) return null;

    switch (activeView) {
      case 'dashboard':
        return <DashboardView
          userName={currentUser.userName}
          mockFiles={currentFiles}
          totalGB={currentQuotaGB}
          usedMB={usedMB}
          setActiveView={setActiveView}
          updateUserData={updateUserData}
        />;

      case 'storage':
        return <StorageManagementView
          currentUser={currentUser}
          updateUserData={updateUserData}
          setPreviewFile={setPreviewFile}
        />;

      case 'settings':
        return <SettingsView
          currentUser={currentUser}
          updateUserData={updateUserData}
        />;

      case 'admin':
        if (currentUser.role === ROLES.ADMIN) {
          return <AdminManagementView
            allUsers={allUsers}
            setAllUsers={setAllUsers}
          />;
        }
        // Yetkisiz erişim durumunda panoya yönlendir
        setActiveView('dashboard');
        return null;

      default:
        return <DashboardView
          userName={currentUser.userName}
          mockFiles={currentFiles}
          totalGB={currentQuotaGB}
          usedMB={usedMB}
          setActiveView={setActiveView}
          updateUserData={updateUserData}
        />;
    }
  }, [activeView, currentUser, currentFiles, currentQuotaGB, usedMB, updateUserData, allUsers]);

  // Eğer giriş yapılmadıysa sadece Giriş Ekranını göster
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Masaüstünde menü açık/kapalı durumuna göre ana içeriğin sol margin'i
  const mainMarginClass = isSidebarOpen ? 'md:ml-64' : 'md:ml-0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 font-[Inter] flex">
      {/* Sidebar Toggle Butonu - Mobile özel (sidebar kapalıyken w-0 olduğu için dışarıda olmalı) */}
      {/* Bu buton, mobil cihazlarda kapalı menüyü açar. Açık menü içerisindeki buton hem mobil hem desktop'ta kapatmayı sağlar. */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl z-50 hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-110"
          aria-label="Menüyü Aç/Kapat"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Bileşeni */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      {/* Mobil Cihazlarda Sidebar Açıkken Arka Planı Karartma */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Ana İçerik Alanı - Desktop'ta sidebar genişliğine göre margin alır */}
      <main className={`flex-grow p-4 md:p-6 lg:p-8 transition-all duration-300 relative ${mainMarginClass}`}>
        {/* GLOBAL PANO BUTONU - Sadece Pano dışındaki ekranlarda görünür */}
        {activeView !== 'dashboard' && (
          <button
            onClick={() => setActiveView('dashboard')}
            className="fixed top-4 right-4 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition duration-150 transform hover:scale-110"
            title="Ana Sayfaya Git"
            aria-label="Ana Sayfaya Git"
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
        )}

        <div className="max-w-7xl mx-auto min-h-[95vh] bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {renderContentView()}
        </div>
      </main>

      {/* Önizleme Modalı */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};

export default App;