import React from "react";

export default function ResultDisplay({
  checkResponse,
  editedFileUrl,
  response,
  checkLoading
}) {
  return (
    <>
      {/* Check Response from excelCheck API */}
      {checkLoading && (
        <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-300">กำลังตรวจสอบไฟล์กับ n8n...</p>
            </div>
          </div>
        </div>
      )}

      {checkResponse && (
        <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-blue-300 ml-3">ผลการตรวจสอบจาก n8n Check API</h4>
          </div>

          {/* แสดงสถิติข้อมูลซ้ำ */}
          <div className="mb-4 p-3 bg-blue-800/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              <span className="font-semibold">จำนวนข้อมูลซ้ำทั้งหมด:</span> {checkResponse.duplicateCount || 0} รายการ
            </p>
          </div>

          {/* ตารางแสดงข้อมูลซ้ำ */}
          {checkResponse.duplicates && checkResponse.duplicates.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-blue-500/30">
              <table className="min-w-full bg-blue-800/20 border border-blue-500/30">
                <thead>
                  <tr className="bg-blue-700/40 text-blue-200">
                    <th className="px-4 py-3 border border-blue-500/30 text-left">#</th>
                    <th className="px-4 py-3 border border-blue-500/30 text-left">Username</th>
                    <th className="px-4 py-3 border border-blue-500/30 text-center">จำนวนที่ซ้ำ</th>
                    <th className="px-4 py-3 border border-blue-500/30 text-left">อยู่ในแถวที่</th>
                  </tr>
                </thead>
                <tbody>
                  {checkResponse.duplicates.map((dup, index) => (
                    <tr key={index} className="hover:bg-blue-700/20 transition-colors duration-200">
                      <td className="border border-blue-500/30 px-4 py-2 text-blue-200">{index + 1}</td>
                      <td className="border border-blue-500/30 px-4 py-2 text-blue-200">{dup.username}</td>
                      <td className="border border-blue-500/30 px-4 py-2 text-center text-blue-300 font-semibold">{dup.count}</td>
                      <td className="border border-blue-500/30 px-4 py-2 text-blue-200">{dup.rows.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* แสดง JSON raw data สำหรับ debug (ซ่อนได้) */}
          <details className="mt-4">
            <summary className="text-blue-300 cursor-pointer text-sm hover:text-blue-200 transition-colors">
              แสดงข้อมูล JSON แบบเต็ม (สำหรับ debug)
            </summary>
            <div className="bg-gray-900/70 p-3 rounded-lg border border-gray-600 mt-2">
              <pre className="text-xs text-blue-200 overflow-auto">
                {JSON.stringify(checkResponse, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

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
    </>
  );
}
