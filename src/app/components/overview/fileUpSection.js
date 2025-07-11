import React from "react";

export default function FileUploadSection({
  file,
  duplicateRows,
  checkResponse,
  checkLoading,
  onFileChange,
  error,
}) {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    onFileChange(selectedFile);
  };

  return (
    <>
      {/* File Input Section */}
      <div className="relative">
        <div className="border-2 border-dashed border-red-500/50 rounded-xl p-8 text-center bg-gray-900/50 hover:bg-gray-900/70 transition-all duration-300 hover:border-red-400">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
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
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {checkLoading && (
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-400 animate-spin"
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
                )}
              </div>

              {duplicateRows.size > 0 && (
                <div className="mt-3 p-2 bg-red-900/50 border border-red-500/50 rounded-lg">
                  <p className="text-xs text-red-300 font-medium flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    พบข้อมูลซ้ำ {duplicateRows.size} แถว
                  </p>
                </div>
              )}
            </div>
          )}

          {checkResponse && (
            <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
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
                <h4 className="text-lg font-semibold text-blue-300 ml-3">
                  ผลการตรวจสอบจาก n8n Check API
                </h4>
              </div>

              {/* แสดงสถิติข้อมูลซ้ำ */}
              <div className="mb-4 p-3 bg-blue-800/30 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <span className="font-semibold">จำนวนข้อมูลซ้ำทั้งหมด:</span>{" "}
                  {checkResponse.duplicateCount || 0} รายการ
                </p>
              </div>

              {/* ตารางแสดงข้อมูลซ้ำ */}
              {checkResponse.duplicates &&
                checkResponse.duplicates.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-blue-500/30">
                    <table className="min-w-full bg-blue-800/20 border border-blue-500/30">
                      <thead>
                        <tr className="bg-blue-700/40 text-blue-200">
                          <th className="px-4 py-3 border border-blue-500/30 text-left">
                            #
                          </th>
                          <th className="px-4 py-3 border border-blue-500/30 text-left">
                            Username
                          </th>
                          <th className="px-4 py-3 border border-blue-500/30 text-center">
                            จำนวนที่ซ้ำ
                          </th>
                          <th className="px-4 py-3 border border-blue-500/30 text-left">
                            อยู่ในแถวที่
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkResponse.duplicates.map((dup, index) => (
                          <tr
                            key={index}
                            className="hover:bg-blue-700/20 transition-colors duration-200"
                          >
                            <td className="border border-blue-500/30 px-4 py-2 text-blue-200">
                              {index + 1}
                            </td>
                            <td className="border border-blue-500/30 px-4 py-2 text-blue-200">
                              {dup.username}
                            </td>
                            <td className="border border-blue-500/30 px-4 py-2 text-center text-blue-300 font-semibold">
                              {dup.count}
                            </td>
                            <td className="border border-blue-500/30 px-4 py-2 text-blue-200">
                              {dup.rows.join(", ")}
                            </td>
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
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-300">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
