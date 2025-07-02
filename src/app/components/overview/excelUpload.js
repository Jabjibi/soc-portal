"use client";

import React, { useState } from "react";

import PullData from "./pullDatabase.js";
import { readExcelFile, findDuplicateRows } from "../../utils/excelUtils";
import FileUploadSection from "./fileUpSection";
import ExcelPreview from "./excelPreview";
import ActionButtons from "./actionButton";
import ResultDisplay from "./resultDesign";

export default function ExcelUploader() {
  // File states
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [duplicateRows, setDuplicateRows] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);

  // Upload states
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [editedFileUrl, setEditedFileUrl] = useState(null);

  // Check states
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResponse, setCheckResponse] = useState(null);

  const handleFileChange = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setEditedFileUrl(null);
    setResponse(null);
    setCheckResponse(null);
    setExcelData([]);
    setHeaders([]);
    setDuplicateRows(new Set());
    
    if (selectedFile && !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
      setFile(null);
      return;
    }

    if (selectedFile) {
      await loadExcelPreview(selectedFile);
      await checkFileWithN8N(selectedFile);
    }
  };

  const loadExcelPreview = async (file) => {
    try {
      const { headers, data } = await readExcelFile(file);
      setHeaders(headers);
      setExcelData(data);
      
      const duplicates = findDuplicateRows(data);
      console.log('Duplicates found:', duplicates.size, duplicates); // Debug line
      setDuplicateRows(duplicates);
      setShowPreview(true);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      setError('ไม่สามารถอ่านไฟล์ Excel ได้');
    }
  };

  const checkFileWithN8N = async (file) => {
    setCheckLoading(true);
    
    const formData = new FormData();
    formData.append("data", file);
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size.toString());
    formData.append("timestamp", new Date().toISOString());

    try {
      const res = await fetch("https://ai.bmspcustomer.net/webhook/excelCheck", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCheckResponse(data);
      }
    } catch (error) {
      console.error("Check API error:", error);
    } finally {
      setCheckLoading(false);
    }
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
          // Use status text if response is not JSON
        }
        
        throw new Error(errorMessage);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("การตอบกลับจาก server ไม่ใช่ JSON format");
      }

      const data = await res.json();
      setResponse(data);
      
      if (data.editedFileUrl || data.downloadUrl || data.fileUrl) {
        setEditedFileUrl(data.editedFileUrl || data.downloadUrl || data.fileUrl);
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
    setCheckResponse(null);
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
    
    const cleanedData = excelData.filter((_, index) => !duplicateRows.has(index));
    
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
          <FileUploadSection
            file={file}
            duplicateRows={duplicateRows}
            checkLoading={checkLoading}
            onFileChange={handleFileChange}
            error={error}
          />

          {showPreview && excelData.length > 0 && (
            <ExcelPreview
              headers={headers}
              excelData={excelData}
              duplicateRows={duplicateRows}
              onHidePreview={() => setShowPreview(false)}
              onExportCleanedData={exportCleanedData}
            />
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

          <ActionButtons
            loading={loading}
            file={file}
            onSendFile={sendFileToN8N}
            onReset={resetForm}
          />

          <div className="bg-gray-900 rounded-xl p-1">
            <PullData />
          </div>

          <ResultDisplay
            editedFileUrl={editedFileUrl}
            response={response}
            checkResponse={checkResponse}
            checkLoading={checkLoading}
          />
        </div>
      </div>
    </div>
  );
}