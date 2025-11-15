import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Menu, LayoutDashboard } from 'lucide-react';
import { NAV_ITEMS, ROLES } from './constants';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import StorageManagementView from './views/StorageManagementView';
import SettingsView from './views/SettingsView';
import AdminManagementView from './views/AdminManagementView';
import DiskManagementView from './views/DiskManagementView';
import FilePreviewModal from './components/FilePreviewModal';
import { getAllUsers, getUser, updateUser as updateUserApi } from './services/userApi';

/**
 * Ana Uygulama Bileşeni
 */
const App = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop'ta varsayılan olarak açık
  const [activeView, setActiveView] = useState(NAV_ITEMS[0].id);
  const [previewFile, setPreviewFile] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // Kayıt ekranını göster/gizle

  const isLoggedIn = !!currentUser; // Giriş yapıldı mı?

  // Kullanıcı listesini API'den yükle (Admin ve SuperAdmin için)
  const loadUsers = useCallback(async () => {
    if (!currentUser || (currentUser.role !== ROLES.ADMIN && currentUser.role !== ROLES.SUPERADMIN)) return;
    
    setIsLoadingUsers(true);
    try {
      console.log('App: Kullanıcı listesi yükleniyor...');
      const users = await getAllUsers();
      console.log('App: Kullanıcı listesi alındı:', users);
      setAllUsers(users);
    } catch (error) {
      console.error('App: Kullanıcı listesi yüklenirken hata:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser]);

  // Admin ise kullanıcı listesini yükle
  useEffect(() => {
    if (currentUser && (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.SUPERADMIN)) {
      loadUsers();
    }
  }, [currentUser?.userId, currentUser?.role, loadUsers]);

  // Giriş başarılı olduğunda çağrılır
  const handleLogin = async (user) => {
    console.log('App: Giriş yapıldı, kullanıcı:', user);
    
    // API'den güncel kullanıcı bilgilerini çek
    try {
      const updatedUser = await getUser(user.userId);
      console.log('App: Güncel kullanıcı bilgileri alındı:', updatedUser);
      const userData = {
        ...updatedUser,
        files: updatedUser.files || [],
      };
      setCurrentUser(userData);
      
      // Session'ı localStorage'a kaydet (30 gün geçerli)
      const sessionData = {
        user: userData,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
    } catch (error) {
      console.error('App: Kullanıcı bilgileri alınamadı, login\'den gelen kullanıcı kullanılıyor:', error);
      const userData = {
        ...user,
        files: user.files || [],
      };
      setCurrentUser(userData);
      
      // Session'ı localStorage'a kaydet
      const sessionData = {
        user: userData,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
    }
    
    setActiveView(NAV_ITEMS[0].id); // Panoya yönlendir
  };

  // Sayfa yüklendiğinde session kontrolü yap
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const now = new Date();
          const expiresAt = new Date(session.expiresAt);
          
          // Session süresi dolmuş mu kontrol et
          if (now < expiresAt) {
            console.log('App: Session bulundu, kullanıcı otomatik giriş yapılıyor...');
            setCurrentUser(session.user);
          } else {
            console.log('App: Session süresi dolmuş, temizleniyor...');
            localStorage.removeItem('userSession');
          }
        }
      } catch (error) {
        console.error('App: Session kontrolü hatası:', error);
        localStorage.removeItem('userSession');
      }
    };

    checkSession();
  }, []);

  // Kullanıcı verilerini güncelleyen ana fonksiyon
  const updateUserData = useCallback(async (field, value) => {
    if (!currentUser) return;

    try {
      // Eğer dosya listesi güncelleniyorsa, sadece local state'i güncelle (API'ye göndermeye gerek yok)
      if (field === 'files') {
        const updatedUser = { ...currentUser, files: value };
        setCurrentUser(updatedUser);
        
        // Session'ı güncelle
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          session.user = updatedUser;
          localStorage.setItem('userSession', JSON.stringify(session));
        }
        
        // allUsers listesini de güncelle (eğer varsa)
        if (allUsers.length > 0) {
          const updatedUsers = allUsers.map(user =>
            user.userId === currentUser.userId ? updatedUser : user
          );
          setAllUsers(updatedUsers);
        }
        return;
      }

      // Diğer alanlar için API'ye gönder
      console.log('App: Kullanıcı güncelleniyor:', field, value);
      const updatedUser = await updateUserApi(currentUser.userId, { [field]: value });
      console.log('App: Kullanıcı güncellendi:', updatedUser);

      // Local state'i güncelle
      const userData = {
        ...updatedUser,
        files: currentUser.files || [], // Files'ı koru
      };
      setCurrentUser(userData);

      // Session'ı güncelle
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.user = userData;
        localStorage.setItem('userSession', JSON.stringify(session));
      }

      // allUsers listesini de güncelle (eğer varsa)
      if (allUsers.length > 0) {
        const updatedUsers = allUsers.map(user =>
          user.userId === currentUser.userId
            ? { ...updatedUser, files: user.files || [] }
            : user
        );
        setAllUsers(updatedUsers);
      }
    } catch (error) {
      console.error('App: Kullanıcı güncellenirken hata:', error);
      // Hata durumunda sadece local state'i güncelle (optimistic update)
      const updatedUser = { ...currentUser, [field]: value };
      setCurrentUser(updatedUser);
    }
  }, [currentUser, allUsers]);

  // Artık dosya listesi her view'da kendi useEffect'i ile API'den yükleniyor
  // App.jsx seviyesinde yüklemeye gerek yok

  // Çıkış yapıldığında çağrılır
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      // Session'ı temizle
      localStorage.removeItem('userSession');
      sessionStorage.removeItem('userSession');
      setCurrentUser(null);
      setIsSidebarOpen(false);
    }
  };

  // Mevcut kullanıcının dosyalarını ve kotasını al
  const currentFiles = useMemo(() => currentUser?.files || [], [currentUser]);
  const currentQuotaGB = useMemo(() => currentUser?.storageQuotaGB || 0, [currentUser]);

  // Depolama kullanımını dinamik olarak hesapla (MB cinsinden)
  const usedMB = useMemo(() => {
    return currentFiles.reduce((total, file) => total + file.size, 0);
  }, [currentFiles]);

  // Görünümü seçmek için switch case yapısı
  const renderContentView = useCallback(() => {
    if (!currentUser) return null;

    switch (activeView) {
          case 'dashboard':
            return <DashboardView
              userName={currentUser.userName}
              totalGB={currentQuotaGB}
              setActiveView={setActiveView}
              updateUserData={updateUserData}
              currentUser={currentUser}
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
        if (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.SUPERADMIN) {
          return <AdminManagementView
            allUsers={allUsers}
            setAllUsers={setAllUsers}
            loadUsers={loadUsers}
            isLoading={isLoadingUsers}
            currentUser={currentUser}
          />;
        }
        // Yetkisiz erişim durumunda panoya yönlendir
        setActiveView('dashboard');
        return null;

      case 'disk':
        if (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.SUPERADMIN) {
          return <DiskManagementView
            currentUser={currentUser}
          />;
        }
        // Yetkisiz erişim durumunda panoya yönlendir
        setActiveView('dashboard');
        return null;

      default:
        return <DashboardView
          userName={currentUser.userName}
          totalGB={currentQuotaGB}
          setActiveView={setActiveView}
          updateUserData={updateUserData}
          currentUser={currentUser}
        />;
    }
  }, [activeView, currentUser, currentQuotaGB, updateUserData, allUsers]);

  // Eğer giriş yapılmadıysa Login veya Register ekranını göster
  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <RegisterScreen
          onRegisterSuccess={handleLogin}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return <LoginScreen onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />;
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