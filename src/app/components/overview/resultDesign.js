import React from "react";

export default function ResultDisplay({
  checkResponse,
  editedFileUrl,
  response,
  checkLoading,
}) {
  return (
    <>
      {/* Check Response from excelCheck API */}
      {checkLoading && (
        <div className="bg-neutral-800/60 border border-neutral-600/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-rose-400 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-300">
                กำลังตรวจสอบไฟล์กับ n8n...
              </p>
            </div>
          </div>
        </div>
      )}

      {checkResponse && (
        <div className="bg-black border border-neutral-600/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-neutral-200 ml-3">
              ผลการตรวจสอบจาก n8n Check API
            </h4>
          </div>

          {/* ตารางสำหรับข้อมูลที่ไม่ซ้ำ */}
          {checkResponse.uniques && checkResponse.uniques.length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-600/40">
              <h4 className="text-rose-600 font-semibold text-lg mb-3 flex items-center ml-3 mt-3">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                รายการที่ไม่ซ้ำ ({checkResponse.uniques.length})
              </h4>
              <div className="rounded-lg overflow-hidden border border-neutral-600/40">
                <table className="min-w-full bg-neutral-800/40 text-sm text-neutral-200">
                  <thead>
                    <tr className="bg-neutral-700/60 border-b border-neutral-600/40">
                      <th className="px-4 py-3 text-left font-medium text-neutral-300">#</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-300">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-300">Row</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-300">Password</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-300">Source</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-300">Scan Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/40">
                    {checkResponse.uniques.map((item, index) => (
                      <tr key={index} className="hover:bg-neutral-700/30 transition-colors duration-150">
                        <td className="px-4 py-3 text-neutral-400 font-medium">{index + 1}</td>
                        <td className="px-4 py-3 text-rose-700 font-medium">{item.email}</td>
                        <td className="px-4 py-3 text-neutral-300">{item.row}</td>
                        <td className="px-4 py-3 text-neutral-300 font-mono text-xs">{item.data["Password"]}</td>
                        <td className="px-4 py-3 text-neutral-300">{item.data["Source Name"]}</td>
                        <td className="px-4 py-3 text-neutral-400 text-xs">{item.data["Scan Date (Asia/Bangkok  GMT+07:00)"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* แสดง JSON raw data สำหรับ debug (ซ่อนได้) */}
          <details className="mt-6">
            <summary className="text-neutral-400 cursor-pointer text-sm hover:text-rose-700 transition-colors duration-200 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              แสดงข้อมูล JSON แบบเต็ม (สำหรับ debug)
            </summary>
            <div className="bg-black/40 p-4 rounded-lg border border-neutral-700/50 mt-3">
              <pre className="text-xs text-neutral-400 overflow-auto max-h-64">
                {JSON.stringify(checkResponse, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Success Response */}
      {editedFileUrl && (
        <div className="bg-gradient-to-r from-neutral-800/60 to-neutral-700/60 border border-rose-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-400 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-neutral-200 ml-3">
              ส่งไฟล์สำเร็จ!
            </h3>
          </div>
          <a
            href={editedFileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-lg hover:from-rose-600 hover:to-rose-500 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            ดาวน์โหลดไฟล์ที่แก้ไขแล้ว
          </a>
        </div>
      )}

      {/* Debug Response */}
      {response && !editedFileUrl && (
        <div className="bg-neutral-800/50 border border-neutral-600/50 rounded-xl p-4 backdrop-blur-sm">
          <h4 className="text-sm font-medium text-neutral-300 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            การตอบกลับจาก Server:
          </h4>
          <div className="bg-black/40 p-4 rounded-lg border border-neutral-700/50">
            <pre className="text-xs text-neutral-400 overflow-auto max-h-48">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
          <div className="mt-3 p-3 bg-rose-900/20 border border-rose-500/30 rounded-lg">
            <p className="text-xs text-rose-300 flex items-center">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              ไม่พบลิงก์ดาวน์โหลดในการตอบกลับ กรุณาตรวจสอบการตั้งค่า n8n workflow
            </p>
          </div>
        </div>
      )}
    </>
  );
}