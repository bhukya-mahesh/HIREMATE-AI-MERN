import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios.js";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Field = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  ) : null;

export default function CompanyVisitDetailModal({ visit, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const dateLabel =
    visit.rawDateText ||
    [visit.visitMonth ? MONTH_NAMES[visit.visitMonth] : null, visit.visitYear]
      .filter(Boolean)
      .join(" ") ||
    "Date not specified";

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/visits/${visit._id}`);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{dateLabel}</p>
            <h2 className="text-xl font-semibold text-gray-900">{visit.company}</h2>
            {visit.role && <p className="text-sm text-gray-500 mt-1">{visit.role}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          <Field label="Work Location" value={visit.workLocation} />
          <Field label="Max Selections" value={visit.maxSelections != null ? visit.maxSelections : null} />
          <Field label="Bond" value={visit.bond} />
          <Field label="Package Offered" value={visit.packageOffered} />
          <div className="col-span-2">
            <Field label="Eligibility" value={visit.eligibility} />
          </div>
          <div className="col-span-2">
            <Field label="Other Details" value={visit.otherDetails} />
          </div>
        </div>

        {error && <p className="px-6 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}