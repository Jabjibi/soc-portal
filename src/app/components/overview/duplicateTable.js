import { useState } from "react";

export default function DuplicateTable() {
  const [data, setData] = useState(null);

  const fetchDuplicates = async () => {
    const res = await fetch("https://ai.bmspcustomer.net/webhook-test/excelCheck", {
      method: "GET",
    });

    const json = await res.json();
    setData(json);
  };

  return (
    <div className="p-4">
      <button
        onClick={fetchDuplicates}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        โหลดข้อมูลซ้ำจาก n8n
      </button>

      {data && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            จำนวนข้อมูลซ้ำทั้งหมด: {data.duplicateCount}
          </h2>

          <table className="min-w-full bg-white border border-gray-300 shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">จำนวนที่ซ้ำ</th>
                <th className="px-4 py-2 border">อยู่ในแถวที่</th>
              </tr>
            </thead>
            <tbody>
              {data.duplicates.map((dup, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{dup.username}</td>
                  <td className="border px-4 py-2">{dup.count}</td>
                  <td className="border px-4 py-2">{dup.rows.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
