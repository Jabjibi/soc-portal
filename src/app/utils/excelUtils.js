import * as XLSX from "xlsx";

export const readExcelFile = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length > 0) {
    const headers = jsonData[0];
    const data = jsonData.slice(1);
    
    return { headers, data };
  }
  
  return { headers: [], data: [] };
};

export const findDuplicateRows = (data) => {
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
  
  return duplicates;
};

export const exportToCSV = (headers, data, duplicateRows, fileName) => {
  const cleanedData = data.filter((_, index) => !duplicateRows.has(index));
  
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
  link.setAttribute('download', `cleaned_${fileName?.replace(/\.[^/.]+$/, '')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};