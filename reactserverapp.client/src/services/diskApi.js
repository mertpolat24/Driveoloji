/**
 * Disk Yönetimi API Servisi
 */

// Development'ta Vite proxy kullan, production'da direkt backend URL'i kullan
const getApiBaseUrl = () => {
  // Vite dev server'da proxy kullan
  if (import.meta.env.DEV) {
    return '/api/disk';
  }
  // Production'da environment variable'dan al veya varsayılan değer kullan
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7247';
  return `${backendUrl}/api/disk`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Tüm disk bilgilerini getir
 * @param {string} currentUserId - Mevcut kullanıcı ID'si
 * @returns {Promise<Array>} Disk listesi
 */
export const getDiskInfo = async (currentUserId) => {
  try {
    console.log('diskApi: Disk bilgileri alınıyor...');
    const response = await fetch(`${API_BASE_URL}/info?currentUserId=${encodeURIComponent(currentUserId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('diskApi: GetDiskInfo error:', response.status, errorText);
      throw new Error(errorText || `Disk bilgileri alınamadı: ${response.status}`);
    }

    const disks = await response.json();
    console.log('diskApi: Disk bilgileri alındı:', disks);
    return disks;
  } catch (error) {
    console.error('diskApi: GetDiskInfo error:', error);
    // Network hatası için daha açıklayıcı mesaj
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      const errorMsg = import.meta.env.DEV 
        ? 'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (https://localhost:7247).'
        : 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      throw new Error(errorMsg);
    }
    throw error;
  }
};

/**
 * Belirli bir diskteki kullanıcı kullanımlarını getir
 * @param {string} driveName - Disk adı (örn: "C:")
 * @param {string} currentUserId - Mevcut kullanıcı ID'si
 * @returns {Promise<Array>} Kullanıcı kullanım listesi
 */
export const getDiskUsage = async (driveName, currentUserId) => {
  try {
    console.log('diskApi: Disk kullanım bilgileri alınıyor...', driveName);
    const encodedDriveName = encodeURIComponent(driveName);
    const response = await fetch(`${API_BASE_URL}/usage/${encodedDriveName}?currentUserId=${encodeURIComponent(currentUserId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('diskApi: GetDiskUsage error:', response.status, errorText);
      throw new Error(errorText || `Disk kullanım bilgileri alınamadı: ${response.status}`);
    }

    const usage = await response.json();
    console.log('diskApi: Disk kullanım bilgileri alındı:', usage);
    return usage;
  } catch (error) {
    console.error('diskApi: GetDiskUsage error:', error);
    // Network hatası için daha açıklayıcı mesaj
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      const errorMsg = import.meta.env.DEV 
        ? 'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (https://localhost:7247).'
        : 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      throw new Error(errorMsg);
    }
    throw error;
  }
};

/**
 * Belirli bir kullanıcının belirli bir diskteki dosyalarını getir
 * @param {string} driveName - Disk adı (örn: "C:")
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} currentUserId - Mevcut kullanıcı ID'si
 * @returns {Promise<Array>} Dosya listesi
 */
export const getUserFiles = async (driveName, userId, currentUserId) => {
  try {
    console.log('diskApi: Kullanıcı dosyaları alınıyor...', driveName, userId);
    const encodedDriveName = encodeURIComponent(driveName);
    const encodedUserId = encodeURIComponent(userId);
    const response = await fetch(`${API_BASE_URL}/files/${encodedDriveName}/${encodedUserId}?currentUserId=${encodeURIComponent(currentUserId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('diskApi: GetUserFiles error:', response.status, errorText);
      throw new Error(errorText || `Dosya listesi alınamadı: ${response.status}`);
    }

    const files = await response.json();
    console.log('diskApi: Kullanıcı dosyaları alındı:', files);
    return files;
  } catch (error) {
    console.error('diskApi: GetUserFiles error:', error);
    // Network hatası için daha açıklayıcı mesaj
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      const errorMsg = import.meta.env.DEV 
        ? 'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (https://localhost:7247).'
        : 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      throw new Error(errorMsg);
    }
    throw error;
  }
};

/**
 * Dosya indir (sadece superadmin)
 * @param {string} driveName - Disk adı (örn: "C:")
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} fileName - Dosya adı
 * @param {string} currentUserId - Mevcut kullanıcı ID'si
 * @returns {Promise<Blob>} Dosya blob'u
 */
export const downloadFile = async (driveName, userId, fileName, currentUserId) => {
  try {
    console.log('diskApi: Dosya indiriliyor...', driveName, userId, fileName);
    const encodedDriveName = encodeURIComponent(driveName);
    const encodedUserId = encodeURIComponent(userId);
    const encodedFileName = encodeURIComponent(fileName);
    const response = await fetch(`${API_BASE_URL}/download/${encodedDriveName}/${encodedUserId}/${encodedFileName}?currentUserId=${encodeURIComponent(currentUserId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('diskApi: DownloadFile error:', response.status, errorText);
      throw new Error(errorText || `Dosya indirilemedi: ${response.status}`);
    }

    const blob = await response.blob();
    console.log('diskApi: Dosya indirildi:', blob);
    return blob;
  } catch (error) {
    console.error('diskApi: DownloadFile error:', error);
    throw error;
  }
};

