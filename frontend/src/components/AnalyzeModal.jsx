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
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-6">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">

        {/* Header */}

        <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6">

          <h2 className="text-2xl font-bold">
             HireMate AI
          </h2>

          <p className="text-slate-300 mt-1">
            {app.company}
            {app.role && ` • ${app.role}`}
          </p>

        </div>

        {/* Body */}

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* STEP 1 */}

          <div className="border rounded-2xl p-5">

            <h3 className="font-semibold text-lg">
               Step 1 • Job Description
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Upload the company's JD PDF.
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setJdFile(e.target.files[0])
              }
              className="mt-4"
            />

            <button
              disabled={busy || !jdFile}
              onClick={uploadJD}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl disabled:opacity-40"
            >
              Analyze JD
            </button>

          </div>

          {/* STEP 2 */}

          <div className="border rounded-2xl p-5">

            <h3 className="font-semibold text-lg">
               Step 2 • Resume Analysis
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Upload your latest Resume.
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setResumeFile(
                  e.target.files[0]
                )
              }
              className="mt-4"
            />

            <button
              disabled={busy || !resumeFile}
              onClick={uploadResume}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl disabled:opacity-40"
            >
              Analyze Resume
            </button>

          </div>

          {/* STEP 3 */}

          <div className="border rounded-2xl p-5">

            <h3 className="font-semibold text-lg">
               Step 3 • AI Roadmap
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Generate a personalized study plan.
            </p>

            <button
              disabled={busy}
              onClick={generateRoadmap}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl disabled:opacity-40"
            >
              Generate Roadmap
            </button>

          </div>

          {/* AI STATUS */}

          {status && (
            <div className="bg-slate-100 rounded-xl p-4 border-l-4 border-blue-600">

              <p className="text-sm text-slate-700">
                {status}
              </p>

            </div>
          )}

          {/* Roadmap */}

          {roadmap.length > 0 && (

            <div>

              <h3 className="font-bold text-lg mb-4">
                 7-Day Roadmap
              </h3>

              <div className="space-y-3">

                {roadmap.map((day) => (

                  <div
                    key={day.day}
                    className="border rounded-xl p-4 bg-gray-50"
                  >

                    <h4 className="font-semibold">

                      Day {day.day} • {day.topic}

                    </h4>

                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">

                      {day.tasks?.map(
                        (task, index) => (

                          <li key={index}>
                            {task}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

        {/* Footer */}

        <div className="border-t p-5 flex justify-end">

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border hover:bg-gray-100"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}