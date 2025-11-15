import React, { useState, useCallback } from 'react';
import { KeyRound, Trash2, CheckCircle, Plus } from 'lucide-react';
import CardHeader from '../components/CardHeader';
import AddUserModal from '../components/AddUserModal';
import { ROLES } from '../constants';
import { createUser, updateUser, deleteUser } from '../services/userApi';

/**
 * Yönetici Paneli Ekranı
 */
const AdminManagementView = ({ allUsers, setAllUsers, loadUsers, isLoading, currentUser }) => {
  const [feedback, setFeedback] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: ROLES.USER, quota: 50 });

  // Kullanıcı Ekleme - useCallback ile memoize edildi (focus kaybını önlemek için)
  const handleAddUser = useCallback(async (e) => {
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

    // Onay mesajı
    const confirmMessage = `Yeni kullanıcı oluşturulacak:\n\nİsim: ${newUser.name}\nE-posta: ${newUser.email}\nRol: ${newUser.role === ROLES.ADMIN ? 'Yönetici' : 'Kullanıcı'}\nKota: ${newUser.quota} GB\n\nDevam etmek istediğinize emin misiniz?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setFeedback({ message: 'Kullanıcı oluşturuluyor...', type: 'info' });
      
      const userData = {
        userName: newUser.name,
        userEmail: newUser.email,
        userPassword: newUser.password,
        role: newUser.role,
        storageQuotaGB: parseInt(newUser.quota, 10),
        files: [],
      };

      const addedUser = await createUser(userData);
      console.log('AdminManagementView: Kullanıcı oluşturuldu:', addedUser);

      // Local state'i güncelle
      setAllUsers(prev => [...prev, { ...addedUser, files: [] }]);
      setFeedback({ message: `${addedUser.userName} başarıyla eklendi!`, type: 'success' });
      setIsAddUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: ROLES.USER, quota: 50 });
      
      // Parent'tan listeyi yenile
      if (loadUsers) {
        await loadUsers();
      }
    } catch (error) {
      console.error('AdminManagementView: Kullanıcı ekleme hatası:', error);
      setFeedback({ message: error.message || 'Kullanıcı eklenirken bir hata oluştu.', type: 'error' });
    }
    
    setTimeout(() => setFeedback(null), 4000);
  }, [newUser, allUsers, loadUsers]);

  // Kullanıcı Güncelleme (Rol, Kota)
  const handleUpdateUser = async (userId, field, value) => {
    const user = allUsers.find(u => u.userId === userId);
    if (!user) return;

    // Superadmin kendi rolünü değiştiremez
    if (field === 'role' && currentUser?.role === ROLES.SUPERADMIN && user.userId === currentUser.userId) {
      setFeedback({ message: 'Kendi rolünüzü değiştiremezsiniz.', type: 'error' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // Normal admin rol değiştiremez
    if (field === 'role' && currentUser?.role === ROLES.ADMIN && currentUser?.role !== ROLES.SUPERADMIN) {
      setFeedback({ message: 'Normal admin kullanıcı rollerini değiştiremez.', type: 'error' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // Normal admin admin kullanıcıları güncelleyemez
    if (currentUser?.role === ROLES.ADMIN && (user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN)) {
      setFeedback({ message: 'Normal admin admin kullanıcıları güncelleyemez.', type: 'error' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // Rol değiştirme için onay
    if (field === 'role') {
      const roleNames = {
        [ROLES.SUPERADMIN]: 'Süper Yönetici',
        [ROLES.ADMIN]: 'Yönetici',
        [ROLES.USER]: 'Kullanıcı'
      };
      const newRole = roleNames[value] || 'Kullanıcı';
      const currentRole = roleNames[user.role] || 'Kullanıcı';
      const confirmMessage = `${user.userName} kullanıcısının rolü "${currentRole}" dan "${newRole}" olarak değiştirilecek.\n\nDevam etmek istediğinize emin misiniz?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      console.log('AdminManagementView: Kullanıcı güncelleniyor:', userId, field, value);
      
      // API'ye gönder
      const updatedUser = await updateUser(userId, { [field]: value }, currentUser?.userId);
      console.log('AdminManagementView: Kullanıcı güncellendi:', updatedUser);

      // Local state'i güncelle
      const updatedUsers = allUsers.map(user =>
        user.userId === userId ? { ...updatedUser, files: user.files || [] } : user
      );
      setAllUsers(updatedUsers);
      
      setFeedback({ message: `Kullanıcı ${field === 'role' ? 'rolü' : 'kotası'} güncellendi.`, type: 'success' });
    } catch (error) {
      console.error('AdminManagementView: Kullanıcı güncelleme hatası:', error);
      setFeedback({ message: error.message || 'Kullanıcı güncellenirken bir hata oluştu.', type: 'error' });
    }
    
    setTimeout(() => setFeedback(null), 4000);
  };

  // Kullanıcı Silme
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        setFeedback({ message: 'Kullanıcı siliniyor...', type: 'info' });
        
        await deleteUser(userId, currentUser?.userId);
        console.log('AdminManagementView: Kullanıcı silindi:', userId);

        // Local state'i güncelle
        const updatedUsers = allUsers.filter(user => user.userId !== userId);
        setAllUsers(updatedUsers);
        setFeedback({ message: `${userName} başarıyla sistemden silindi.`, type: 'success' });
        
        // Parent'tan listeyi yenile
        if (loadUsers) {
          await loadUsers();
        }
      } catch (error) {
        console.error('AdminManagementView: Kullanıcı silme hatası:', error);
        setFeedback({ message: error.message || 'Kullanıcı silinirken bir hata oluştu.', type: 'error' });
      }
      
      setTimeout(() => setFeedback(null), 4000);
    }
  };


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

      {isLoading && (
        <div className="text-center py-4 text-gray-500 italic mb-4">Kullanıcılar yükleniyor...</div>
      )}

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
            {!isLoading && allUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                  Henüz kullanıcı bulunmuyor.
                </td>
              </tr>
            )}
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
                      ${user.role === ROLES.SUPERADMIN ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        user.role === ROLES.ADMIN ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                        'bg-green-100 text-green-800 border-green-300'}`}
                    disabled={
                      // Superadmin kendi rolünü değiştiremez
                      (currentUser?.role === ROLES.SUPERADMIN && user.userId === currentUser.userId) ||
                      // Normal admin hiçbir rolü değiştiremez
                      (currentUser?.role === ROLES.ADMIN && currentUser?.role !== ROLES.SUPERADMIN) ||
                      // Normal admin admin/superadmin kullanıcılarını değiştiremez
                      (currentUser?.role === ROLES.ADMIN && (user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN))
                    }
                  >
                    <option value={ROLES.USER}>Kullanıcı</option>
                    <option value={ROLES.ADMIN}>Yönetici</option>
                    {currentUser?.role === ROLES.SUPERADMIN && <option value={ROLES.SUPERADMIN}>Süper Yönetici</option>}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    value={user.storageQuotaGB}
                    onChange={(e) => handleUpdateUser(user.userId, 'storageQuotaGB', parseInt(e.target.value, 10))}
                    className="p-1 w-20 text-sm border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    disabled={
                      // Superadmin kendi kotasını değiştiremez
                      (currentUser?.role === ROLES.SUPERADMIN && user.userId === currentUser.userId) ||
                      // Normal admin hiçbir kotayı değiştiremez (admin/superadmin kullanıcıları için)
                      (currentUser?.role === ROLES.ADMIN && (user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN))
                    }
                  /> GB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {(user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) && currentUser?.role !== ROLES.SUPERADMIN ? (
                    <span className='text-gray-400 text-xs'>Sistem Yöneticisi</span>
                  ) : (
                    // Normal admin sadece user'ları silebilir
                    (currentUser?.role === ROLES.ADMIN && (user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN)) ? (
                      <span className='text-gray-400 text-xs'>Silinemez</span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(user.userId, user.userName)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        currentUser={currentUser}
      />
    </div>
  );
};

export default AdminManagementView;
