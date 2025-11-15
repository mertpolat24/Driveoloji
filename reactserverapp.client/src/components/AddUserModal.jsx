import React from 'react';
import GenericModal from './GenericModal';
import { ROLES } from '../constants';

/**
 * Yeni Kullanıcı Ekleme Modalı
 * Ayrı component olarak tanımlandı - focus kaybını önlemek için
 */
const AddUserModal = ({ isOpen, onClose, newUser, setNewUser, handleAddUser, currentUser }) => {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="Yeni Kullanıcı Ekle">
      <form onSubmit={handleAddUser} className="space-y-4">
        <input 
          type="text" 
          placeholder="İsim Soyisim" 
          required 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={newUser.name} 
          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))} 
        />
        <input 
          type="email" 
          placeholder="E-posta" 
          required 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={newUser.email} 
          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} 
        />
        <input 
          type="password" 
          placeholder="Şifre" 
          required 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={newUser.password} 
          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} 
        />
        <select 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={newUser.role} 
          onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
          disabled={currentUser?.role !== ROLES.SUPERADMIN && newUser.role !== ROLES.USER}
        >
          <option value={ROLES.USER}>Kullanıcı</option>
          {currentUser?.role === ROLES.SUPERADMIN && <option value={ROLES.ADMIN}>Yönetici</option>}
          {currentUser?.role === ROLES.SUPERADMIN && <option value={ROLES.SUPERADMIN}>Süper Yönetici</option>}
        </select>
        <div className='flex items-center space-x-2'>
          <input 
            type="number" 
            placeholder="Depolama Kotası (GB)" 
            required 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="1" 
            value={newUser.quota} 
            onChange={(e) => setNewUser(prev => ({ ...prev, quota: e.target.value }))} 
          />
          <span className='text-gray-500 whitespace-nowrap'>GB</span>
        </div>
        <div className="flex justify-end pt-2 space-x-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            İptal
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            Ekle
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default React.memo(AddUserModal);

