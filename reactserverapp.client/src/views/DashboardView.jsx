import React, { useState } from 'react';
import { LayoutDashboard, Upload, FileText, CheckCircle, Info, Zap } from 'lucide-react';
import CardHeader from '../components/CardHeader';

/**
 * Pano (Dashboard) Ekranı - Dosya Yükleme Alanı
 */
const DashboardView = ({ userName, mockFiles, totalGB, usedMB, setActiveView, updateUserData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ message: '', type: '' });

  // FileReader ile dosyayı Base64 Data URL'e çevirir
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Yüklemeden önce boyut kontrolü yapan ve yüklemeyi başlatan ana işlev
  const checkAndUpload = async (files) => {
    const filesToUpload = Array.from(files);
    if (filesToUpload.length === 0) return;

    setUploadMessage({ message: '', type: '' });

    const totalSizeSelectedMB = filesToUpload.reduce((sum, file) => sum + (file.size / 1024 / 1024), 0);
    const limitInMB = totalGB * 1024;
    const currentUsedMB = usedMB;

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

      const filePromises = filesToUpload.map(async (file) => {
        const dataUrl = await readFileAsDataURL(file);
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size / 1024 / 1024, // MB cinsinden
          date: new Date().toISOString().slice(0, 10),
          type: file.type || 'application/octet-stream',
          dataUrl: dataUrl,
        };
      });

      const newFiles = await Promise.all(filePromises);

      // Dosya listesini güncelle
      updateUserData('files', [...newFiles, ...mockFiles]);

      setUploadMessage({ message: `${newFiles.length} dosya başarıyla yüklendi!`, type: 'success' });
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      setUploadMessage({ message: 'Dosya yüklenirken bir hata oluştu.', type: 'error' });
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
          Son Yüklenenler ({mockFiles.length} Dosya)
        </h3>
        <ul className="divide-y divide-gray-100">
          <li className="flex justify-between items-center py-3 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg font-semibold text-sm text-gray-700 border border-indigo-100">
            <span className="w-1/2">Dosya Adı</span>
            <span className="w-1/4 text-center">Boyut (MB)</span>
            <span className="w-1/4 text-right">Tarih</span>
          </li>
          {mockFiles.slice(0, 5).map((file) => (
            <li key={file.id} className="flex justify-between items-center py-3 px-3 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition rounded-lg">
              <div className="w-1/2 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-700 truncate">{file.name}</span>
              </div>
              <span className="w-1/4 text-center text-sm font-medium text-gray-600">{file.size.toFixed(2)}</span>
              <span className="w-1/4 text-right text-sm text-gray-500">{file.date}</span>
            </li>
          ))}
          {mockFiles.length === 0 && (
            <li className="text-center py-10 text-gray-400 italic">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Henüz dosya yüklenmedi.</p>
            </li>
          )}
          {mockFiles.length > 5 && (
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
