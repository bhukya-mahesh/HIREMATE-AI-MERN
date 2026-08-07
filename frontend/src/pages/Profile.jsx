import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const loadProfile = () => {
    api.get("/auth/profile").then(({ data }) => setProfile(data));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const addSkill = async () => {
    const skill = skillInput.trim();
    if (!skill) return;
    const updated = [...(profile.skillProfile?.known || []), skill];
    setSkillInput("");
    setBusy(true);
    try {
      await api.patch("/auth/skills", { skills: updated });
      loadProfile();
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to update skills");
    }
    setBusy(false);
  };

  const removeSkill = async (skill) => {
    const updated = (profile.skillProfile?.known || []).filter((s) => s !== skill);
    setBusy(true);
    try {
      await api.patch("/auth/skills", { skills: updated });
      loadProfile();
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to update skills");
    }
    setBusy(false);
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    setBusy(true);
    setStatus("Uploading resume...");
    try {
      const form = new FormData();
      form.append("resume", resumeFile);
      await api.post("/auth/resume", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setStatus("Resume updated.");
      setResumeFile(null);
      loadProfile();
    } catch (err) {
      setStatus(err.response?.data?.message || "Resume upload failed");
    }
    setBusy(false);
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="text-gray-500">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-semibold text-blue-600">
                {profile.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                {(profile.branch || profile.semester) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.branch} {profile.branch && profile.semester ? "•" : ""} {profile.semester ? `Semester ${profile.semester}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Keep your profile sharp and your applications moving.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Applied" value={profile.stats?.applied || 0} color="text-blue-600" />
          <StatCard title="Not Applied" value={profile.stats?.notApplied || 0} color="text-red-500" />
          <StatCard title="Selected" value={profile.stats?.selected || 0} color="text-green-600" />
          <StatCard title="Rejected" value={profile.stats?.rejected || 0} color="text-gray-700" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Resume</h2>
              <p className="text-sm text-gray-500">Latest upload</p>
            </div>

            {profile.resume?.filename ? (
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">File name</p>
                  <p className="text-base font-medium text-gray-800">{profile.resume.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="text-base text-gray-700">{new Date(profile.resume.uploadedAt).toLocaleDateString()}</p>
                </div>
                <a
                  href={profile.resume.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  View resume
                </a>
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No resume uploaded yet.</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="flex-1 text-sm text-gray-700"
                />
                <button
                  disabled={busy || !resumeFile}
                  onClick={uploadResume}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40"
                >
                  {profile.resume?.filename ? "Update resume" : "Upload resume"}
                </button>
              </div>
              {status && <p className="text-sm text-gray-500">{status}</p>}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
              <p className="text-sm text-gray-500">Manage your profile</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skillProfile?.known?.length ? (
                profile.skillProfile.known.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-gray-500 hover:text-gray-900"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills added yet.</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add new skill"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
              />
              <button
                disabled={busy || !skillInput.trim()}
                onClick={addSkill}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mt-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skill gaps</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skillProfile?.gaps?.length ? (
                profile.skillProfile.gaps.map((skill) => (
                  <span key={skill} className="rounded-full bg-red-100 px-3 py-2 text-sm text-red-700">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skill gaps identified yet.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Insights</h2>
            <dl className="grid gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <dt className="text-sm text-gray-500">Resume match score</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-800">{profile.resumeMatchScore || 0}%</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <dt className="text-sm text-gray-500">Current placement streak</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-800">{profile.streak || 0} days</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm text-gray-500">
              Keep your resume and skills updated to improve your placement readiness. Use the profile insights to track progress and close gaps faster.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-4xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}