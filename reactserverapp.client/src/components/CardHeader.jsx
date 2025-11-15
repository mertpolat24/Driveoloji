import React from 'react';

/**
 * Başlık ve kısa açıklama kartı
 */
const CardHeader = ({ title, description, icon: Icon }) => (
  <div className="flex items-center space-x-4 mb-6 p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-indigo-100/50 backdrop-blur-sm">
    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

export default CardHeader;
