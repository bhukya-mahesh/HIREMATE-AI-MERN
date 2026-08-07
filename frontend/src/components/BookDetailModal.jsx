import { useState } from "react";
import api from "../api/axios.js";

export default function BookDetailModal({ book, onClose, onUpdated }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);

  const [tab, setTab] = useState("modules"); // "modules" | "ask"
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chat, setChat] = useState(book.chatHistory || []);

  const openModule = async (index) => {
    setOpenIndex(index);
    setExplanation("");
    const mod = book.modules[index];

    if (mod.explanation) {
      setExplanation(mod.explanation);
      return;
    }

    setLoadingExplain(true);
    try {
      const { data } = await api.post(`/study/books/${book._id}/modules/${index}/explain`);
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation(err.response?.data?.message || "Failed to generate explanation");
    }
    setLoadingExplain(false);
  };

  const toggleDone = async (index, currentDone) => {
    await api.patch(`/study/books/${book._id}/modules/${index}`, { done: !currentDone });
    onUpdated();
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setQuestion("");
    try {
      const { data } = await api.post(`/study/books/${book._id}/ask`, { question: q });
      setChat((prev) => [
        ...prev,
        { question: q, answer: data.answer, sourceModuleIndexes: data.sources.map((s) => s.index) }
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { question: q, answer: err.response?.data?.message || "Something went wrong.", sourceModuleIndexes: [] }
      ]);
    }
    setAsking(false);
  };

  const total = book.modules.length;
  const done = book.modules.filter((m) => m.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-xl text-slate-800">{book.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {done}/{total} modules studied ({percent}%)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab("modules")}
            className={`px-4 py-2 text-sm font-medium ${tab === "modules" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`}
          >
            Modules
          </button>
          <button
            onClick={() => setTab("ask")}
            className={`px-4 py-2 text-sm font-medium ${tab === "ask" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`}
          >
            Ask AI (RAG)
          </button>
        </div>

        {tab === "modules" && (
          <div className="space-y-2">
            {book.modules.map((mod, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-gray-50">
                  <input
                    type="checkbox"
                    checked={mod.done}
                    onChange={() => toggleDone(i, mod.done)}
                    className="w-4 h-4"
                  />
                  <button
                    onClick={() => openModule(i)}
                    className={`flex-1 text-left text-sm font-medium ${mod.done ? "line-through text-gray-400" : "text-gray-800"}`}
                  >
                    {i + 1}. {mod.title}
                  </button>
                </div>

                {openIndex === i && (
                  <div className="p-4 text-sm text-gray-700 leading-relaxed border-t bg-white">
                    {mod.summary && <p className="text-xs text-gray-400 mb-2 italic">{mod.summary}</p>}
                    {loadingExplain ? (
                      <p className="text-gray-400">Generating explanation...</p>
                    ) : (
                      <p className="whitespace-pre-line">{explanation}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "ask" && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              Answers are retrieved from the most relevant sections of this book (RAG) — not
              general knowledge. Ask something specific about the content.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {chat.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No questions asked yet.</p>
              )}
              {chat.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 inline-block max-w-[85%] ml-auto">
                    {c.question}
                  </div>
                  <div className="bg-gray-100 text-gray-800 text-sm rounded-lg px-3 py-2 max-w-[85%]">
                    {c.answer}
                    {c.sourceModuleIndexes?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Sources: {c.sourceModuleIndexes.map((idx) => book.modules[idx]?.title).filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {asking && <p className="text-sm text-gray-400">Retrieving relevant sections and answering...</p>}
            </div>

            <form onSubmit={askQuestion} className="flex gap-2 border-t pt-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about this book..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                disabled={asking}
              />
              <button
                disabled={asking || !question.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40"
              >
                Ask
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}