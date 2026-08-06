import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Sidebar from "../components/Sidebar.jsx";
import ApplicationCard from "../components/ApplicationCard.jsx";
import AddApplicationModal from "../components/AddApplicationModal.jsx";
import MentorBanner from "../components/MentorBanner.jsx";
import AnalyzeModal from "../components/AnalyzeModal.jsx";


export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [analyzeApp, setAnalyzeApp] = useState(null);

  const loadApplications = async () => {
    try {
      const { data } = await api.get("/applications");
      setApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const addApplication = async (form) => {
    await api.post("/applications", form);
    setShowModal(false);
    loadApplications();
  };

  const markApplied = async (id) => {
    await api.patch(`/applications/${id}/mark-applied`);
    loadApplications();
  };

  const deleteApplication = async (id) => {
    await api.delete(`/applications/${id}`);
    loadApplications();
  };

  const notApplied = applications.filter(
    (app) => app.status === "not_applied"
  );

  const inProgress = applications.filter((app) =>
    ["applied", "oa", "interview", "result_awaited"].includes(app.status)
  );

  const closed = applications.filter((app) =>
    ["selected", "rejected", "missed"].includes(app.status)
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Track all your placement applications in one place.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition mt-4 md:mt-0"
          >
            + Add Company
          </button>
        </div>

        {/* AI Mentor */}
        <div className="mb-8">
          <MentorBanner />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <SummaryCard title="Not Applied" count={notApplied.length} color="text-red-600" />
          <SummaryCard title="In Progress" count={inProgress.length} color="text-yellow-600" />
          <SummaryCard title="Closed" count={closed.length} color="text-green-600" />
        </div>

        <Section
          title="Not Applied"
          applications={notApplied}
          onMarkApplied={markApplied}
          onDelete={deleteApplication}
          onAnalyze={setAnalyzeApp}
        />

        <Section
          title="In Progress"
          applications={inProgress}
          onMarkApplied={markApplied}
          onDelete={deleteApplication}
          onAnalyze={setAnalyzeApp}
        />

        <Section
          title="Closed"
          applications={closed}
          onMarkApplied={markApplied}
          onDelete={deleteApplication}
          onAnalyze={setAnalyzeApp}
        />
      </div>

      {showModal && (
        <AddApplicationModal
          onAdd={addApplication}
          onClose={() => setShowModal(false)}
        />
      )}

      {analyzeApp && (
        <AnalyzeModal
          app={analyzeApp}
          onClose={() => setAnalyzeApp(null)}
          onUpdated={loadApplications}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, count, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h2 className={`text-4xl font-bold mt-2 ${color}`}>{count}</h2>
    </div>
  );
}

function Section({ title, applications, onMarkApplied, onDelete, onAnalyze }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          No applications found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {applications.map((application) => (
            <ApplicationCard
              key={application._id}
              app={application}
              onMarkApplied={onMarkApplied}
              onDelete={onDelete}
              onAnalyze={onAnalyze}
            />
          ))}
        </div>
      )}
    </div>
  );
}