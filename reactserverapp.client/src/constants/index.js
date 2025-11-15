// Sabitler
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
};

// Navigasyon Öğeleri - Hangi rollerin göreceği belirlenir
export const NAV_ITEMS = [
  { id: 'dashboard', name: 'Pano', icon: 'LayoutDashboard', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.USER] }, // Super Admin, Admin ve User
  { id: 'storage', name: 'Depolama Yönetimi', icon: 'HardDrive', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.USER] }, // Super Admin, Admin ve User
  { id: 'settings', name: 'Hesap Ayarları', icon: 'Settings', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.USER] }, // Super Admin, Admin ve User
  { id: 'admin', name: 'Yönetici Paneli', icon: 'KeyRound', roles: [ROLES.SUPERADMIN, ROLES.ADMIN] }, // Super Admin ve Admin
  { id: 'disk', name: 'Disk Yönetimi', icon: 'HardDrive', roles: [ROLES.SUPERADMIN, ROLES.ADMIN] }, // Super Admin ve Admin
];
