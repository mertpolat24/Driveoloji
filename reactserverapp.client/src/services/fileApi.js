/**
 * File API Service
 * FileController API'lerini kullanarak dosya işlemlerini yönetir
 */

// Development'ta Vite proxy kullan, production'da direkt backend URL'i kullan
const getApiBaseUrl = () => {
  // Vite dev server'da proxy kullan
  if (import.meta.env.DEV) {
    return '/api/file';
  }
  // Production'da environment variable'dan al veya varsayılan değer kullan
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7247';
  return `${backendUrl}/api/file`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Dosya yükleme
 * @param {File} file - Yüklenecek dosya
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{message: string, fileName: string}>}
 */
export const uploadFile = async (file, userId) => {
  if (!userId) {
    throw new Error('Kullanıcı ID gereklidir.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('uploadFile: Dosya yükleniyor:', file.name, 'Boyut:', file.size, 'UserId:', userId);
    const response = await fetch(`${API_BASE_URL}/upload?userId=${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: formData,
      // Content-Type header'ını fetch'e bırak (multipart/form-data boundary için gerekli)
      // credentials: 'include', // CORS için gerekirse
    });

    console.log('uploadFile: Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', response.status, errorText);
      throw new Error(errorText || `Dosya yükleme başarısız oldu (${response.status})`);
    }

    const result = await response.json();
    console.log('uploadFile: Upload başarılı, sonuç:', result);
    return result;
  } catch (error) {
    console.error('uploadFile: Upload error:', error);
    console.error('uploadFile: Error details:', error.message, error.stack);
    console.error('uploadFile: API_BASE_URL:', API_BASE_URL);
    
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
 * Dosya listesini getir
 * @param {string} userId - Kullanıcı ID'si
 * @param {number} retryCount - Retry sayacı (internal use)
 * @returns {Promise<string[]>} Dosya isimleri dizisi
 */
export const getFileList = async (userId, retryCount = 0) => {
  if (!userId) {
    throw new Error('Kullanıcı ID gereklidir.');
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 saniye

  try {
    console.log(`getFileList: İstek gönderiliyor (deneme ${retryCount + 1}/${MAX_RETRIES + 1})... UserId:`, userId);
    const response = await fetch(`${API_BASE_URL}/list?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // credentials: 'include', // CORS için gerekirse
    });

    console.log('getFileList: Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('File list API error:', response.status, errorText);
      
      // 500 hatası ise retry yap
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        console.log(`getFileList: ${response.status} hatası, ${RETRY_DELAY}ms sonra tekrar deneniyor...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return getFileList(userId, retryCount + 1);
      }
      
      throw new Error(`Dosya listesi alınamadı: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('getFileList: API\'den gelen dosya listesi:', data);
    return data;
  } catch (error) {
    console.error('getFileList error:', error);
    console.error('getFileList: API_BASE_URL:', API_BASE_URL);
    
    // Network hatası ise retry yap
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      if (retryCount < MAX_RETRIES) {
        console.log(`getFileList: Network hatası, ${RETRY_DELAY}ms sonra tekrar deneniyor...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return getFileList(userId, retryCount + 1);
      } else {
        // Retry'ler tükendiyse daha açıklayıcı hata mesajı
        const errorMsg = import.meta.env.DEV 
          ? 'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (https://localhost:7247).'
          : 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
        throw new Error(errorMsg);
      }
    }
    
    throw error;
  }
};

/**
 * Dosya indir
 * @param {string} fileName - İndirilecek dosya adı
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<Blob>}
 */
export const downloadFile = async (fileName, userId) => {
  if (!userId) {
    throw new Error('Kullanıcı ID gereklidir.');
  }

  // Dosya adını URL-safe hale getir
  const encodedFileName = encodeURIComponent(fileName);
  const response = await fetch(`${API_BASE_URL}/download/${encodedFileName}?userId=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Dosya bulunamadı');
    }
    throw new Error('Dosya indirme başarısız oldu');
  }

  return await response.blob();
};

/**
 * Dosya sil
 * @param {string} fileName - Silinecek dosya adı
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{message: string, fileName: string}>}
 */
export const deleteFile = async (fileName, userId) => {
  if (!userId) {
    throw new Error('Kullanıcı ID gereklidir.');
  }

  if (!fileName) {
    throw new Error('Dosya adı gereklidir.');
  }

  try {
    console.log('deleteFile: Dosya siliniyor:', fileName, 'UserId:', userId);
    const encodedFileName = encodeURIComponent(fileName);
    const response = await fetch(`${API_BASE_URL}/delete/${encodedFileName}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('deleteFile: Delete error:', response.status, errorText);
      throw new Error(errorText || `Dosya silme başarısız oldu (${response.status})`);
    }

    const result = await response.json();
    console.log('deleteFile: Dosya silindi, sonuç:', result);
    return result;
  } catch (error) {
    console.error('deleteFile: Delete error:', error);
    throw error;
  }
};

/**
 * Dosya boyutunu al (indirme yapmadan)
 * @param {string} fileName - Dosya adı
 * @returns {Promise<number>} Dosya boyutu (bytes)
 */
export const getFileSize = async (fileName) => {
  const encodedFileName = encodeURIComponent(fileName);
  const response = await fetch(`${API_BASE_URL}/download/${encodedFileName}`, {
    method: 'HEAD',
  });

  if (!response.ok) {
    return 0;
  }

  const contentLength = response.headers.get('content-length');
  return contentLength ? parseInt(contentLength, 10) : 0;
};
