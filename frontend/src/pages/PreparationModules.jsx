import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";

export default function PreparationModules() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/auth/profile");
    setRoadmap(data.skillProfile?.roadmap || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleTask = async (day, done) => {
    await api.patch("/auth/roadmap-task", { day, done: !done });
    load();
  };

  const doneCount = roadmap.filter((r) => r.done).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Preparation Modules</h1>
        <p className="text-gray-500 mb-6">
          Your AI-generated prep roadmap, built from the skill gaps found in your latest resume analysis.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : roadmap.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
            No roadmap yet. Open a company's "JD Analyser" on the dashboard and generate a prep roadmap.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border p-4 mb-6">
              <p className="text-sm text-gray-500">
                Progress: {doneCount}/{roadmap.length} tasks completed
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div
                  className="bg-slate-800 h-2 rounded-full transition-all"
                  style={{ width: `${roadmap.length ? (doneCount / roadmap.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {roadmap.map((r) => (
                <div key={r.day} className="bg-white rounded-xl border p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={r.done}
                    onChange={() => toggleTask(r.day, r.done)}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <p className={`font-medium ${r.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                      Day {r.day}: {r.topic}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}