"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import PullData from "./pullDatabase";

export default function ExcelUp() {
  const [file, setFile] = useState(null);
  const [editedFileUrl, setEditedFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [duplicateRows, setDuplicateRows] = useState(new Set());

  const resetForm = () => {
    setFile(null); setEditedFileUrl(null); setError(null); setResponse(null);
    setProgress(0); setDuplicateRows(new Set());
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = async e => {
    resetForm();
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls)$/i)) return setError("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
    setFile(f);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (json.length > 1) setDuplicateRows(findDuplicateRows(json.slice(1)));
    } catch {
      setError("ไม่สามารถอ่านไฟล์ Excel ได้");
    }
  };

  const findDuplicateRows = data => {
    const dup = new Set(), seen = new Map();
    data.forEach((row, i) => {
      const s = JSON.stringify(row);
      if (seen.has(s)) { dup.add(i); dup.add(seen.get(s)); }
      else seen.set(s, i);
    });
    return dup;
  };

  const sendFileToN8N = async () => {
    if (!file) return setError("กรุณาเลือกไฟล์ก่อน");
    setLoading(true); setError(null); setProgress(0);
    const fd = new FormData();
    fd.append("data", file);
    fd.append("fileName", file.name);
    fd.append("fileSize", file.size.toString());
    fd.append("timestamp", new Date().toISOString());
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch("https://ai.bmspcustomer.net/webhook/excel", {
        method: "POST", body: fd, signal: ctrl.signal, headers: { Accept: "application/json" }
      });
      clearTimeout(to);
      if (!res.ok) throw new Error((await res.json()).message || res.statusText);
      const data = await res.json();
      setResponse(data);
      setEditedFileUrl(data.editedFileUrl || data.downloadUrl || data.fileUrl);
      setProgress(100);
    } catch (err) {
      setError(err.name === "AbortError"
        ? "การส่งไฟล์หมดเวลา กรุณาลองใหม่อีกครั้ง"
        : err.message.includes("Failed to fetch")
        ? "ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
        : "เกิดข้อผิดพลาด: " + err.message);
    } finally { setLoading(false); }
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

          {/* Progress Bar */}
          {loading && (
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">กำลังประมวลผล... {progress}%</p>
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
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-xl p-6 text-green-200">
              ส่งไฟล์สำเร็จ! <br />
              <a
                href={editedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium"
              >
                ดาวน์โหลดไฟล์ที่แก้ไขแล้ว
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}