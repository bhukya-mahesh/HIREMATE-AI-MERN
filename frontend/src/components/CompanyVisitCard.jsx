const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CompanyVisitCard({ visit, onOpen }) {
  const dateLabel =
    visit.rawDateText ||
    [visit.visitMonth ? MONTH_NAMES[visit.visitMonth] : null, visit.visitYear]
      .filter(Boolean)
      .join(" ") ||
    "Date not specified";

  return (
    <div
      onClick={() => onOpen(visit)}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-gray-800">{visit.company}</h3>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {dateLabel}
        </span>
      </div>

      {visit.role && <p className="text-sm text-gray-500 mt-1">{visit.role}</p>}

      <div className="mt-4 space-y-1 text-xs text-gray-500">
        {visit.workLocation && <p>📍 {visit.workLocation}</p>}
        {visit.maxSelections != null && <p>👥 Up to {visit.maxSelections} selections</p>}
      </div>
    </div>
  );
}