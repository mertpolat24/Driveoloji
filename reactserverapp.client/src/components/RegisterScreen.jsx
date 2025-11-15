import React, { useState } from 'react';
import { HardDrive, Zap, CheckCircle, UserPlus } from 'lucide-react';
import { register } from '../services/userApi';

/**
 * Kayıt Ekranı Bileşeni
 */
const RegisterScreen = ({ onRegisterSuccess, onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasyon
    if (!name || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('RegisterScreen: Kayıt işlemi başlatılıyor...');
      
      const userData = {
        userName: name,
        userEmail: email,
        userPassword: password,
        role: 'user', // Kayıt olan kullanıcılar her zaman user
        storageQuotaGB: 2 // Yeni kullanıcılar 2 GB ile başlar
      };

      const user = await register(userData);
      console.log('RegisterScreen: Kayıt başarılı, kullanıcı:', user);
      
      setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
      setIsLoading(false);
      
      // 2 saniye sonra login ekranına yönlendir
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(user);
        } else if (onBackToLogin) {
          onBackToLogin();
        }
      }, 2000);
    } catch (error) {
      console.error('RegisterScreen: Kayıt hatası:', error);
      setIsLoading(false);
      setError(error.message || 'Kayıt işlemi başarısız oldu.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 font-[Inter]">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <UserPlus className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Yeni Hesap Oluştur</h1>
          <p className="text-sm text-gray-600 mt-2">2 GB ücretsiz depolama alanı kazanın</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İsim Soyisim</label>
            <input
              type="text"
              placeholder="Adınız ve soyadınız"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
            <input
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre (En az 6 karakter)</label>
            <input
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
            <input
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
              <Zap className='w-4 h-4 mr-2' /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg flex items-center">
              <CheckCircle className='w-4 h-4 mr-2' /> {success}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-semibold transition duration-300 transform
              ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kayıt Olunuyor...
              </>
            ) : 'Kayıt Ol'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            ← Zaten hesabınız var mı? Giriş yapın
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

