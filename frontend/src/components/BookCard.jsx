export default function BookCard({ book, onOpen, onDelete }) {
  const total = book.modules?.length || 0;
  const done = book.modules?.filter((m) => m.done).length || 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={() => onOpen(book)}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition cursor-pointer"
    >
      <h3 className="font-semibold text-gray-800 truncate">{book.title}</h3>
      <p className="text-xs text-gray-400 mt-1">{total} module{total !== 1 ? "s" : ""}</p>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Studied</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(book._id);
        }}
        className="mt-4 text-xs text-red-500 border border-red-200 px-3 py-1 rounded-lg"
      >
        Delete
      </button>
    </div>
  );
}