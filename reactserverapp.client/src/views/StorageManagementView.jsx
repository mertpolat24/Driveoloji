import React, { useState, useMemo, useEffect } from 'react';
import { HardDrive, Folder, FileText, Eye, Download, Trash2, CheckCircle, Zap } from 'lucide-react';
import CardHeader from '../components/CardHeader';
import { getFileList, downloadFile, deleteFile } from '../services/fileApi';

/**
 * Depolama Yönetimi Ekranı
 */
const StorageManagementView = ({ currentUser, updateUserData, setPreviewFile }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalGB = currentUser.storageQuotaGB;

  // Dosya listesini API'den yükle
  const loadFiles = async () => {
    if (!currentUser?.userId) {
      console.warn('StorageManagementView: Kullanıcı ID bulunamadı, dosya listesi yüklenemiyor.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('StorageManagementView: Dosya listesi yükleniyor... UserId:', currentUser.userId);
      const response = await getFileList(currentUser.userId);
      console.log('StorageManagementView: API\'den gelen ham yanıt:', response);
      console.log('StorageManagementView: Yanıt tipi:', typeof response, 'Array mi?', Array.isArray(response));
      
      // Yanıtın array olduğundan emin ol
      let fileData = [];
      if (Array.isArray(response)) {
        fileData = response;
      } else if (response && typeof response === 'object') {
        // Eğer obje ise, içindeki array'i bul
        fileData = response.files || response.data || Object.values(response).find(Array.isArray) || [];
      } else {
        console.warn('StorageManagementView: Beklenmeyen yanıt formatı:', response);
        fileData = [];
      }
      
      console.log('StorageManagementView: İşlenmiş dosya verileri:', fileData);
      
      // Dosya verilerinden dosya objeleri oluştur
      const fileList = fileData.map((fileItem, index) => {
        // Eğer obje ise (yeni format: {fileName, size, lastModified})
        // Eğer string ise (eski format: sadece dosya adı)
        const fileName = typeof fileItem === 'string' ? fileItem : (fileItem.fileName || fileItem.name || '');
        const fileSize = typeof fileItem === 'object' && fileItem.size ? fileItem.size : 0; // bytes
        const lastModified = typeof fileItem === 'object' && fileItem.lastModified 
          ? new Date(fileItem.lastModified).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        
        // Dosya adından uzantıyı çıkar
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        // Resim dosyaları için doğru MIME type
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        let fileType = 'application/octet-stream';
        if (imageTypes.includes(extension)) {
          fileType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        } else if (extension === 'pdf') {
          fileType = 'application/pdf';
        } else if (extension) {
          fileType = `application/${extension}`;
        }
        
        return {
          id: `${fileName}-${index}-${Date.now()}`,
          name: fileName,
          fileName: fileName,
          size: fileSize / (1024 * 1024), // MB cinsinden
          date: lastModified,
          type: fileType,
        };
      });
      
      console.log('StorageManagementView: Oluşturulan dosya listesi:', fileList);
      console.log('StorageManagementView: Dosya listesi uzunluğu:', fileList.length);
      
      // State'i güncelle
      setFiles(fileList);
      console.log('StorageManagementView: setFiles çağrıldı, yeni state:', fileList);
      
      // Parent component'i de güncelle
      if (updateUserData) {
        updateUserData('files', fileList);
      }
      
      console.log('StorageManagementView: Dosya listesi state\'e set edildi, files.length:', fileList.length);
    } catch (error) {
      console.error("StorageManagementView: Dosya listesi yüklenirken hata:", error);
      console.error("StorageManagementView: Hata detayı:", error.message, error.stack);
      // Hata durumunda boş array set et
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.userId) {
      loadFiles();
    }
  }, [currentUser?.userId]); // Kullanıcı değiştiğinde de çalış

  // Depolama kullanımını hesapla (MB cinsinden) - Dosya boyutları zaten MB cinsinden
  const usedMB = useMemo(() => {
    if (!files || !Array.isArray(files)) {
      console.log('StorageManagementView: files array değil, usedMB = 0');
      return 0;
    }
    const calculated = files.reduce((total, file) => total + (file?.size || 0), 0);
    console.log('StorageManagementView: Hesaplanan usedMB:', calculated, 'files.length:', files.length);
    return calculated;
  }, [files]);

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
  const handleDeleteFile = async (fileId, fileName) => {
    if (!currentUser?.userId) {
      alert('Kullanıcı ID bulunamadı.');
      return;
    }

    // Onay mesajı
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      setDeletionMessage({ message: 'Dosya siliniyor...', type: 'info' });
      
      // Backend'den dosyayı sil
      await deleteFile(fileName, currentUser.userId);
      
      // Frontend state'ten de kaldır
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      
      // Dosya listesini yeniden yükle (güncel durumu görmek için)
      await loadFiles();
      
      setDeletionMessage({ message: `${fileName} başarıyla silindi.`, type: 'success' });
    } catch (error) {
      console.error('StorageManagementView: Dosya silme hatası:', error);
      setDeletionMessage({ 
        message: error.message || 'Dosya silinirken bir hata oluştu.', 
        type: 'error' 
      });
    }
    
    setTimeout(() => setDeletionMessage(null), 4000);
  };

  // Dosya İndirme İşlevi (API'den indir)
  const handleDownloadFile = async (fileName) => {
    if (!currentUser?.userId) {
      alert('Kullanıcı ID bulunamadı.');
      return;
    }

    try {
      const blob = await downloadFile(fileName, currentUser.userId);
      
      // Blob'u indirilebilir hale getir
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL'i temizle
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("İndirme işlemi sırasında hata oluştu:", e);
      alert(`Dosya indirme başarısız: ${e.message}`);
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
          <Folder className='w-6 h-6 mr-2 text-indigo-600' /> Tüm Yüklenen Dosyalar ({files && Array.isArray(files) ? files.length : 0})
        </h3>
        {isLoading && (
          <div className="text-center py-4 text-gray-500 italic">Dosyalar yükleniyor...</div>
        )}
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
            {files && Array.isArray(files) && files.length > 0 ? (
              files.map((file) => {
                const fileName = file?.fileName || file?.name || 'Bilinmeyen dosya';
                console.log('StorageManagementView: Render edilen dosya:', fileName, file);
                return (
                  <li key={file.id || `file-${fileName}`} className="flex justify-between items-center py-3 px-4 hover:bg-gray-50 transition">
                    <div className="w-1/3 flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 truncate">{fileName}</span>
                    </div>
                    <span className="w-1/6 text-center text-xs text-gray-500 truncate">{(file.type || '').split('/')[1] || 'Bilinmiyor'}</span>
                    <span className="w-1/6 text-center text-sm text-gray-600">{(file.size || 0).toFixed(2)}</span>
                    <span className="w-1/6 text-center text-sm text-gray-500">{file.date || '-'}</span>
                    <div className="w-1/6 text-right flex justify-end space-x-2">
                      {/* İndirme Butonu */}
                      <button
                        onClick={() => handleDownloadFile(fileName)}
                        className="p-2 rounded-full text-green-500 hover:bg-green-100 transition duration-150"
                        title="Dosyayı İndir"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      {(() => {
                        const isImage = file.type?.startsWith('image/');
                        const isPreviewable = isImage || file.type === 'application/pdf';
                        return (
                          <button
                            onClick={async () => {
                              if (!isPreviewable) {
                                alert('Bu dosya tipi için önizleme desteklenmiyor.');
                                return;
                              }
                              try {
                                // Dosyayı indirip blob URL oluştur
                                const blob = await downloadFile(fileName, currentUser.userId);
                                const blobUrl = window.URL.createObjectURL(blob);
                                setPreviewFile({
                                  ...file,
                                  dataUrl: blobUrl,
                                });
                              } catch (error) {
                                console.error('Önizleme hatası:', error);
                                alert('Dosya önizlemesi yüklenemedi: ' + error.message);
                              }
                            }}
                            className={`p-2 rounded-full transition duration-150 ${
                              isPreviewable
                                ? 'text-indigo-500 hover:bg-indigo-100 cursor-pointer'
                                : 'text-gray-400 opacity-50 cursor-not-allowed'
                            }`}
                            title={isPreviewable ? 'Dosyayı Önizle' : 'Bu dosya tipi için önizleme desteklenmiyor'}
                            disabled={!isPreviewable}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        );
                      })()}
                      <button
                        onClick={() => handleDeleteFile(file.id, fileName)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 transition duration-150"
                        title="Listeden Kaldır"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                );
              })
            ) : null}
            {!isLoading && (!files || !Array.isArray(files) || files.length === 0) && (
              <li className="text-center py-6 text-gray-500 italic">Henüz dosya yüklenmedi.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorageManagementView;
