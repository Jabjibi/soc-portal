"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import PullData from "./pullDatabase";

export default function ExcelUp() {
  const [file, setFile] = useState(null);
  const [editedFileUrl, setEditedFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [duplicateRows, setDuplicateRows] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setEditedFileUrl(null);
    setResponse(null);
    setExcelData([]);
    setHeaders([]);
    setDuplicateRows(new Set());
    
    // ตรวจสอบประเภทไฟล์
    if (selectedFile && !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
      setFile(null);
      return;
    }

    // อ่านและแสดงตัวอย่างไฟล์ Excel
    if (selectedFile) {
      await loadExcelPreview(selectedFile);
    }
  };

  const loadExcelPreview = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // ใช้ XLSX อ่านไฟล์โดยตรง
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headerRow = jsonData[0];
        const dataRows = jsonData.slice(1);
        
        setHeaders(headerRow);
        setExcelData(dataRows);
        
        // หาแถวที่ซ้ำ
        findDuplicateRows(dataRows);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error reading Excel file:', error);
      setError('ไม่สามารถอ่านไฟล์ Excel ได้');
    }
  };

  const findDuplicateRows = (data) => {
    const duplicates = new Set();
    const seen = new Map();
    
    data.forEach((row, index) => {
      const rowString = JSON.stringify(row);
      if (seen.has(rowString)) {
        duplicates.add(index);
        duplicates.add(seen.get(rowString));
      } else {
        seen.set(rowString, index);
      }
    });
    
    setDuplicateRows(duplicates);
  };

  const sendFileToN8N = async () => {
    if (!file) {
      setError("กรุณาเลือกไฟล์ก่อน");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("data", file);
    
    // เพิ่ม metadata ของไฟล์
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size.toString());
    formData.append("timestamp", new Date().toISOString());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch("https://ai.bmspcustomer.net/webhook/excel", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // ถ้า response ไม่ใช่ JSON ให้ใช้ status text
        }
        
        throw new Error(errorMessage);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("การตอบกลับจาก server ไม่ใช่ JSON format");
      }

      const data = await res.json();
      setResponse(data);
      
      // ตรวจสอบรูปแบบการตอบกลับจาก n8n
      if (data.editedFileUrl) {
        setEditedFileUrl(data.editedFileUrl);
      } else if (data.downloadUrl) {
        setEditedFileUrl(data.downloadUrl);
      } else if (data.fileUrl) {
        setEditedFileUrl(data.fileUrl);
      }
      
      setUploadProgress(100);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        setError("การส่งไฟล์หมดเวลา กรุณาลองใหม่อีกครั้ง");
      } else if (error.message.includes('Failed to fetch')) {
        setError("ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
      } else {
        setError("เกิดข้อผิดพลาด: " + error.message);
      }
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setEditedFileUrl(null);
    setError(null);
    setResponse(null);
    setUploadProgress(0);
    setExcelData([]);
    setHeaders([]);
    setDuplicateRows(new Set());
    setShowPreview(false);
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const exportCleanedData = () => {
    if (excelData.length === 0) return;
    
    // กรองข้อมูลที่ไม่ซ้ำ
    const cleanedData = excelData.filter((_, index) => !duplicateRows.has(index));
    
    // สร้าง CSV
    const csvContent = [
      headers.join(','),
      ...cleanedData.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell || ''
        ).join(',')
      )
    ].join('\n');
    
    // ดาวน์โหลดไฟล์
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaned_${file?.name?.replace(/\.[^/.]+$/, '')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            Excel File Uploader
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
            <span className="text-red-400 font-semibold">DUPLICATE DETECTOR</span>
            <div className="h-1 w-16 bg-gradient-to-l from-red-600 to-red-400 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 space-y-8">
          {/* File Input Section */}
          <div className="relative">
            <div className="border-2 border-dashed border-red-500/50 rounded-xl p-8 text-center bg-gray-900/50 hover:bg-gray-900/70 transition-all duration-300 hover:border-red-400">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-red-600 file:to-red-500 file:text-white hover:file:from-red-700 hover:file:to-red-600 file:shadow-lg file:transition-all file:duration-300"
              />
              <p className="mt-3 text-sm text-gray-400">
                เลือกไฟล์ Excel (.xlsx หรือ .xls)
              </p>
              
              {file && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {duplicateRows.size > 0 && (
                    <div className="mt-3 p-2 bg-red-900/50 border border-red-500/50 rounded-lg">
                      <p className="text-xs text-red-300 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        พบข้อมูลซ้ำ {duplicateRows.size} แถว
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-300">เกิดข้อผิดพลาด</p>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Excel Preview */}
          {showPreview && excelData.length > 0 && (
            <div className="bg-gray-900 border border-gray-600 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ตัวอย่างข้อมูล Excel ({excelData.length} แถว)
                </h3>
                <div className="flex space-x-3">
                  {duplicateRows.size > 0 && (
                    <button
                      onClick={exportCleanedData}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ดาวน์โหลดข้อมูลที่กรองแล้ว
                    </button>
                  )}
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm font-medium transition-all duration-300"
                  >
                    ซ่อน
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-96 rounded-lg border border-gray-600">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium text-gray-300 border-r border-gray-600">#</th>
                      {headers.map((header, index) => (
                        <th key={index} className="px-3 py-3 text-left font-medium text-gray-300 border-r border-gray-600">
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.slice(0, 100).map((row, rowIndex) => (
                      <tr 
                        key={rowIndex} 
                        className={`border-b border-gray-700 hover:bg-gray-800/50 transition-colors duration-200 ${
                          duplicateRows.has(rowIndex) 
                            ? 'bg-red-900/30 border-red-500/50 hover:bg-red-900/40' 
                            : 'bg-gray-900/50'
                        }`}
                      >
                        <td className="px-3 py-2 border-r border-gray-600 font-mono text-gray-400">
                          {rowIndex + 1}
                          {duplicateRows.has(rowIndex) && (
                            <span className="ml-1 text-red-400">⚠️</span>
                          )}
                        </td>
                        {headers.map((_, colIndex) => (
                          <td key={colIndex} className="px-3 py-2 border-r border-gray-600 text-gray-300">
                            {row[colIndex] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {excelData.length > 100 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  แสดงเพียง 100 แถวแรก จากทั้งหมด {excelData.length} แถว
                </p>
              )}
              
              {duplicateRows.size > 0 && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                  <p className="text-sm font-medium text-red-300 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    พบข้อมูลซ้ำ {duplicateRows.size} แถว (ไฮไลท์ด้วยสีแดง)
                  </p>
                  <p className="text-xs text-red-200 mt-2">
                    แถวที่ซ้ำ: {Array.from(duplicateRows).map(i => i + 1).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {loading && (
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">กำลังประมวลผล... {uploadProgress}%</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={sendFileToN8N}
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
              onClick={resetForm}
              disabled={loading}
              className="px-8 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>รีเซ็ต</span>
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl p-1">
            <PullData />
          </div>

          {/* Success Response */}
          {editedFileUrl && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-green-300 ml-3">ส่งไฟล์สำเร็จ!</h3>
              </div>
              <a
                href={editedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ดาวน์โหลดไฟล์ที่แก้ไขแล้ว
              </a>
            </div>
          )}

          {/* Debug Response */}
          {response && !editedFileUrl && (
            <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-xl p-4 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-yellow-300 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                การตอบกลับจาก Server:
              </h4>
              <pre className="text-xs text-yellow-200 bg-gray-900/70 p-3 rounded-lg overflow-auto border border-gray-600">
                {JSON.stringify(response, null, 2)}
              </pre>
              <p className="text-xs text-yellow-300 mt-3 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                ไม่พบลิงก์ดาวน์โหลดในการตอบกลับ กรุณาตรวจสอบการตั้งค่า n8n workflow
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}