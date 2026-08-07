const statusColors = {
  not_applied: "bg-red-100 text-red-600",
  applied: "bg-blue-100 text-blue-600",
  oa: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  result_awaited: "bg-slate-100 text-slate-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-gray-200 text-gray-600",
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {app.company}
          </h3>

          {app.role && (
            <p className="text-sm text-gray-500 mt-1">
              {app.role}
            </p>
          )}
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[app.status]}`}
        >
          {app.status.replace("_", " ")}
        </span>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-2 text-sm text-gray-600">

        {app.deadline && app.status === "not_applied" && (
          <div className="flex justify-between">
            <span>Deadline</span>

            {daysLeft >= 0 ? (
              <span
                className={
                  daysLeft <= 1
                    ? "text-red-600 font-semibold"
                    : "font-medium text-gray-800"
                }
              >
                {daysLeft} day{daysLeft !== 1 && "s"} left
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                Passed
              </span>
            )}
          </div>
        )}

        {app.status === "applied" && app.oaDate && (
          <div className="flex justify-between">
            <span>OA Date</span>
            <span className="font-medium text-gray-800">
              {new Date(app.oaDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {app.resumeMatchScore != null && (
          <div className="flex justify-between">
            <span>Resume Match</span>
            <span
              className={`font-semibold ${
                app.resumeMatchScore >= 80
                  ? "text-green-600"
                  : app.resumeMatchScore >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {app.resumeMatchScore}%
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-2">

        {app.status === "not_applied" && (
          <button
            onClick={() => onMarkApplied(app._id)}
            className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Apply
          </button>
        )}

        <button
          onClick={() => onAnalyze(app)}
          className="flex-1 rounded-lg border border-indigo-200 text-indigo-600 py-2 text-sm font-medium hover:bg-indigo-50 transition"
        >
          Analyze
        </button>

        <button
          onClick={() => onDelete(app._id)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          Delete
        </button>

      </div>
    </div>
  );
}