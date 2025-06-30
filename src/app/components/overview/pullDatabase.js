"use client";

import React, { useEffect, useState } from "react";

export default function PullDatabase() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/data");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (Array.isArray(result)) {
          setData(result);
        } else {
          throw new Error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleColumn = (columnKey) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const isColumnVisible = (columnKey) => !hiddenColumns.has(columnKey);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่มีข้อมูล</h3>
          <p className="text-gray-500">ไม่พบข้อมูลในฐานข้อมูล</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ข้อมูลจาก PostgreSQL</h1>
              <p className="mt-2 text-gray-600">แสดงข้อมูลทั้งหมด {data.length} รายการ</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Column Toggle Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">จัดการคอลัมน์</h3>
          <div className="flex flex-wrap gap-2">
            {columns.map((column, index) => (
              <button
                key={column}
                onClick={() => toggleColumn(column)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isColumnVisible(column)
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-300'
                }`}
              >
                <span className="mr-2">
                  {isColumnVisible(column) ? '👁️' : '🙈'}
                </span>
                {column}
                <span className="ml-1 text-xs text-gray-500">
                  (#{index + 1})
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            แสดง {columns.filter(col => isColumnVisible(col)).length} จาก {columns.length} คอลัมน์
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-solid border-gray-300">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-collapse border-2 border-solid border-gray-400">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((key, i) => (
                    isColumnVisible(key) && (
                      <th 
                        key={i}
                        id={`header-${i + 1}`}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-solid border-gray-400 resize-x overflow-hidden min-w-[120px] max-w-[400px] w-[200px] relative"
                        style={{ resize: 'horizontal' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="truncate" title={key}>
                            <span className="text-blue-600 font-bold">#{i + 1}</span>
                            <span className="ml-2">{key}</span>
                          </div>
                          <button
                            onClick={() => toggleColumn(key)}
                            className="ml-2 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                            title="ซ่อนคอลัมน์"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-gray-100 transition-colors border-b-2 border-solid border-gray-300 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {Object.entries(row).map(([key, val], j) => (
                      isColumnVisible(key) && (
                        <td 
                          key={j} 
                          className="px-6 py-4 text-sm text-gray-900 border-r-2 border-solid border-gray-300 last:border-r-0 overflow-hidden"
                        >
                          <div className="truncate" title={val !== null && val !== undefined ? String(val) : 'null'}>
                            {val !== null && val !== undefined ? String(val) : (
                              <span className="text-gray-400 italic">null</span>
                            )}
                          </div>
                        </td>
                      )
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>
            อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}
          </div>
          <div>
            ทั้งหมด {data.length} รายการ
          </div>
        </div>
      </div>
    </div>
  );
}