import React, { useEffect } from 'react';
import { X, Eye, Info } from 'lucide-react';

/**
 * Dosya Önizleme Modalı
 */
const FilePreviewModal = ({ file, onClose }) => {
  // Modal kapanırken blob URL'i temizle
  useEffect(() => {
    return () => {
      if (file?.dataUrl && file.dataUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(file.dataUrl);
      }
    };
  }, [file]);

  if (!file) return null;

  const isImage = file.type?.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-indigo-50 rounded-t-2xl flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800 truncate flex items-center">
            <Eye className="w-5 h-5 mr-2 text-indigo-600" /> {file.name} Önizlemesi
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
            title="Kapat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-auto p-4 bg-gray-50">
          {isImage ? (
            <img
              src={file.dataUrl}
              alt={file.name}
              className="max-w-full max-h-full mx-auto object-contain rounded-xl shadow-lg"
            />
          ) : isPDF ? (
            <iframe
              src={file.dataUrl}
              className="w-full h-full min-h-[500px] border-0 rounded-xl shadow-inner"
              title={`PDF Preview: ${file.name}`}
            >
              <p className='p-8 text-center text-gray-500'>Tarayıcınız PDF önizlemesini desteklemiyor.</p>
            </iframe>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-yellow-200">
              <Info className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-700">Önizleme Desteklenmiyor</h4>
              <p className="text-gray-500 mt-2">
                '{file.name}' dosya tipi ({file.type}) için yerleşik önizleme desteği mevcut değil.
              </p>
              <p className='text-sm text-gray-400 mt-4'>
                Boyut: {file.size.toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
