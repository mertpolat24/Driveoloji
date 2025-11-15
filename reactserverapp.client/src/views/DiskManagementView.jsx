import React, { useState, useEffect } from 'react';
import { HardDrive, Download, FileText, Users, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import CardHeader from '../components/CardHeader';
import { getDiskInfo, getDiskUsage, getUserFiles, downloadFile } from '../services/diskApi';
import { ROLES } from '../constants';

/**
 * Disk Yönetimi Ekranı (Admin ve SuperAdmin için)
 */
const DiskManagementView = ({ currentUser }) => {
  const [disks, setDisks] = useState([]);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const [diskUsages, setDiskUsages] = useState({});
  const [userFiles, setUserFiles] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Disk bilgilerini yükle
  useEffect(() => {
    if (currentUser && (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.SUPERADMIN)) {
      loadDiskInfo();
    }
  }, [currentUser]);

  const loadDiskInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const diskData = await getDiskInfo(currentUser.userId);
      setDisks(diskData);
      if (diskData.length > 0 && !selectedDisk) {
        setSelectedDisk(diskData[0].name);
      }
    } catch (err) {
      console.error('DiskManagementView: Disk bilgileri yüklenemedi:', err);
      setError(err.message || 'Disk bilgileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Seçili disk değiştiğinde kullanım bilgilerini yükle
  useEffect(() => {
    if (selectedDisk) {
      loadDiskUsage(selectedDisk);
    }
  }, [selectedDisk]);

  const loadDiskUsage = async (driveName) => {
    setIsLoading(true);
    setError(null);
    try {
      const usage = await getDiskUsage(driveName, currentUser.userId);
      setDiskUsages(prev => ({ ...prev, [driveName]: usage }));
    } catch (err) {
      console.error('DiskManagementView: Disk kullanım bilgileri yüklenemedi:', err);
      setError(err.message || 'Disk kullanım bilgileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı dosyalarını yükle
  const loadUserFiles = async (driveName, userId) => {
    const key = `${driveName}-${userId}`;
    if (userFiles[key]) return; // Zaten yüklüyse tekrar yükleme

    setIsLoading(true);
    try {
      const files = await getUserFiles(driveName, userId, currentUser.userId);
      setUserFiles(prev => ({ ...prev, [key]: files }));
    } catch (err) {
      console.error('DiskManagementView: Kullanıcı dosyaları yüklenemedi:', err);
      setError(err.message || 'Kullanıcı dosyaları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcıyı genişlet/daralt
  const toggleUser = (userId) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
    
    if (!expandedUsers[userId] && selectedDisk) {
      loadUserFiles(selectedDisk, userId);
    }
  };

  // Dosya indir (sadece superadmin)
  const handleDownload = async (driveName, userId, fileName) => {
    if (currentUser.role !== ROLES.SUPERADMIN) {
      alert('Bu işlem için superadmin yetkisi gereklidir.');
      return;
    }

    try {
      const blob = await downloadFile(driveName, userId, fileName, currentUser.userId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('DiskManagementView: Dosya indirme hatası:', err);
      alert(err.message || 'Dosya indirilemedi.');
    }
  };

  // Boyut formatla
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Yüzde hesapla
  const calculatePercentage = (used, total) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const currentDisk = disks.find(d => d.name === selectedDisk);
  const currentUsages = selectedDisk ? (diskUsages[selectedDisk] || []) : [];

  return (
    <div className="p-6">
      <CardHeader
        title="Disk Yönetimi"
        description="Tüm diskleri görüntüleyin ve kullanıcı dosyalarını yönetin."
        icon={HardDrive}
      />

      {error && (
        <div className="p-3 mb-6 rounded-xl font-medium bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {/* Disk Seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Disk Seçin</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {disks.map((disk) => (
            <button
              key={disk.name}
              onClick={() => setSelectedDisk(disk.name)}
              className={`p-4 rounded-xl border-2 transition ${
                selectedDisk === disk.name
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 mr-2 text-indigo-600" />
                  <span className="font-semibold text-gray-900">{disk.label}</span>
                  <span className="ml-2 text-sm text-gray-500">({disk.name})</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Toplam: <strong>{disk.totalSizeGB} GB</strong></div>
                <div>Kullanılan: <strong>{disk.usedSpaceGB} GB</strong></div>
                <div>Boş: <strong>{disk.freeSpaceGB} GB</strong></div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${calculatePercentage(disk.usedSpace, disk.totalSize)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    %{calculatePercentage(disk.usedSpace, disk.totalSize)} dolu
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seçili Disk Detayları */}
      {selectedDisk && currentDisk && (
        <div className="bg-white rounded-xl shadow-xl border border-indigo-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-indigo-600" />
            {currentDisk.label} ({currentDisk.name}) - Kullanıcı Kullanımları
          </h3>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Yükleniyor...</span>
            </div>
          )}

          {!isLoading && currentUsages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Bu diskte kullanıcı dosyası bulunmuyor.
            </div>
          )}

          {!isLoading && currentUsages.length > 0 && (
            <div className="space-y-4">
              {currentUsages.map((usage) => (
                <div key={usage.userId} className="border border-gray-200 rounded-lg p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleUser(usage.userId)}
                  >
                    <div className="flex items-center flex-1">
                      {expandedUsers[usage.userId] ? (
                        <ChevronDown className="w-5 h-5 mr-2 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 mr-2 text-gray-400" />
                      )}
                      <Users className="w-5 h-5 mr-2 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{usage.userName}</div>
                        <div className="text-sm text-gray-500">{usage.userEmail}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{usage.totalSizeGB} GB</div>
                      <div className="text-xs text-gray-500">{usage.fileCount} dosya</div>
                    </div>
                  </div>

                  {/* Dosya Listesi */}
                  {expandedUsers[usage.userId] && (
                    <div className="mt-4 pl-8 border-t border-gray-100 pt-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {userFiles[`${selectedDisk}-${usage.userId}`]?.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center flex-1">
                                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-700">{file.fileName}</span>
                                {currentUser.role === ROLES.SUPERADMIN && file.originalFileName !== file.fileName && (
                                  <span className="ml-2 text-xs text-gray-500">({file.originalFileName})</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">{formatSize(file.size)}</span>
                                {currentUser.role === ROLES.SUPERADMIN && (
                                  <button
                                    onClick={() => handleDownload(selectedDisk, usage.userId, file.originalFileName || file.fileName)}
                                    className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                                    title="Dosyayı İndir"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {userFiles[`${selectedDisk}-${usage.userId}`]?.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              Bu kullanıcının dosyası bulunmuyor.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiskManagementView;

