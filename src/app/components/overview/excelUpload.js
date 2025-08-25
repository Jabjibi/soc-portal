"use client";

import React, { useState } from "react";
import PullData from "./pullDatabase.js";
import { readExcelFile, findDuplicateRows } from "../../utils/excelUtils";
import FileUploadSection from "./fileUpSection";
import ExcelPreview from "./excelPreview";
import ActionButtons from "./actionButton";
import ResultDisplay from "./resultDesign";

export default function ExcelUploader() {
  // State grouping
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [duplicateRows, setDuplicateRows] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [editedFileUrl, setEditedFileUrl] = useState(null);

  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResponse, setCheckResponse] = useState(null);

  // --- Handlers ---
  const handleFileChange = async (selectedFile) => {
    resetStates();
    if (!isExcelFile(selectedFile)) return;

    setFile(selectedFile);
    await loadExcelPreview(selectedFile);
    await checkFileWithN8N(selectedFile);
  };

  const isExcelFile = (file) => {
    if (file && !file.name.match(/\.(xlsx|xls)$/i)) {
      setError("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
      setFile(null);
      return false;
    }
    return !!file;
  };

  const loadExcelPreview = async (file) => {
    try {
      const { headers, data } = await readExcelFile(file);
      setHeaders(headers);
      setExcelData(data);
      setDuplicateRows(findDuplicateRows(data));
      setShowPreview(true);
    } catch {
      setError("ไม่สามารถอ่านไฟล์ Excel ได้");
    }
  };

  const checkFileWithN8N = async (file) => {
    setCheckLoading(true);
    try {
      const res = await fetch("https://ai.bmspcustomer.net/webhook/excelCheck", {
        method: "POST",
        body: buildFormData(file),
        headers: { Accept: "application/json" },
      });
      if (res.ok) setCheckResponse(await res.json());
    } catch {}
    setCheckLoading(false);
  };

  const sendFileToN8N = async () => {
    if (!file) return setError("กรุณาเลือกไฟล์ก่อน");
    setLoading(true); setError(null); setUploadProgress(0);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("https://ai.bmspcustomer.net/webhook/excel", {
        method: "POST",
        body: buildFormData(file),
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(await getErrorMessage(res));
      const data = await res.json();
      setResponse(data);
      setEditedFileUrl(data.editedFileUrl || data.downloadUrl || data.fileUrl);
      setUploadProgress(100);
    } catch (error) {
      handleUploadError(error);
    } finally {
      setLoading(false);
    }
  };

  const buildFormData = (file) => {
    const formData = new FormData();
    formData.append("data", file);
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size.toString());
    formData.append("timestamp", new Date().toISOString());
    return formData;
  };

  const getErrorMessage = async (res) => {
    try {
      const errorData = await res.json();
      return errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`;
    } catch {
      return `HTTP ${res.status}: ${res.statusText}`;
    }
  };

  const handleUploadError = (error) => {
    if (error.name === "AbortError") {
      setError("การส่งไฟล์หมดเวลา กรุณาลองใหม่อีกครั้ง");
    } else if (error.message.includes("Failed to fetch")) {
      setError("ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    } else {
      setError("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const resetStates = () => {
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
    if (fileInput) fileInput.value = "";
  };

  const exportCleanedData = () => {
    if (!excelData.length) return;
    const cleanedData = excelData.filter((_, i) => !duplicateRows.has(i));
    const csvContent = [
      headers.join(","),
      ...cleanedData.map(row =>
        row.map(cell =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell || ""
        ).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cleaned_${file?.name?.replace(/\.[^/.]+$/, "")}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black px-10 py-3">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Excel File Uploader
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
            <span className="text-red-400 font-semibold">DUPLICATE DETECTOR</span>
            <div className="h-1 w-12 bg-gradient-to-l from-red-600 to-red-400 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-4 space-y-4">
          <FileUploadSection
            file={file}
            duplicateRows={duplicateRows}
            checkLoading={checkLoading}
            onFileChange={handleFileChange}
            error={error}
          />

          <ResultDisplay
            editedFileUrl={editedFileUrl}
            response={response}
            checkResponse={checkResponse}
            checkLoading={checkLoading}
          />

          {loading && (
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">
                กำลังประมวลผล... {uploadProgress}%
              </p>
            </div>
          )}

          <ActionButtons
            loading={loading}
            file={file}
            onSendFile={sendFileToN8N}
            onReset={resetStates}
          />

          <div className="bg-gray-900 rounded-xl p-1">
            <PullData />
          </div>
        </div>
      </div>
    </div>
  );
}