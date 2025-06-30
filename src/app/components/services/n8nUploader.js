export async function sendFileToN8N(file, setUploadProgress) {
  if (!file) return { success: false, error: "ไม่มีไฟล์" };

  const formData = new FormData();
  formData.append("data", file);
  formData.append("fileName", file.name);
  formData.append("fileSize", file.size.toString());
  formData.append("timestamp", new Date().toISOString());

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch("https://ai.bmspcustomer.net/webhook/excel", {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || res.statusText);
    }

    const data = await res.json();
    setUploadProgress(100);
    return { success: true, data };
  } catch (err) {
    console.error("Upload error:", err);
    const msg =
      err.name === "AbortError"
        ? "หมดเวลาในการส่งไฟล์"
        : err.message.includes("fetch")
        ? "เชื่อมต่อ server ไม่ได้"
        : "เกิดข้อผิดพลาด: " + err.message;
    return { success: false, error: msg };
  }
}
