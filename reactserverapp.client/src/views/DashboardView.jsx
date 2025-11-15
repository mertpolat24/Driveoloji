import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Upload, FileText, CheckCircle, Info, Zap } from 'lucide-react';
import CardHeader from '../components/CardHeader';
import { uploadFile, getFileList } from '../services/fileApi';

/**
 * Pano (Dashboard) Ekranı - Dosya Yükleme Alanı
 */
const DashboardView = ({ userName, totalGB, setActiveView, updateUserData, currentUser }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ message: '', type: '' });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Kendi dosya listesinden usedMB hesapla (API'den gelen gerçek veriler)
  const usedMB = useMemo(() => {
    if (!files || !Array.isArray(files)) {
      console.log('DashboardView: files array değil, usedMB = 0');
      return 0;
    }
    const calculated = files.reduce((total, file) => total + (file?.size || 0), 0);
    console.log('DashboardView: Hesaplanan usedMB:', calculated, 'files.length:', files.length);
    return calculated;
  }, [files]);

  // Component mount olduğunda ve upload sonrası dosya listesini API'den yükle
  const loadFiles = async () => {
    if (!currentUser?.userId) {
      console.warn('DashboardView: Kullanıcı ID bulunamadı, dosya listesi yüklenemiyor.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('DashboardView: Dosya listesi yükleniyor... UserId:', currentUser.userId);
      const response = await getFileList(currentUser.userId);
      console.log('DashboardView: API\'den gelen ham yanıt:', response);
      console.log('DashboardView: Yanıt tipi:', typeof response, 'Array mi?', Array.isArray(response));
      
      // Yanıtın array olduğundan emin ol
      let fileData = [];
      if (Array.isArray(response)) {
        fileData = response;
      } else if (response && typeof response === 'object') {
        // Eğer obje ise, içindeki array'i bul
        fileData = response.files || response.data || Object.values(response).find(Array.isArray) || [];
      } else {
        console.warn('DashboardView: Beklenmeyen yanıt formatı:', response);
        fileData = [];
      }
      
      console.log('DashboardView: İşlenmiş dosya verileri:', fileData);
      
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
      
      console.log('DashboardView: Oluşturulan dosya listesi:', fileList);
      console.log('DashboardView: Dosya listesi uzunluğu:', fileList.length);
      
      // State'i güncelle
      setFiles(fileList);
      console.log('DashboardView: setFiles çağrıldı, yeni state:', fileList);
      
      // Parent component'i de güncelle
      if (updateUserData) {
        updateUserData('files', fileList);
      }
      
      console.log('DashboardView: Dosya listesi state\'e set edildi, files.length:', fileList.length);
    } catch (error) {
      console.error("DashboardView: Dosya listesi yüklenirken hata:", error);
      console.error("DashboardView: Hata detayı:", error.message, error.stack);
      // Hata durumunda boş array set et
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount olduğunda ve kullanıcı değiştiğinde dosya listesini yükle
  useEffect(() => {
    if (currentUser?.userId) {
      loadFiles();
    }
  }, [currentUser?.userId]);

  // Yüklemeden önce boyut kontrolü yapan ve yüklemeyi başlatan ana işlev
  const checkAndUpload = async (files) => {
    const filesToUpload = Array.from(files);
    if (filesToUpload.length === 0) return;

    setUploadMessage({ message: '', type: '' });

    // Tek dosya için 5GB limit kontrolü
    const maxFileSizeGB = 5;
    const maxFileSizeBytes = maxFileSizeGB * 1024 * 1024 * 1024; // 5GB in bytes
    
    for (const file of filesToUpload) {
      if (file.size > maxFileSizeBytes) {
        const fileSizeGB = (file.size / 1024 / 1024 / 1024).toFixed(2);
        setUploadMessage({
          message: `Yükleme başarısız! "${file.name}" dosyası çok büyük (${fileSizeGB} GB). Maksimum dosya boyutu: ${maxFileSizeGB} GB.`,
          type: 'error'
        });
        setTimeout(() => setUploadMessage({ message: '', type: '' }), 6000);
        return;
      }
    }

    const totalSizeSelectedMB = filesToUpload.reduce((sum, file) => sum + (file.size / 1024 / 1024), 0);
    const limitInMB = totalGB * 1024;
    const currentUsedMB = usedMB; // Artık API'den gelen gerçek verilerden hesaplanıyor

    if (currentUsedMB + totalSizeSelectedMB > limitInMB) {
      setUploadMessage({
        message: `Yükleme başarısız! ${totalGB} GB depolama limitiniz dolmak üzere. Kalan: ${(limitInMB - currentUsedMB).toFixed(1)} MB.`,
        type: 'error'
      });
      setTimeout(() => setUploadMessage({ message: '', type: '' }), 6000);
      return;
    }

    try {
      setUploadMessage({ message: 'Dosyalar yükleniyor...', type: 'info' });

      // Her dosyayı API'ye yükle
      const uploadPromises = filesToUpload.map(async (file) => {
        if (!currentUser?.userId) {
          throw new Error('Kullanıcı ID bulunamadı.');
        }
        console.log('DashboardView: Dosya yükleniyor:', file.name, 'UserId:', currentUser.userId);
        const result = await uploadFile(file, currentUser.userId);
        console.log('DashboardView: Dosya yükleme sonucu:', result);
        return result;
      });

      await Promise.all(uploadPromises);

      setUploadMessage({ message: `${filesToUpload.length} dosya başarıyla yüklendi!`, type: 'success' });
      
      // Upload işlemi başarılı olduktan sonra kısa bir bekleme ve dosya listesini API'den yenile
      // Backend'in dosyayı işlemesi için kısa bir süre bekleyelim
      console.log('DashboardView: Upload başarılı, dosya listesi yenileniyor...');
      
      // Promise ile delay oluştur
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        await loadFiles();
        console.log('DashboardView: Dosya listesi başarıyla yenilendi');
      } catch (refreshError) {
        console.error("DashboardView: Dosya listesi yenilenirken hata:", refreshError);
        // List refresh hatası upload'ı başarısız göstermesin
        setUploadMessage({ 
          message: 'Dosya yüklendi ancak liste yenilenemedi. Sayfayı yenileyin.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error("DashboardView: Dosya yükleme hatası:", error);
      console.error("DashboardView: Hata detayı:", error.message, error.stack);
      setUploadMessage({ 
        message: error.message || 'Dosya yüklenirken bir hata oluştu.', 
        type: 'error' 
      });
    }

    setTimeout(() => setUploadMessage({ message: '', type: '' }), 4000);
  };

  const handleFileSelect = (e) => {
    checkAndUpload(e.target.files);
    e.target.value = null;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      checkAndUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="p-6">
      <CardHeader
        title={`Hoş Geldiniz, ${userName}!`}
        description="Dosya yükleyin ve son aktivitelerinizi görüntüleyin."
        icon={LayoutDashboard}
      />

      {/* Yükleme Geri Bildirim Mesajı */}
      {uploadMessage.message && (
        <div className={`p-4 mb-6 rounded-2xl font-semibold flex items-center shadow-lg border-2
          ${uploadMessage.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' :
            uploadMessage.type === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200' : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-200'}`}>
          {uploadMessage.type === 'success' ? <CheckCircle className='w-6 h-6 mr-3 text-green-600' /> :
            uploadMessage.type === 'error' ? <Zap className='w-6 h-6 mr-3 text-red-600' /> : <Info className='w-6 h-6 mr-3 text-blue-600' />}
          {uploadMessage.message}
        </div>
      )}

      {/* Dosya Yükleme Alanı */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer mb-8 bg-gradient-to-br 
          ${isDragging 
            ? 'border-indigo-500 bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-100 shadow-xl scale-105' 
            : 'border-indigo-200 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 hover:from-indigo-50 hover:via-purple-50 hover:to-indigo-50 hover:shadow-lg hover:border-indigo-300'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={`inline-flex p-4 rounded-full mb-4 ${isDragging ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`}>
          <Upload className={`w-10 h-10 mx-auto text-white ${isDragging ? 'animate-bounce' : ''}`} />
        </div>
        <p className="text-xl font-bold text-gray-800 mb-2">Dosyaları buraya sürükleyip bırakın</p>
        <p className="text-sm text-gray-600 mb-5">veya</p>
        {/* Dosya Seçme Butonu */}
        <label className="relative inline-block px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl transition-all duration-200 cursor-pointer transform hover:scale-105">
          Dosya Seç
          <input
            type="file"
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileSelect}
          />
        </label>
        <p className='text-xs font-medium text-indigo-600 mt-5 bg-indigo-50 px-4 py-2 rounded-full inline-block'>Kalan Kota: <span className="font-bold">{(totalGB * 1024 - usedMB).toFixed(1)} MB</span></p>
      </div>

      {/* Dosya Listesi ve Son Aktiviteler (Kısa Görünüm) */}
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100/50 p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-5 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600" />
          Son Yüklenenler ({files && Array.isArray(files) ? files.length : 0} Dosya)
        </h3>
        {isLoading && (
          <div className="text-center py-4 text-gray-500 italic">Dosyalar yükleniyor...</div>
        )}
        <ul className="divide-y divide-gray-100">
          <li className="flex justify-between items-center py-3 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg font-semibold text-sm text-gray-700 border border-indigo-100">
            <span className="w-1/2">Dosya Adı</span>
            <span className="w-1/4 text-center">Boyut (MB)</span>
            <span className="w-1/4 text-right">Tarih</span>
          </li>
          {files && Array.isArray(files) && files.length > 0 ? (
            files.slice(0, 5).map((file) => {
              const fileName = file?.fileName || file?.name || 'Bilinmeyen dosya';
              console.log('DashboardView: Render edilen dosya:', fileName, file);
              return (
                <li key={file.id || `file-${fileName}`} className="flex justify-between items-center py-3 px-3 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition rounded-lg">
                  <div className="w-1/2 flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-700 truncate">{fileName}</span>
                  </div>
                  <span className="w-1/4 text-center text-sm font-medium text-gray-600">{(file.size || 0).toFixed(2)}</span>
                  <span className="w-1/4 text-right text-sm text-gray-500">{file.date || '-'}</span>
                </li>
              );
            })
          ) : null}
          {!isLoading && (!files || !Array.isArray(files) || files.length === 0) && (
            <li className="text-center py-10 text-gray-400 italic">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Henüz dosya yüklenmedi.</p>
            </li>
          )}
          {files && Array.isArray(files) && files.length > 5 && (
            <li className="text-center py-3 text-indigo-600 hover:text-purple-600 cursor-pointer text-sm font-semibold hover:bg-indigo-50 rounded-lg transition"
              onClick={() => setActiveView('storage')}>
              Tümünü Gör...
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardView;
