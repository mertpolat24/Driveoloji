/**
 * User API Service
 * UserController API'lerini kullanarak kullanıcı işlemlerini yönetir
 */

// Development'ta Vite proxy kullan, production'da direkt backend URL'i kullan
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api/user';
  }
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7247';
  return `${backendUrl}/api/user`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Kullanıcı girişi
 * @param {string} email - Kullanıcı e-postası
 * @param {string} password - Kullanıcı şifresi
 * @returns {Promise<object>} Kullanıcı bilgileri (şifre hariç)
 */
export const login = async (email, password) => {
  try {
    console.log('userApi: Login isteği gönderiliyor...');
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('userApi: Login response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('userApi: Login error:', response.status, errorText);
      throw new Error(errorText || 'Giriş başarısız oldu');
    }

    const user = await response.json();
    console.log('userApi: Login başarılı, kullanıcı:', user);
    
    // Backend'den gelen role'ü küçük harfe çevir (ADMIN -> admin, USER -> user)
    if (user.role) {
      user.role = user.role.toLowerCase();
    }
    
    return user;
  } catch (error) {
    console.error('userApi: Login error:', error);
    throw error;
  }
};

/**
 * Tüm kullanıcıları getir (Admin için)
 * @returns {Promise<Array>} Kullanıcı listesi
 */
export const getAllUsers = async () => {
  try {
    console.log('userApi: Tüm kullanıcılar getiriliyor...');
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('userApi: GetAllUsers error:', response.status, errorText);
      throw new Error(`Kullanıcı listesi alınamadı: ${response.status}`);
    }

    const users = await response.json();
    console.log('userApi: Kullanıcı listesi alındı:', users);
    
    // Role'leri küçük harfe çevir
    return users.map(user => ({
      ...user,
      role: user.role ? user.role.toLowerCase() : 'user'
    }));
  } catch (error) {
    console.error('userApi: GetAllUsers error:', error);
    throw error;
  }
};

/**
 * Kullanıcı getir (ID ile)
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<object>} Kullanıcı bilgileri
 */
export const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Kullanıcı bulunamadı: ${response.status}`);
    }

    const user = await response.json();
    
    // Role'ü küçük harfe çevir
    if (user.role) {
      user.role = user.role.toLowerCase();
    }
    
    return user;
  } catch (error) {
    console.error('userApi: GetUser error:', error);
    throw error;
  }
};

/**
 * Kullanıcı kayıt (Public - Herkes kayıt olabilir)
 * @param {object} userData - Kullanıcı bilgileri
 * @returns {Promise<object>} Oluşturulan kullanıcı
 */
export const register = async (userData) => {
  try {
    console.log('userApi: Kullanıcı kaydı yapılıyor:', userData);
    
    const dataToSend = {
      userName: userData.userName || userData.name,
      userEmail: userData.userEmail || userData.email,
      userPassword: userData.userPassword || userData.password,
    };

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('userApi: Register error:', response.status, errorText);
      throw new Error(errorText || `Kayıt işlemi başarısız oldu: ${response.status}`);
    }

    const user = await response.json();
    console.log('userApi: Kullanıcı kaydı başarılı:', user);
    
    // Role'ü küçük harfe çevir
    if (user.role) {
      user.role = user.role.toLowerCase();
    }
    
    return user;
  } catch (error) {
    console.error('userApi: Register error:', error);
    throw error;
  }
};

/**
 * Yeni kullanıcı oluştur (Admin için)
 * @param {object} userData - Kullanıcı bilgileri
 * @returns {Promise<object>} Oluşturulan kullanıcı
 */
export const createUser = async (userData, currentUserId = null) => {
  try {
    console.log('userApi: Yeni kullanıcı oluşturuluyor:', userData);
    
    // Role'ü büyük harfe çevir (backend için)
      const dataToSend = {
        ...userData,
        role: userData.role || 'user', // Backend küçük harf bekliyor
        userEmail: userData.userEmail || userData.email,
        userPassword: userData.userPassword || userData.password,
        userName: userData.userName || userData.name,
        storageQuotaGB: userData.storageQuotaGB || userData.quota || 1,
      };

    const url = currentUserId 
      ? `${API_BASE_URL}?currentUserId=${encodeURIComponent(currentUserId)}`
      : API_BASE_URL;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('userApi: CreateUser error:', response.status, errorText);
      throw new Error(errorText || `Kullanıcı oluşturulamadı: ${response.status}`);
    }

    const user = await response.json();
    console.log('userApi: Kullanıcı oluşturuldu:', user);
    
    // Role'ü küçük harfe çevir
    if (user.role) {
      user.role = user.role.toLowerCase();
    }
    
    return user;
  } catch (error) {
    console.error('userApi: CreateUser error:', error);
    throw error;
  }
};

/**
 * Kullanıcı güncelle
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} userData - Güncellenecek kullanıcı bilgileri
 * @returns {Promise<object>} Güncellenmiş kullanıcı
 */
export const updateUser = async (userId, userData, currentUserId = null) => {
  try {
    console.log('userApi: Kullanıcı güncelleniyor:', userId, userData);
    
    // Role'ü büyük harfe çevir (backend için)
      const dataToSend = {
        ...userData,
        // Role'ü küçük harfe çevir (backend küçük harf bekliyor)
        role: userData.role ? userData.role.toLowerCase() : undefined,
      };

    const url = currentUserId
      ? `${API_BASE_URL}/${userId}?currentUserId=${encodeURIComponent(currentUserId)}`
      : `${API_BASE_URL}/${userId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('userApi: UpdateUser error:', response.status, errorText);
      throw new Error(errorText || `Kullanıcı güncellenemedi: ${response.status}`);
    }

    const user = await response.json();
    console.log('userApi: Kullanıcı güncellendi:', user);
    
    // Role'ü küçük harfe çevir
    if (user.role) {
      user.role = user.role.toLowerCase();
    }
    
    return user;
  } catch (error) {
    console.error('userApi: UpdateUser error:', error);
    throw error;
  }
};

/**
 * Kullanıcı sil
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId, currentUserId = null) => {
  try {
    console.log('userApi: Kullanıcı siliniyor:', userId);
    const url = currentUserId
      ? `${API_BASE_URL}/${userId}?currentUserId=${encodeURIComponent(currentUserId)}`
      : `${API_BASE_URL}/${userId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      console.error('userApi: DeleteUser error:', response.status, errorText);
      throw new Error(errorText || `Kullanıcı silinemedi: ${response.status}`);
    }

    console.log('userApi: Kullanıcı silindi');
  } catch (error) {
    console.error('userApi: DeleteUser error:', error);
    throw error;
  }
};

