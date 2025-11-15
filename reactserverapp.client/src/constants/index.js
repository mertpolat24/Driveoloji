// Sabitler
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Navigasyon Öğeleri - Hangi rollerin göreceği belirlenir
export const NAV_ITEMS = [
  { id: 'dashboard', name: 'Pano', icon: 'LayoutDashboard', roles: [ROLES.ADMIN, ROLES.USER] },
  { id: 'storage', name: 'Depolama Yönetimi', icon: 'HardDrive', roles: [ROLES.ADMIN, ROLES.USER] },
  { id: 'settings', name: 'Hesap Ayarları', icon: 'Settings', roles: [ROLES.ADMIN, ROLES.USER] },
  { id: 'admin', name: 'Yönetici Paneli', icon: 'KeyRound', roles: [ROLES.ADMIN] }, // Sadece Admin
];
