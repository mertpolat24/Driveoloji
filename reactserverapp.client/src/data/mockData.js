import { ROLES } from '../constants';

// Mock Dosya Listesi (Boş)
export const INITIAL_MOCK_FILES = [];

// Mock Kullanıcı Verileri
export const INITIAL_MOCK_USERS = [
  {
    userName: "Admin Kral",
    userEmail: "admin@sistem.com",
    userId: "adm-a1b2c3d4",
    userPassword: "adminpassword",
    role: ROLES.ADMIN,
    storageQuotaGB: 500, // Yönetici kotası
    files: INITIAL_MOCK_FILES,
  },
  {
    userName: "Normal Kullanıcı",
    userEmail: "user@sistem.com",
    userId: "usr-8a9b0c1d",
    userPassword: "userpassword",
    role: ROLES.USER,
    storageQuotaGB: 100, // Normal kullanıcı kotası
    files: [],
  }
];
