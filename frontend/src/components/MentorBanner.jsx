import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import api from "../api/axios.js";

export default function MentorBanner() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const { data } = await api.get("/ai/mentor-message");
        setMessage(data.message);
      } catch {
        setMessage(
          "Welcome back! Stay consistent with your placement preparation. Complete today's tasks and keep your streak alive."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-44 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-sm">

      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center">
          <Sparkles size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            HireMate AI Mentor
          </h2>
          <p className="text-sm text-blue-100">
            Personalized guidance for your placement journey
          </p>
        </div>

      </div>

      <div className="mt-5 bg-white/10 rounded-lg p-4">
        <p className="leading-7 text-sm">
          {message}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-blue-100">

        <span>Updated just now</span>

        <span>Gemini AI</span>

      </div>

    </div>
  );
}