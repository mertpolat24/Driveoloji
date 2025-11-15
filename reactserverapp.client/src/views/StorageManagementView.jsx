import React, { useState, useMemo } from 'react';
import { HardDrive, Folder, FileText, Eye, Download, Trash2, CheckCircle, Zap } from 'lucide-react';
import CardHeader from '../components/CardHeader';

/**
 * Depolama Yönetimi Ekranı
 */
const StorageManagementView = ({ currentUser, updateUserData, setPreviewFile }) => {
  const mockFiles = currentUser.files;
  const totalGB = currentUser.storageQuotaGB;

  // Depolama kullanımını hesapla (MB cinsinden)
  const usedMB = useMemo(() => {
    return mockFiles.reduce((total, file) => total + file.size, 0);
  }, [mockFiles]);

  const totalMB = totalGB * 1024; // GB'yi MB'ye çevir
  const usagePercent = (usedMB / totalMB) * 100;
  const remainingMB = totalMB - usedMB;

  const [deletionMessage, setDeletionMessage] = useState(null);

  const getProgressBarColor = (percent) => {
    if (percent > 85) return 'bg-red-500';
    if (percent > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Dosya Silme İşlevi
  const handleDeleteFile = (fileId, fileName) => {
    const updatedFiles = mockFiles.filter(file => file.id !== fileId);
    updateUserData('files', updatedFiles);
    setDeletionMessage({ message: `${fileName} başarıyla silindi.`, type: 'success' });
    setTimeout(() => setDeletionMessage(null), 4000);
  };

  // Dosya İndirme İşlevi (Base64 Data URL kullanarak)
  const handleDownloadFile = (fileName, dataUrl) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("İndirme işlemi sırasında hata oluştu:", e);
    }
  };

  return (
    <div className="p-6">
      <CardHeader
        title="Sunucu Alanı ve Dosya Yönetimi"
        description={`Size ayrılan ${totalGB} GB depolama alanının durumunu ve tüm dosyalarınızı görüntüleyin.`}
        icon={HardDrive}
      />

      {/* Depolama İstatistikleri Kartları ve Çubuk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-white p-6 rounded-xl shadow-xl border border-indigo-100">
          <HardDrive className="w-6 h-6 text-indigo-500 mb-3" />
          <p className="text-sm font-medium text-gray-500">Toplam Depolama Kotası</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalGB} GB</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xl border border-indigo-100">
          <Zap className="w-6 h-6 text-indigo-500 mb-3" />
          <p className="text-sm font-medium text-gray-500">Kullanılan Alan</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{(usedMB / 1024).toFixed(2)} GB</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xl border border-indigo-100">
          <Folder className="w-6 h-6 text-indigo-500 mb-3" />
          <p className="text-sm font-medium text-gray-500">Kalan Alan</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{(remainingMB / 1024).toFixed(2)} GB</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xl border border-indigo-100 mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Depolama Kullanımı</h3>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">{usagePercent.toFixed(1)}% Kullanılıyor</span>
          <span className="text-sm text-gray-600 font-medium">{(remainingMB / 1024).toFixed(2)} GB Kalan</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(usagePercent)}`}
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>
      </div>

      {/* Dosya Listesi */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Folder className='w-6 h-6 mr-2 text-indigo-600' /> Tüm Yüklenen Dosyalar ({mockFiles.length})
        </h3>
        {deletionMessage && (
          <div className={`p-3 mb-4 rounded-xl font-medium flex items-center bg-green-100 text-green-800`}>
            <CheckCircle className='w-5 h-5 mr-2' /> {deletionMessage.message}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-xl border border-indigo-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            <li className="flex justify-between items-center py-3 px-4 bg-indigo-50/50 rounded-t-xl font-bold text-sm text-gray-700">
              <span className="w-1/3">Dosya Adı</span>
              <span className="w-1/6 text-center">Tip</span>
              <span className="w-1/6 text-center">Boyut (MB)</span>
              <span className="w-1/6 text-center">Tarih</span>
              <span className="w-1/6 text-right">İşlemler</span>
            </li>
            {mockFiles.map((file) => (
              <li key={file.id} className="flex justify-between items-center py-3 px-4 hover:bg-gray-50 transition">
                <div className="w-1/3 flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span className="font-medium text-gray-700 truncate">{file.name}</span>
                </div>
                <span className="w-1/6 text-center text-xs text-gray-500 truncate">{file.type.split('/')[1] || 'Bilinmiyor'}</span>
                <span className="w-1/6 text-center text-sm text-gray-600">{file.size.toFixed(2)}</span>
                <span className="w-1/6 text-center text-sm text-gray-500">{file.date}</span>
                <div className="w-1/6 text-right flex justify-end space-x-2">
                  {/* İndirme Butonu */}
                  <button
                    onClick={() => handleDownloadFile(file.name, file.dataUrl)}
                    className="p-2 rounded-full text-green-500 hover:bg-green-100 transition duration-150"
                    title="Dosyayı İndir"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-2 rounded-full text-indigo-500 hover:bg-indigo-100 transition duration-150"
                    title="Dosyayı Görüntüle"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.name)}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 transition duration-150"
                    title="Dosyayı Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
            {mockFiles.length === 0 && (
              <li className="text-center py-6 text-gray-500 italic">Henüz dosya yüklenmedi.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorageManagementView;
