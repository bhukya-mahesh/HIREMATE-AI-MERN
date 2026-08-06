const statusColors = {
  not_applied: "bg-red-100 text-red-700",
  applied: "bg-blue-100 text-blue-700",
  oa: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  result_awaited: "bg-slate-100 text-slate-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-gray-200 text-gray-700",
  missed: "bg-gray-200 text-gray-500",
};

const getDaysLeft = (deadline) => {
  if (!deadline) return null;

  const today = new Date();
  const endDate = new Date(deadline);

  return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
};

export default function ApplicationCard({
  app,
  onMarkApplied,
  onDelete,
  onAnalyze,
}) {
  const daysLeft = getDaysLeft(app.deadline);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {app.company}
          </h2>

          {app.role && (
            <p className="text-sm text-gray-500 mt-1">
              {app.role}
            </p>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[app.status]}`}
        >
          {app.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        {app.deadline && app.status === "not_applied" && (
          <p>
            <span className="font-medium">Deadline:</span>{" "}
            {daysLeft >= 0 ? (
              <span
                className={
                  daysLeft <= 1
                    ? "text-red-600 font-semibold"
                    : "text-gray-700"
                }
              >
                {daysLeft} day(s) left
              </span>
            ) : (
              <span className="text-red-600">Deadline Passed</span>
            )}
          </p>
        )}

        {app.status === "applied" && app.oaDate && (
          <p>
            <span className="font-medium">OA Date:</span>{" "}
            {new Date(app.oaDate).toLocaleDateString()}
          </p>
        )}

        {app.resumeMatchScore !== null &&
          app.resumeMatchScore !== undefined && (
            <p>
              <span className="font-medium">Resume Match:</span>{" "}
              {app.resumeMatchScore}%
            </p>
          )}
      </div>

      <div className="flex gap-3 mt-5">
        {app.status === "not_applied" && (
          <button
            onClick={() => onMarkApplied(app._id)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Mark Applied
          </button>
        )}

        <button
          onClick={() => onAnalyze(app)}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          JD Analyser
        </button>

        <button
          onClick={() => onDelete(app._id)}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}