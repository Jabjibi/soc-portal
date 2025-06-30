"use client";

import React, { useEffect, useState } from "react";
import { FiEye, FiSlash } from "react-icons/fi";

export default function PullDatabase() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter data based on search term
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-900 border-t-red-500 mx-auto mb-6 shadow-lg shadow-red-500/30"></div>
            <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl"></div>
          </div>
          <p className="text-red-100 text-xl font-semibold tracking-wide">กำลังโหลดข้อมูล...</p>
          <div className="mt-2 h-1 w-32 mx-auto bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center backdrop-blur-sm shadow-2xl shadow-red-500/20">
          <div className="text-red-400 mb-6">
            <svg className="w-20 h-20 mx-auto drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-100 mb-4">เกิดข้อผิดพลาด</h3>
          <p className="text-red-200 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg shadow-red-500/30 transform hover:scale-105"
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-6">
            <svg className="w-20 h-20 mx-auto drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-300 mb-4">ไม่มีข้อมูล</h3>
          <p className="text-gray-400">ไม่พบข้อมูลในฐานข้อมูล</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const visibleColumns = columns.filter(col => isColumnVisible(col));

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 rounded-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Glow Effect */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 blur-3xl rounded-3xl"></div>
          <div className="relative flex items-center justify-between bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 shadow-2xl">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-300 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                ข้อมูลจาก PostgreSQL
              </h1>
              <p className="mt-3 text-gray-300 text-lg">แสดงข้อมูลทั้งหมด <span className="text-red-400 font-semibold">{data.length}</span> รายการ</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg shadow-red-500/30 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-400 group-focus-within:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาข้อมูล..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-12 pr-4 py-3 bg-gray-900/80 border border-red-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300">แสดง:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-900/80 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-300">รายการ</span>
            </div>
          </div>
        </div>

        {/* Column Toggle Controls */}
        <div className="mb-6 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-500/20 p-6">
          <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            จัดการคอลัมน์
          </h3>
          <div className="flex flex-wrap gap-3">
            {columns.map((column, index) => (
              <button
                key={column}
                onClick={() => toggleColumn(column)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isColumnVisible(column)
                    ? 'bg-gradient-to-r from-red-600/20 to-red-500/10 text-red-200 border border-red-500/40 shadow-lg shadow-red-500/20 hover:from-red-600/30 hover:to-red-500/20'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-600/40 hover:bg-gray-700/50'
                }`}
              >
                <span className="text-lg">
                  {isColumnVisible(column) ? <FiEye className="text-red-400" /> : <FiSlash className="text-gray-500" />}
                </span>
                {column}
                <span className="ml-1 text-xs opacity-60 bg-black/30 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-400 bg-black/20 rounded-lg p-3">
            แสดง <span className="text-red-400 font-semibold">{visibleColumns.length}</span> จาก <span className="text-red-400 font-semibold">{columns.length}</span> คอลัมน์
          </div>
        </div>

        {/* Table Container - Dark Excel-like styling */}
        <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-red-500/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-b border-red-500/30">
                  {/* Row Number Header */}
                  <th className="w-12 px-3 py-4 text-center text-xs font-bold text-red-300 bg-gradient-to-b from-red-900/40 to-red-800/30 border-r border-red-500/30">
                    #
                  </th>
                  {/* Column Headers */}
                  {columns.map((key, i) => (
                    isColumnVisible(key) && (
                      <th 
                        key={i}
                        className="px-4 py-4 text-center text-xs font-bold text-red-200 bg-gradient-to-b from-red-900/40 to-red-800/30 border-r border-red-500/30 last:border-r-0 min-w-[120px]"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-red-400 font-bold text-sm bg-black/30 px-2 py-1 rounded-full">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div className="flex-1 truncate font-semibold" title={key}>
                            {key}
                          </div>
                          <button
                            onClick={() => toggleColumn(key)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300"
                            title="ซ่อนคอลัมน์"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => (
                  <tr 
                    key={startIndex + idx} 
                    className="hover:bg-gradient-to-r hover:from-red-900/10 hover:to-red-800/5 transition-all duration-300 border-b border-gray-700/50 group"
                  >
                    {/* Row Number */}
                    <td className="w-12 px-3 py-4 text-center text-sm font-bold text-red-300 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-r border-gray-600/50 group-hover:bg-red-900/20">
                      {startIndex + idx + 1}
                    </td>
                    {/* Data Cells */}
                    {Object.entries(row).map(([key, val], j) => (
                      isColumnVisible(key) && (
                        <td 
                          key={j} 
                          className="px-4 py-4 text-sm text-gray-200 border-r border-gray-700/50 last:border-r-0 group-hover:text-white"
                        >
                          <div className="truncate max-w-[200px]" title={val !== null && val !== undefined ? String(val) : 'null'}>
                            {val !== null && val !== undefined ? String(val) : (
                              <span className="text-gray-500 italic bg-gray-800/50 px-2 py-1 rounded">null</span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl border border-red-500/20">
            <div className="flex items-center text-sm text-gray-300">
              แสดง <span className="text-red-400 font-semibold mx-1">{startIndex + 1}</span> ถึง <span className="text-red-400 font-semibold mx-1">{Math.min(endIndex, filteredData.length)}</span> จาก <span className="text-red-400 font-semibold mx-1">{filteredData.length}</span> รายการ
              {searchTerm && (
                <span className="ml-2 text-red-300 bg-red-500/20 px-3 py-1 rounded-full">
                  (กรองจาก {data.length} รายการทั้งหมด)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/80 border border-gray-600/50 rounded-lg hover:bg-red-900/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                ก่อนหน้า
              </button>
              
              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                          : 'text-gray-300 bg-gray-800/80 border border-gray-600/50 hover:bg-red-900/30 hover:border-red-500/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/80 border border-gray-600/50 rounded-lg hover:bg-red-900/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {/* Footer with Glow */}
        <div className="mt-8 flex justify-between items-center text-sm text-gray-400 bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/10">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            อัปเดตล่าสุด: <span className="text-red-300">{new Date().toLocaleString('th-TH')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            ทั้งหมด <span className="text-red-300 font-semibold">{data.length}</span> รายการ
          </div>
        </div>
      </div>
    </div>
  );
}