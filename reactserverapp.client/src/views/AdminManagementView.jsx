import React, { useState } from 'react';
import { KeyRound, Trash2, CheckCircle, Plus } from 'lucide-react';
import CardHeader from '../components/CardHeader';
import GenericModal from '../components/GenericModal';
import { ROLES } from '../constants';

/**
 * Yönetici Paneli Ekranı
 */
const AdminManagementView = ({ allUsers, setAllUsers }) => {
  const [feedback, setFeedback] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: ROLES.USER, quota: 50 });

  // Kullanıcı Ekleme
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setFeedback({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      return;
    }

    const emailExists = allUsers.some(user => user.userEmail === newUser.email);
    if (emailExists) {
      setFeedback({ message: 'Bu e-posta adresi zaten kullanılıyor.', type: 'error' });
      return;
    }

    const addedUser = {
      userName: newUser.name,
      userEmail: newUser.email,
      userId: 'usr-' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5),
      userPassword: newUser.password,
      role: newUser.role,
      storageQuotaGB: parseInt(newUser.quota, 10),
      files: [],
    };

    setAllUsers(prev => [...prev, addedUser]);
    setFeedback({ message: `${addedUser.userName} başarıyla eklendi!`, type: 'success' });
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', email: '', password: '', role: ROLES.USER, quota: 50 });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Kullanıcı Güncelleme (Rol, Kota)
  const handleUpdateUser = (userId, field, value) => {
    const updatedUsers = allUsers.map(user =>
      user.userId === userId ? { ...user, [field]: value } : user
    );
    setAllUsers(updatedUsers);
    setFeedback({ message: `Kullanıcı ${field === 'role' ? 'rolü' : 'kotası'} güncellendi.`, type: 'success' });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Kullanıcı Silme
  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      const updatedUsers = allUsers.filter(user => user.userId !== userId);
      setAllUsers(updatedUsers);
      setFeedback({ message: `${userName} başarıyla sistemden silindi.`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Yeni Kullanıcı Ekleme Modalı
  const AddUserModal = () => (
    <GenericModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Yeni Kullanıcı Ekle">
      <form onSubmit={handleAddUser} className="space-y-4">
        <input type="text" placeholder="İsim Soyisim" required className="w-full p-2 border rounded-lg"
          value={newUser.name} onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))} />
        <input type="email" placeholder="E-posta" required className="w-full p-2 border rounded-lg"
          value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))} />
        <input type="password" placeholder="Şifre" required className="w-full p-2 border rounded-lg"
          value={newUser.password} onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))} />
        <select className="w-full p-2 border rounded-lg"
          value={newUser.role} onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}>
          <option value={ROLES.USER}>Kullanıcı</option>
          <option value={ROLES.ADMIN}>Yönetici</option>
        </select>
        <div className='flex items-center space-x-2'>
          <input type="number" placeholder="Depolama Kotası (GB)" required className="w-full p-2 border rounded-lg"
            min="1" value={newUser.quota} onChange={(e) => setNewUser(p => ({ ...p, quota: e.target.value }))} />
          <span className='text-gray-500'>GB</span>
        </div>
        <div className="flex justify-end pt-2 space-x-3">
          <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">İptal</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition">Ekle</button>
        </div>
      </form>
    </GenericModal>
  );

  return (
    <div className="p-6">
      <CardHeader
        title="Yönetici Paneli"
        description="Tüm sistem kullanıcılarını yönetin: rol, kota ve hesap işlemleri."
        icon={KeyRound}
      />

      {feedback && (
        <div className={`p-3 mb-6 rounded-xl font-medium flex items-center 
          ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <CheckCircle className='w-5 h-5 mr-2' /> {feedback.message}
        </div>
      )}

      <button
        onClick={() => setIsAddUserModalOpen(true)}
        className="flex items-center px-4 py-2 mb-6 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        <Plus className='w-4 h-4 mr-2' /> Yeni Kullanıcı Ekle
      </button>

      <div className="bg-white rounded-xl shadow-xl border border-indigo-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim (ID)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota (GB)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {allUsers.map((user) => (
              <tr key={user.userId} className='hover:bg-gray-50'>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className='font-medium text-gray-900'>{user.userName}</div>
                  <div className='text-xs text-gray-400 font-mono'>{user.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userEmail}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateUser(user.userId, 'role', e.target.value)}
                    className={`p-1 text-sm rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 
                      ${user.role === ROLES.ADMIN ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-800 border-green-300'}`}
                    disabled={user.role === ROLES.ADMIN}
                  >
                    <option value={ROLES.USER}>Kullanıcı</option>
                    <option value={ROLES.ADMIN}>Yönetici</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    value={user.storageQuotaGB}
                    onChange={(e) => handleUpdateUser(user.userId, 'storageQuotaGB', parseInt(e.target.value, 10))}
                    className="p-1 w-20 text-sm border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    disabled={user.role === ROLES.ADMIN}
                  /> GB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.role === ROLES.ADMIN ? (
                    <span className='text-gray-400 text-xs'>Sistem Yöneticisi</span>
                  ) : (
                    <button
                      onClick={() => handleDeleteUser(user.userId, user.userName)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal />
    </div>
  );
};

export default AdminManagementView;
