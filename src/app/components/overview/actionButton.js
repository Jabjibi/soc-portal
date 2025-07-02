import React from "react";

export default function ActionButtons({
  loading,
  file,
  onSendFile,
  onReset
}) {
  return (
    <div className="flex space-x-4">
      <button
        onClick={onSendFile}
        disabled={loading || !file}
        className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>กำลังส่งไฟล์...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
            </svg>
            <span>ส่งไฟล์ไปที่ n8n</span>
          </>
        )}
      </button>
      
      <button
        onClick={onReset}
        disabled={loading}
        className="px-8 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>รีเซ็ต</span>
      </button>
    </div>
  );
}