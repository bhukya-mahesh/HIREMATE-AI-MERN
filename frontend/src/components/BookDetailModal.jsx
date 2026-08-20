import { useState } from "react";
import { ArrowUp, X } from "lucide-react";
import api from "../api/axios.js";

const renderBoldText = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderAssistantText = (text) => {
  const cleanedText = text
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return cleanedText.split(/\n\s*\n/).map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const heading = lines.length === 1 && lines[0].match(/^(?:#{1,3}\s+|\*\*)(.*?)(?:\*\*)?:?$/);
    const list = lines.every((line) => /^[-*]\s+/.test(line) || /^\d+[.)]\s+/.test(line));

    if (heading) {
      return (
        <h4 key={blockIndex} className="text-sm font-semibold text-gray-900">
          {heading[1].replace(/\*\*/g, "")}
        </h4>
      );
    }

    if (list) {
      return (
        <ul key={blockIndex} className="list-disc space-y-1 pl-5">
          {lines.map((line, index) => (
            <li key={index}>{renderBoldText(line.replace(/^[-*]\s+|^\d+[.)]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex}>
        {renderBoldText(lines.join(" ").replace(/^#{1,3}\s+/, ""))}
      </p>
    );
  });
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]">
      <div className="flex h-[calc(100vh-2rem)] max-h-[900px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
          <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Study guide</p>
              <h2 className="text-xl font-semibold text-gray-900">{book.title}</h2>
          </div>
            <button
              onClick={onClose}
              aria-label="Close book details"
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={19} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="shrink-0 text-xs font-medium text-gray-500">
              {done}/{total} completed
            </span>
          </div>
        </div>

        <div className="flex gap-6 border-b border-gray-100 px-6">
          <button
            onClick={() => setTab("modules")}
            className={`border-b-2 px-1 py-3 text-sm font-medium transition ${tab === "modules" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            Modules
          </button>
          <button
            onClick={() => setTab("ask")}
            className={`border-b-2 px-1 py-3 text-sm font-medium transition ${tab === "ask" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            Ask HireMate AI
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {tab === "modules" && (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {book.modules.map((mod, i) => (
              <div key={i} className="overflow-hidden first:rounded-t-xl last:rounded-b-xl">
                <div className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={mod.done}
                    onChange={() => toggleDone(i, mod.done)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <button
                    onClick={() => openModule(i)}
                    className={`flex-1 text-left text-sm font-medium ${mod.done ? "text-gray-400 line-through" : "text-gray-800"}`}
                  >
                    {i + 1}. {mod.title}
                  </button>
                </div>

                {openIndex === i && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-11 py-4 text-sm leading-relaxed text-gray-700">
                    {mod.summary && <p className="mb-2 text-xs italic text-gray-400">{mod.summary}</p>}
                    {loadingExplain ? (
                      <p className="text-gray-400">Generating explanation...</p>
                    ) : (
                      <div className="space-y-3">{renderAssistantText(explanation)}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            </div>
          )}

          {tab === "ask" && (
            <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Answers are retrieved from the most relevant sections of this book (RAG) — not
              general knowledge. Ask something specific about the content.
            </p>

            <div className="max-h-80 space-y-4 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              {chat.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No questions asked yet.</p>
              )}
              {chat.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="ml-auto inline-block max-w-[85%] rounded-xl rounded-br-sm bg-blue-600 px-3 py-2 text-sm text-white">
                    {c.question}
                  </div>
                  <div className="max-w-[85%] rounded-xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                    <div className="space-y-3">{renderAssistantText(c.answer)}</div>
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

            <form onSubmit={askQuestion} className="flex gap-2 border-t border-gray-100 pt-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about this book..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={asking}
              />
              <button
                disabled={asking || !question.trim()}
                aria-label="Ask question"
                className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700 disabled:opacity-40"
              >
                <ArrowUp size={17} />
              </button>
            </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}