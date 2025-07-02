"use client";
import ExcelUploader from "./components/overview/excelUpload";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 m-0">
      <div className="w-full h-full">
        <ExcelUploader />
      </div>
    </div>
  );
}