import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";
import UploadBookModal from "../components/UploadBookModal.jsx";
import BookCard from "../components/BookCard.jsx";
import BookDetailModal from "../components/BookDetailModal.jsx";

export default function StudyModule() {
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [openBookId, setOpenBookId] = useState(null);
  const [openBook, setOpenBook] = useState(null);

  const loadBooks = async () => {
    const { data } = await api.get("/study/books");
    setBooks(data);
    setLoadingBooks(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleUploaded = () => {
    setShowUpload(false);
    loadBooks();
  };

  const openCard = async (book) => {
    setOpenBookId(book._id);
    const { data } = await api.get(`/study/books/${book._id}`);
    setOpenBook(data);
  };

  const refreshOpenBook = async () => {
    if (!openBookId) return;
    const { data } = await api.get(`/study/books/${openBookId}`);
    setOpenBook(data);
    loadBooks();
  };

  const deleteBook = async (id) => {
    await api.delete(`/study/books/${id}`);
    loadBooks();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Study Module</h1>
            <p className="text-gray-500 mt-1">
              Upload a book. HireMate AI indexes it and teaches you section by section — ask it
              anything and it answers grounded in the book's own content.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition mt-4 md:mt-0"
          >
            + Upload Book
          </button>
        </div>

        {loadingBooks ? (
          <p className="text-gray-500">Loading...</p>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
            No books yet. Upload one to generate your first AI study syllabus.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {books.map((book) => (
              <BookCard key={book._id} book={book} onOpen={openCard} onDelete={deleteBook} />
            ))}
          </div>
        )}

        {showUpload && (
          <UploadBookModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
        )}

        {openBook && (
          <BookDetailModal
            book={openBook}
            onClose={() => {
              setOpenBook(null);
              setOpenBookId(null);
            }}
            onUpdated={refreshOpenBook}
          />
        )}
      </main>
    </div>
  );
}