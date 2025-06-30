"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import PullData from "./pullDatabase";

export default function ExcelUploader() {
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Excel File Uploader & Duplicate Detector</h2>
      
      <div className="space-y-6">
        {/* File Input Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-sm text-gray-600">เลือกไฟล์ Excel (.xlsx หรือ .xls)</p>
          
          {file && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">ไฟล์ที่เลือก:</p>
              <p className="text-sm text-gray-600">{file.name}</p>
              <p className="text-xs text-gray-500">ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              {duplicateRows.size > 0 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  พบข้อมูลซ้ำ {duplicateRows.size} แถว
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-800">
                <p className="text-sm font-medium">เกิดข้อผิดพลาด</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Excel Preview */}
        {showPreview && excelData.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                ตัวอย่างข้อมูล Excel ({excelData.length} แถว)
              </h3>
              <div className="flex space-x-2">
                {duplicateRows.size > 0 && (
                  <button
                    onClick={exportCleanedData}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    📥 ดาวน์โหลดข้อมูลที่กรองแล้ว
                  </button>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  ซ่อน
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-96 border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 border-r">#</th>
                    {headers.map((header, index) => (
                      <th key={index} className="px-2 py-2 text-left font-medium text-gray-700 border-r">
                        {header || `Column ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(0, 100).map((row, rowIndex) => (
                    <tr 
                      key={rowIndex} 
                      className={`border-b hover:bg-gray-50 ${
                        duplicateRows.has(rowIndex) 
                          ? 'bg-red-100 border-red-300' 
                          : 'bg-white'
                      }`}
                    >
                      <td className="px-2 py-1 border-r font-mono text-gray-500">
                        {rowIndex + 1}
                        {duplicateRows.has(rowIndex) && (
                          <span className="ml-1 text-red-600">⚠️</span>
                        )}
                      </td>
                      {headers.map((_, colIndex) => (
                        <td key={colIndex} className="px-2 py-1 border-r">
                          {row[colIndex] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {excelData.length > 100 && (
              <p className="text-xs text-gray-600 mt-2">
                แสดงเพียง 100 แถวแรก จากทั้งหมด {excelData.length} แถว
              </p>
            )}
            
            {duplicateRows.size > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800">
                  🔍 พบข้อมูลซ้ำ {duplicateRows.size} แถว (ไฮไลท์ด้วยสีแดง)
                </p>
                <p className="text-xs text-red-600 mt-1">
                  แถวที่ซ้ำ: {Array.from(duplicateRows).map(i => i + 1).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={sendFileToN8N}
            disabled={loading || !file}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "กำลังส่งไฟล์..." : "ส่งไฟล์ไปที่ n8n"}
          </button>
          
          <button
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            รีเซ็ต
          </button>
        </div>

        <div>
            <PullData />
        </div>

        {/* Success Response */}
        {editedFileUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">ส่งไฟล์สำเร็จ!</h3>
            <a
              href={editedFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              📥 ดาวน์โหลดไฟล์ที่แก้ไขแล้ว
            </a>
          </div>
        )}

        {/* Debug Response */}
        {response && !editedFileUrl && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">การตอบกลับจาก Server:</h4>
            <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
            <p className="text-xs text-yellow-600 mt-2">
              * ไม่พบลิงก์ดาวน์โหลดในการตอบกลับ กรุณาตรวจสอบการตั้งค่า n8n workflow
            </p>
          </div>
        )}
      </div>
    </div>
  );
}