import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Target,
} from "lucide-react";

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
    await api.patch("/auth/roadmap-task", {
      day,
      done: !done,
    });

    load();
  };

  const doneCount = roadmap.filter((r) => r.done).length;

  const progress =
    roadmap.length === 0
      ? 0
      : Math.round((doneCount / roadmap.length) * 100);

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen size={28} />
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Preparation Roadmap
              </h1>

              <p className="text-blue-100 mt-2">
                AI-generated roadmap based on your resume
                analysis and skill gaps.
              </p>

            </div>

          </div>

        </div>

        {loading ? (

          <div className="mt-8 bg-white rounded-2xl p-10 text-center text-gray-500">
            Loading roadmap...
          </div>

        ) : roadmap.length === 0 ? (

          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-12 text-center">

            <BookOpen
              size={45}
              className="mx-auto text-gray-300 mb-4"
            />

            <h2 className="text-xl font-semibold text-gray-700">
              No Preparation Roadmap
            </h2>

            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Analyze a Job Description from your dashboard to
              generate an AI-powered personalized preparation
              roadmap.
            </p>

          </div>

        ) : (

          <>

            {/* Progress Card */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8">

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Overall Progress
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {doneCount} of {roadmap.length} tasks completed
                  </p>

                </div>

                <div className="text-3xl font-bold text-blue-600">
                  {progress}%
                </div>

              </div>

              <div className="mt-5 w-full bg-gray-200 rounded-full h-3">

                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            {/* Daily Tasks */}

            <div className="mt-8 space-y-4">

              {roadmap.map((task) => (

                <div
                  key={task.day}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-start justify-between"
                >

                  <div className="flex gap-4">

                    <button
                      onClick={() =>
                        toggleTask(task.day, task.done)
                      }
                    >
                      {task.done ? (
                        <CheckCircle2
                          className="text-green-500"
                          size={24}
                        />
                      ) : (
                        <Circle
                          className="text-gray-400"
                          size={24}
                        />
                      )}
                    </button>

                    <div>

                      <p
                        className={`font-semibold ${
                          task.done
                            ? "line-through text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        Day {task.day}
                      </p>

                      <p
                        className={`mt-1 ${
                          task.done
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {task.topic}
                      </p>

                    </div>

                  </div>

                  <Target
                    size={18}
                    className="text-blue-500 mt-1"
                  />

                </div>

              ))}

            </div>

          </>

        )}

      </main>

    </div>
  );
}