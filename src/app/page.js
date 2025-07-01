"use client";
import ExcelUp from "./components/overview/overview";
import Sidebar from "./components/sidebar/sibebar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black">
      <div className="w-64 h-screen fixed top-0 left-0">
        <Sidebar />
      </div>

      <main className="ml-64 flex-1 p-6">
        {localStorage.getItem('api-token') ? (
          <h1 className="text-2xl font-bold text-white mb-4">Welcome back! {localStorage.getItem('api-token')}</h1>
        ) : (
          <h1 className="text-2xl font-bold text-white mb-4">Please log in</h1>
        )}
        <ExcelUp />
      </main>
    </div>
  );
}

