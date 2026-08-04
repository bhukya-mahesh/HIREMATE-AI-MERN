import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import ApplicationCard from "../components/ApplicationCard.jsx";
import AddApplicationModal from "../components/AddApplicationModal.jsx";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const loadApplications = async () => {
    try {
      const { data } = await api.get("/applications");
      setApplications(data);
    } catch (error) {
      console.error(error);
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

  const logout = () => {
    localStorage.clear();
    navigate("/login");
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome{name ? `, ${name}` : ""}
            </h1>

            <p className="text-gray-500 mt-1">
              Track all your placement applications in one place.
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Application
            </button>

            <button
              onClick={logout}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Summary */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <SummaryCard
            title="Not Applied"
            count={notApplied.length}
            color="text-red-600"
          />

          <SummaryCard
            title="In Progress"
            count={inProgress.length}
            color="text-yellow-600"
          />

          <SummaryCard
            title="Closed"
            count={closed.length}
            color="text-green-600"
          />

        </div>

        <Section
          title="Not Applied"
          applications={notApplied}
          onMarkApplied={markApplied}
          onDelete={deleteApplication}
        />

        <Section
          title="In Progress"
          applications={inProgress}
          onMarkApplied={markApplied}
          onDelete={deleteApplication}
        />

        <Section
          title="Closed"
          applications={closed}
          onMarkApplied={markApplied}
          onDelete={deleteApplication}
        />

      </div>

      {showModal && (
        <AddApplicationModal
          onAdd={addApplication}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, count, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {count}
      </h2>
    </div>
  );
}

function Section({
  title,
  applications,
  onMarkApplied,
  onDelete,
}) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {title}
      </h2>

      {applications.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}