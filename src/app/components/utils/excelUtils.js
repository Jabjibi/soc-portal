import * as XLSX from "xlsx";

export async function loadExcelPreview(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headerRow = jsonData[0];
    const dataRows = jsonData.slice(1);

    const duplicates = new Set();
    const seen = new Map();
    dataRows.forEach((row, index) => {
      const rowString = JSON.stringify(row);
      if (seen.has(rowString)) {
        duplicates.add(index);
        duplicates.add(seen.get(rowString));
      } else {
        seen.set(rowString, index);
      }
    });

    return { headers: headerRow, dataRows, duplicates };
  } catch (err) {
    console.error("โหลด Excel ไม่ได้:", err);
    throw new Error("ไม่สามารถอ่านไฟล์ Excel ได้");
  }
}

export function exportCleanedData(headers, excelData, duplicateRows, filename) {
  const cleanedData = excelData.filter((_, i) => !duplicateRows.has(i));

  const csvContent = [
    headers.join(','),
    ...cleanedData.map(row =>
      row.map(cell =>
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell || ''
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `cleaned_${filename?.replace(/\.[^/.]+$/, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
