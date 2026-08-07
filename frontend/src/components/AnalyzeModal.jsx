import { useState } from "react";
import api from "../api/axios.js";

export default function AnalyzeModal({ app, onClose, onUpdated }) {
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [status, setStatus] = useState("");

  const [roadmap, setRoadmap] = useState([]);

  const [busy, setBusy] = useState(false);

  const uploadJD = async () => {
    if (!jdFile) return;

    setBusy(true);
    setStatus("HireMate AI is analyzing the Job Description...");

    try {
      const form = new FormData();
      form.append("jd", jdFile);

      await api.post(
        `/ai/applications/${app._id}/analyze-jd`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setStatus(
        "JD analyzed successfully. Now upload your Resume."
      );

      onUpdated();
    } catch (err) {
      setStatus(
        err.response?.data?.message ||
          "JD Analysis Failed"
      );
    }

    setBusy(false);
  };

  const uploadResume = async () => {
    if (!resumeFile) return;

    setBusy(true);

    setStatus("Comparing Resume with JD...");

    try {
      const form = new FormData();

      form.append("resume", resumeFile);

      const { data } = await api.post(
        `/ai/applications/${app._id}/analyze-resume`,
        form,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setStatus(
        ` Resume Match : ${data.matchScore}%`
      );

      onUpdated();
    } catch (err) {
      setStatus(
        err.response?.data?.message ||
          "Resume Analysis Failed"
      );
    }

    setBusy(false);
  };

  const generateRoadmap = async () => {
    setBusy(true);

    setStatus(" Creating your preparation roadmap...");

    try {
      const { data } = await api.post(
        `/ai/applications/${app._id}/roadmap`,
        {
          days: 7,
        }
      );

      setRoadmap(data.roadmap);

      setStatus(
        " Personalized Roadmap Generated."
      );

      onUpdated();
    } catch (err) {
      setStatus(
        err.response?.data?.message ||
          "Roadmap Generation Failed"
      );
    }

    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <h2 className="text-2xl font-semibold">HireMate AI</h2>
          <p className="mt-1 text-sm text-blue-100">
            {app.company}
            {app.role && ` • ${app.role}`}
          </p>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800">Step 1 • Job Description</h3>
            <p className="mt-1 text-sm text-gray-500">Upload the company&apos;s JD PDF.</p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setJdFile(e.target.files[0])}
              className="mt-4 text-sm text-gray-700"
            />

            <button
              disabled={busy || !jdFile}
              onClick={uploadJD}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
            >
              Analyze JD
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800">Step 2 • Resume Analysis</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your latest resume.</p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="mt-4 text-sm text-gray-700"
            />

            <button
              disabled={busy || !resumeFile}
              onClick={uploadResume}
              className="mt-4 rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-40"
            >
              Analyze Resume
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800">Step 3 • AI Roadmap</h3>
            <p className="mt-1 text-sm text-gray-500">Generate a personalized study plan.</p>

            <button
              disabled={busy}
              onClick={generateRoadmap}
              className="mt-4 rounded-xl bg-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-40"
            >
              Generate Roadmap
            </button>
          </div>

          {status && (
            <div className="rounded-xl border-l-4 border-blue-600 bg-blue-50 p-4">
              <p className="text-sm text-slate-700">{status}</p>
            </div>
          )}

          {roadmap.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">7-Day Roadmap</h3>
              <div className="space-y-3">
                {roadmap.map((day) => (
                  <div key={day.day} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-800">
                      Day {day.day} • {day.topic}
                    </h4>

                    <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                      {day.tasks?.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-200 p-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}