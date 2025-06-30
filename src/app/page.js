import ExcelUploader from "./components/overview/overview";
import Sidebar from "./components/sidebar/sibebar";

export default function Home() {
  return (
   <div className="flex min-h-screen">
    <div className="w-64 h-screen fixed top-0 left-0">
      <Sidebar />
    </div>
      
      <main className="ml-64 flex-1 p-6">
        {/* <LeakTable /> */}
        <ExcelUploader />
      </main>
    </div>
  );
}
