import React from "react";
import ResultDisplay from "./resultDesign";

export default function ExcelPreview({
  headers,
  excelData,
  duplicateRows,
  onHidePreview,
  onExportCleanedData,
   checkResponse,
  editedFileUrl,
  response,
  checkLoading
}) {
  console.log('ExcelPreview - duplicateRows:', duplicateRows.size); // Debug line
  
  return (
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
              onClick={onExportCleanedData}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ดาวน์โหลดข้อมูลที่กรองแล้ว
            </button>
          )}
          <button
            onClick={onHidePreview}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm font-medium transition-all duration-300"
          >
            ซ่อน
          </button>
        </div>
      </div>

      <div>
        <ResultDisplay
            editedFileUrl={editedFileUrl}
            response={response}
            checkResponse={checkResponse}
            checkLoading={checkLoading}
          />
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
  );
}