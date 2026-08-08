import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    semester: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const payload = {
        ...form,
        semester: form.semester ? Number(form.semester) : undefined,
      };

      const { data } = await api.post("/auth/signup", payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);

      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">

        <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-12 flex-col justify-center rounded-l-2xl">

  <h1 className="text-4xl font-bold">
    HireMate AI
  </h1>

  <p className="mt-5 text-blue-100 leading-7 text-lg">
    Your AI-powered placement companion that helps you prepare,
    learn, and land your dream job with confidence.
  </p>

  <div className="mt-10 space-y-5">

    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
        ✓
      </div>
      <span className="text-base">
        AI Resume & JD Analysis
      </span>
    </div>

    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
        ✓
      </div>
      <span className="text-base">
        Personalized Preparation Roadmaps
      </span>
    </div>

    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
        ✓
      </div>
      <span className="text-base">
        AI Study Tutor with RAG
      </span>
    </div>

    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
        ✓
      </div>
      <span className="text-base">
        Daily Tests & Progress Tracking
      </span>
    </div>

    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
        ✓
      </div>
      <span className="text-base">
        Job Application & Interview Tracker
      </span>
    </div>

  </div>

        </div>

        <div className="p-6">

          <h2 className="text-2xl font-semibold text-gray-800">
            Create account
          </h2>

          <p className="text-gray-500 mt-1 text-sm">
            Manage your placement journey.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>

              <input
                type="text"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="ECE"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Semester
              </label>

              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create account
            </button>

          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}