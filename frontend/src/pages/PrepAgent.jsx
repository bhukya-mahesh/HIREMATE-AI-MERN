import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";
import { Sparkles, Send } from "lucide-react";

const TOOL_LABELS = {
  listApplications: "Looking through your applications",
  getApplicationDetail: "Reading the application details",
  getStudentProfile: "Checking your profile and skills",
  analyzeResumeAgainstJD: "Scoring your resume against the JD",
  generateRoadmap: "Building your prep roadmap",
  getCampusVisitHistory: "Checking past campus visits",
  getRecentMockOAResults: "Reviewing your recent mock tests",
};

const SUGGESTIONS = [
  "Prep me for my next deadline",
  "Which application am I least ready for?",
  "Build me a plan for my closest drive",
];

export default function PrepAgent() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;

    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);

    try {
      const { data } = await api.post("/agent/prep", { message: question, history });
      setMessages((m) => [
        ...m,
        { role: "agent", text: data.answer, steps: data.steps || [] },
      ]);
      setHistory(data.history || []);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text:
            err.response?.data?.message ||
            "Something went wrong reaching the agent. Try again in a moment.",
          steps: [],
          isError: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            Prep Agent
          </h1>
          <p className="text-gray-500 mt-1">
            Ask it to prepare you for a drive — it reads your applications, scores your resume,
            and builds a roadmap sized to your actual deadline.
          </p>
        </div>

        <div className="flex-1 bg-white rounded-2xl border p-6 overflow-y-auto space-y-4 min-h-[300px]">
          {messages.length === 0 && !busy && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Try one of these:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-sm border border-gray-300 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              {m.role === "agent" && m.steps?.length > 0 && (
                <div className="mb-2 space-y-1">
                  {m.steps.map((s, j) => (
                    <p key={j} className="text-xs text-gray-400 flex items-center gap-1.5">
                      <span className={s.ok ? "text-green-500" : "text-amber-500"}>
                        {s.ok ? "✓" : "!"}
                      </span>
                      {TOOL_LABELS[s.tool] || s.tool}
                    </p>
                  ))}
                </div>
              )}
              <div
                className={`inline-block rounded-2xl px-4 py-3 text-sm max-w-[85%] whitespace-pre-wrap text-left ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : m.isError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {busy && (
            <p className="text-sm text-gray-400 animate-pulse">
              Working through it — this can take a few seconds...
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="e.g. Prep me for the  drive"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm disabled:bg-gray-50"
          />
          <button
            disabled={busy || !input.trim()}
            className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </form>
      </main>
    </div>
  );
}