import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";
import UploadVisitsModal from "../components/UploadsVisitsModal.jsx";
import CompanyVisitCard from "../components/CompanyVisitCard.jsx";
import CompanyVisitDetailModal from "../components/CompanyVisitDetailModal.jsx";

const MONTHS = [
  { value: "", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function CampusVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const loadVisits = async (monthFilter = month) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/visits", {
        params: monthFilter ? { month: monthFilter } : {},
      });
      setVisits(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load campus visits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setMonth(value);
    loadVisits(value);
  };

  const handleUploaded = () => {
    setShowUpload(false);
    loadVisits();
  };

  const handleDeleted = () => {
    setSelectedVisit(null);
    loadVisits();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Campus Visits</h1>
            <p className="text-gray-500 mt-1">
              Upload past placement reports and filter which companies visited in a given month.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Upload Visit List
          </button>
        </div>

        <div className="bg-white rounded-xl border p-4 mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by month</label>
          <select
            value={month}
            onChange={handleMonthChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : visits.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
            {month
              ? "No companies found for this month. Try a different month or upload a report."
              : "No campus visits yet. Upload a report to get started."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visits.map((visit) => (
              <CompanyVisitCard key={visit._id} visit={visit} onOpen={setSelectedVisit} />
            ))}
          </div>
        )}

        {showUpload && (
          <UploadVisitsModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
        )}

        {selectedVisit && (
          <CompanyVisitDetailModal
            visit={selectedVisit}
            onClose={() => setSelectedVisit(null)}
            onDeleted={handleDeleted}
          />
        )}
      </main>
    </div>
  );
}