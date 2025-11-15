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
      title = 'Şifre Değiştir'; label = 'Yeni Şifre (En az 6 karakter)'; inputType = 'password'; currentValue = currentUser.userPassword; break;
    default: return null;
  }

  const [newValue, setNewValue] = useState(currentValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewValue(inputType === 'password' ? '' : currentValue);
      setError('');
    }
  }, [isOpen, currentValue, inputType]);

  const handleSave = () => {
    setError('');
    if (!newValue || (inputType === 'password' && newValue.length < 6)) {
      setError('Lütfen geçerli bir değer girin (Şifre en az 6 karakter olmalı).');
      return;
    }

    if (inputType === 'email' && !newValue.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    handleUpdate(field, newValue);
    onClose();
  };

  return (
    <GenericModal isOpen={!!isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-gray-500 mb-4">
        Mevcut değer: <span className="font-medium text-gray-700">{inputType === 'password' ? '********' : currentValue}</span>
      </p>
      <label htmlFor="new-value" className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id="new-value"
        type={inputType === 'password' ? 'password' : inputType}
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
