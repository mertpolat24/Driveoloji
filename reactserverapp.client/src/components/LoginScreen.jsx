import React, { useState } from 'react';
import { HardDrive, Zap } from 'lucide-react';
import { login } from '../services/userApi';

/**
 * Giriş Ekranı Bileşeni
 */
const LoginScreen = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('LoginScreen: Giriş denemesi yapılıyor...');
      const user = await login(email, password);
      console.log('LoginScreen: Giriş başarılı, kullanıcı:', user);
      
      // API'den gelen kullanıcıyı formatla (files array olarak)
      const formattedUser = {
        ...user,
        files: user.files || [],
      };
      
      setIsLoading(false);
      onLogin(formattedUser); // Başarılı giriş: tüm kullanıcı nesnesini gönder
    } catch (error) {
      console.error('LoginScreen: Giriş hatası:', error);
      setIsLoading(false);
      setError(error.message || 'Geçersiz e-posta veya şifre.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 font-[Inter]">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <HardDrive className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Serveroloji Giriş</h1>
          <p className="text-sm text-gray-600 mt-2">Lütfen hesabınıza giriş yapın</p>
        </div>
        <form onSubmit={handleLoginAttempt} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
            <input
              type="email"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
              <Zap className='w-4 h-4 mr-2' /> {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-semibold transition duration-300 transform
              ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'}`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Giriş Yap'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => onShowRegister && onShowRegister()}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            Hesabınız yok mu? Kayıt olun →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
