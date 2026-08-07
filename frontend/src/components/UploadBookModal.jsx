import { useState } from "react";
import api from "../api/axios.js";

export default function UploadBookModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setStatus("Uploading and generating syllabus... this can take a moment for large books.");
    try {
      const form = new FormData();
      form.append("book", file);
      if (title.trim()) form.append("title", title.trim());
      await api.post("/study/books", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUploaded();
    } catch (err) {
      setStatus(err.response?.data?.message || "Upload failed");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form onSubmit={submit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="font-semibold text-lg text-slate-800">Upload a Book</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book title (optional)"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm"
          required
        />

        {status && <p className="text-xs text-gray-500">{status}</p>}

        <div className="flex gap-2">
          <button
            disabled={busy || !file}
            className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm disabled:opacity-40"
          >
            {busy ? "Processing..." : "Upload & Generate Syllabus"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 border rounded-lg py-2 text-sm disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}