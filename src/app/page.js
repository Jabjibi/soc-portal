"use client";
import { useState, useEffect } from "react";
import ExcelUploader from "./components/overview/excelUpload";

export default function Home() {
  const [authorized, setAuthorized] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token === "token333") {
  //     setAuthorized(true);
  //   } else {
  //     setAuthorized(false);
  //     alert("Unauthorized access. Please use the correct token.");
  //   }
  // }, []);

  // if (!authorized) {
  //   return (
  //     <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 m-0">
  //       <div className="text-white">Unauthorized Access</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 m-0">
      <div className="w-full h-full">
        <ExcelUploader />
      </div>
    </div>
  );
}
