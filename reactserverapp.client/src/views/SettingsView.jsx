import React, { useState } from 'react';
import { Settings, User, Mail, KeyRound, Zap, CheckCircle } from 'lucide-react';
import CardHeader from '../components/CardHeader';
import ModalContent from '../components/ModalContent';

/**
 * Hesap Ayarları Ekranı
 */
const SettingsView = ({ currentUser, updateUserData }) => {
  const [openModal, setOpenModal] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleUpdate = async (field, newValue) => {
    try {
      // Field mapping: Modal'dan gelen field adlarını API field adlarına çevir
      let apiField = field;
      if (field === 'name') apiField = 'userName';
      else if (field === 'email') apiField = 'userEmail';
      else if (field === 'password') apiField = 'userPassword';
      
      // API'ye gönder
      await updateUserData(apiField, newValue);
      setFeedback({ 
        message: apiField === 'userPassword' 
          ? 'Şifre başarıyla güncellendi!' 
          : `${apiField === 'userName' ? 'İsim' : 'E-posta'} başarıyla güncellendi!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('SettingsView: Güncelleme hatası:', error);
      setFeedback({ 
        message: error.message || 'Güncelleme sırasında bir hata oluştu.', 
        type: 'error' 
      });
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const SettingItem = ({ title, description, icon: Icon, buttonText, onClick }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-4">
        <Icon className="w-6 h-6 text-indigo-500" />
        <div>
          <h4 className="font-semibold text-gray-700">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <CardHeader
        title="Hesap Ayarları"
        description="Profil bilgilerinizi ve erişim ayarlarınızı yönetin."
        icon={Settings}
      />

      {feedback.message && (
        <div className={`p-3 mb-6 rounded-xl font-medium flex items-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <CheckCircle className='w-5 h-5 mr-2' /> {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl border border-indigo-100 divide-y divide-gray-100">
        <SettingItem
          title="İsim Değiştirme"
          description={`Mevcut İsim: ${currentUser.userName}`}
          icon={User}
          buttonText="İsmi Güncelle"
          onClick={() => setOpenModal('name')}
        />
        <SettingItem
          title="E-posta Değiştirme"
          description={`Mevcut E-posta: ${currentUser.userEmail}`}
          icon={Mail}
          buttonText="E-postayı Güncelle"
          onClick={() => setOpenModal('email')}
        />
        <SettingItem
          title="Şifre Değiştirme"
          description="Hesabınızın güvenliği için güçlü bir şifre kullanın."
          icon={KeyRound}
          buttonText="Şifreyi Değiştir"
          onClick={() => setOpenModal('password')}
        />
      </div>

      <div className="mt-8 bg-indigo-50 p-4 rounded-xl shadow-inner border border-indigo-200">
        <h4 className="font-semibold text-indigo-800 flex items-center mb-1">
          <Zap className="w-5 h-5 mr-2" /> Kullanıcı ID'si
        </h4>
        <p className="text-sm font-mono text-indigo-900 bg-indigo-100 p-2 rounded-lg break-all">
          {currentUser.userId}
        </p>
        <p className="text-xs text-indigo-600 mt-2">Bu ID, sunucu kaynaklarınızla ilişkilidir.</p>
      </div>

      {/* Modal for Name/Email/Password Update */}
      <ModalContent
        isOpen={openModal}
        onClose={() => setOpenModal(null)}
        currentUser={currentUser}
        handleUpdate={handleUpdate}
      />
    </div>
  );
};

export default SettingsView;
