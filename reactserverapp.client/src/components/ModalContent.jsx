import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import GenericModal from './GenericModal';

// Alt Modal Bileşeni (SettingsView için)
const ModalContent = ({ isOpen, onClose, currentUser, handleUpdate }) => {
  const field = isOpen;
  let title = '';
  let label = '';
  let inputType = '';
  let currentValue = '';

  switch (field) {
    case 'name':
      title = 'İsim Güncelle'; label = 'Yeni İsim'; inputType = 'text'; currentValue = currentUser.userName; break;
    case 'email':
      title = 'E-posta Güncelle'; label = 'Yeni E-posta'; inputType = 'email'; currentValue = currentUser.userEmail; break;
    case 'password':
      title = 'Şifre Değiştir'; inputType = 'password'; break;
    default: return null;
  }

  // Şifre değiştirme için özel state'ler
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newValue, setNewValue] = useState(currentValue);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (inputType === 'password') {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setNewValue(currentValue);
      }
      setError('');
      setShowConfirmDialog(false);
    }
  }, [isOpen, currentValue, inputType]);

  const handleSave = () => {
    setError('');
    
    if (inputType === 'password') {
      // Şifre değiştirme validasyonu
      if (!currentPassword) {
        setError('Mevcut şifrenizi girin.');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setError('Yeni şifre en az 6 karakter olmalıdır.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Yeni şifreler eşleşmiyor.');
        return;
      }
      
      // Mevcut şifre kontrolü - API'den kontrol etmek için önce login yapalım
      // Burada sadece onay dialogunu göster, gerçek kontrol handleUpdate'te yapılacak
      setShowConfirmDialog(true);
      return;
    }

    if (!newValue) {
      setError('Lütfen geçerli bir değer girin.');
      return;
    }

    if (inputType === 'email' && !newValue.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    handleUpdate(field, newValue);
    onClose();
  };

  const handleConfirmPasswordChange = async () => {
    setShowConfirmDialog(false);
    // Mevcut şifre kontrolü için login API'sini kullan
    try {
      const { login } = await import('../services/userApi');
      // Mevcut şifreyi kontrol et
      await login(currentUser.userEmail, currentPassword);
      // Şifre doğru, güncelle
      await handleUpdate('password', newPassword);
      onClose();
    } catch (error) {
      setError('Mevcut şifre yanlış.');
    }
  };

  // Şifre değiştirme için özel form
  if (inputType === 'password') {
    return (
      <>
        <GenericModal isOpen={!!isOpen && !showConfirmDialog} onClose={onClose} title={title}>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Şifre
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre (En az 6 karakter)
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Yeni şifrenizi girin"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <Zap className='w-4 h-4 mr-1' /> {error}
              </p>
            )}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Devam Et
              </button>
            </div>
          </div>
        </GenericModal>

        {/* Onay Dialogu */}
        <GenericModal isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} title="Şifre Değiştirmeyi Onayla">
          <div className="space-y-4">
            <p className="text-gray-700">
              Şifrenizi değiştirmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmPasswordChange}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Onayla
              </button>
            </div>
          </div>
        </GenericModal>
      </>
    );
  }

  // İsim ve E-posta için normal form
  return (
    <GenericModal isOpen={!!isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-gray-500 mb-4">
        Mevcut değer: <span className="font-medium text-gray-700">{currentValue}</span>
      </p>
      <label htmlFor="new-value" className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id="new-value"
        type={inputType}
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-3"
        placeholder={label}
      />
      {error && <p className="text-sm text-red-500 mb-3 flex items-center"><Zap className='w-4 h-4 mr-1' /> {error}</p>}
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Kaydet
        </button>
      </div>
    </GenericModal>
  );
};

export default ModalContent;
