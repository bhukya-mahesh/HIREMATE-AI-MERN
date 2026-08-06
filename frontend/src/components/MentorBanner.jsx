import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function MentorBanner() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const { data } = await api.get("/ai/mentor-message");
        setMessage(data.message);
      } catch (err) {
        setMessage(
          "Welcome back! Keep your placement journey moving. Check your upcoming deadlines and complete today's tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200"></div>

          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 mb-8 text-white border border-slate-700">

      <div className="flex items-start gap-5">

        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-3xl shadow-lg">
          🤖
        </div>

        <div className="flex-1">

          <div className="flex items-center justify-between flex-wrap gap-3">

            <div>
              <h2 className="text-xl font-bold">
                HireMate AI Mentor
              </h2>

              <p className="text-sm text-slate-300 mt-1">
                Your Personal Placement Coach
              </p>
            </div>

            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold border border-green-400/20">
              ● Live
            </span>

          </div>

          <div className="mt-5 bg-white/10 rounded-xl p-4 border border-white/10">
            <p className="leading-7 text-slate-100">
              {message}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">

            <span>
              Updated just now
            </span>

            <span>
              Powered by Gemini AI
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}