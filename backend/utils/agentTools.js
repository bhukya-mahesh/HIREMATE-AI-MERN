import Application from "../models/Application.js";
import User from "../models/User.js";
import CompanyVisit from "../models/CompanyVisit.js";
import MockOA from "../models/MockOA.js";
import { askForJSON } from "./llm.js";

/* ------------------------------------------------------------------ */
/* Tool schemas advertised to Gemini                                   */
/* ------------------------------------------------------------------ */

export const toolDeclarations = [
  {
    name: "listApplications",
    description:
      "List the student's tracked company applications with status, deadline and whether a JD/resume analysis already exists. Use this first to find the application the student is asking about.",
    parameters: {
      type: "object",
      properties: {
        companyFilter: {
          type: "string",
          description: "Optional case-insensitive company name substring to narrow results."
        }
      }
    }
  },
  {
    name: "getApplicationDetail",
    description:
      "Get full detail for one application: JD skills, resume match score, missing skills, all dates.",
    parameters: {
      type: "object",
      properties: {
        applicationId: { type: "string", description: "The application's _id." }
      },
      required: ["applicationId"]
    }
  },
  {
    name: "getStudentProfile",
    description:
      "Get the student's profile: known skills, current skill gaps, existing roadmap and its progress, streak, and whether a resume is on file.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "analyzeResumeAgainstJD",
    description:
      "Score the student's stored resume against an application's JD. Requires the application to already have JD skills extracted. Returns matchScore, matchedSkills, missingSkills.",
    parameters: {
      type: "object",
      properties: {
        applicationId: { type: "string" }
      },
      required: ["applicationId"]
    }
  },
  {
    name: "generateRoadmap",
    description:
      "Generate a day-by-day preparation roadmap for an application's missing skills. Choose `days` based on how long until the deadline — do not always use 7.",
    parameters: {
      type: "object",
      properties: {
        applicationId: { type: "string" },
        days: { type: "number", description: "Number of days to spread the plan across (1-30)." }
      },
      required: ["applicationId", "days"]
    }
  },
  {
    name: "getCampusVisitHistory",
    description:
      "Look up historical campus-visit records for a company (past role, month visited, max selections, bond, package, eligibility). Useful context when prepping for a drive.",
    parameters: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company name to search for." }
      },
      required: ["company"]
    }
  },
  {
    name: "getRecentMockOAResults",
    description:
      "Get the student's most recent evaluated Mock OA attempts with scores and per-question feedback, to identify weak topics.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many recent attempts to return (default 3)." }
      }
    }
  }
];

/* ------------------------------------------------------------------ */
/* Executors — every one is scoped to the calling user                 */
/* ------------------------------------------------------------------ */

const listApplications = async (userId, { companyFilter }) => {
  const filter = { user: userId };
  if (companyFilter) filter.company = { $regex: companyFilter, $options: "i" };

  const apps = await Application.find(filter).sort({ deadline: 1 }).limit(25);
  return apps.map((a) => ({
    applicationId: a._id.toString(),
    company: a.company,
    role: a.role,
    status: a.status,
    deadline: a.deadline,
    daysUntilDeadline: a.deadline
      ? Math.ceil((new Date(a.deadline) - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
    hasJDAnalysis: !!a.jd?.requiredSkills?.length,
    hasResumeScore: a.resumeMatchScore != null
  }));
};

const getApplicationDetail = async (userId, { applicationId }) => {
  const app = await Application.findOne({ _id: applicationId, user: userId });
  if (!app) return { error: "Application not found." };
  return {
    applicationId: app._id.toString(),
    company: app.company,
    role: app.role,
    status: app.status,
    deadline: app.deadline,
    daysUntilDeadline: app.deadline
      ? Math.ceil((new Date(app.deadline) - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
    oaDate: app.oaDate,
    interviewDate: app.interviewDate,
    requiredSkills: app.jd?.requiredSkills || [],
    niceToHaveSkills: app.jd?.niceToHaveSkills || [],
    resumeMatchScore: app.resumeMatchScore,
    missingSkills: app.missingSkills || []
  };
};

const getStudentProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { error: "User not found." };
  const roadmap = user.skillProfile?.roadmap || [];
  return {
    name: user.name,
    branch: user.branch,
    semester: user.semester,
    knownSkills: user.skillProfile?.known || [],
    skillGaps: user.skillProfile?.gaps || [],
    hasResumeOnFile: !!user.resume?.path,
    roadmapTotalTasks: roadmap.length,
    roadmapCompletedTasks: roadmap.filter((t) => t.done).length,
    streak: user.streak || 0
  };
};

const analyzeResumeAgainstJD = async (userId, { applicationId }) => {
  const app = await Application.findOne({ _id: applicationId, user: userId });
  if (!app) return { error: "Application not found." };
  if (!app.jd?.requiredSkills?.length) {
    return {
      error:
        "This application has no JD analysis yet. The student must upload the JD on the application card first."
    };
  }

  const user = await User.findById(userId);
  const knownSkills = user?.skillProfile?.known || [];
  if (!knownSkills.length) {
    return {
      error:
        "No skills on file for this student. Ask them to add skills on their Profile page, or upload a resume."
    };
  }

  const result = await askForJSON(
    `You are an ATS resume screener. Compare a candidate's skills against a job's required skills.
Return ONLY JSON: {"matchScore": number 0-100, "matchedSkills": string[], "missingSkills": string[], "suggestion": string}`,
    `Required skills: ${app.jd.requiredSkills.join(", ")}
Nice to have: ${(app.jd.niceToHaveSkills || []).join(", ")}
Candidate skills: ${knownSkills.join(", ")}`
  );

  app.resumeMatchScore = result.matchScore ?? 0;
  app.missingSkills = result.missingSkills || [];
  await app.save();

  return {
    matchScore: app.resumeMatchScore,
    matchedSkills: result.matchedSkills || [],
    missingSkills: app.missingSkills,
    suggestion: result.suggestion || ""
  };
};

const generateRoadmap = async (userId, { applicationId, days }) => {
  const app = await Application.findOne({ _id: applicationId, user: userId });
  if (!app) return { error: "Application not found." };
  if (!app.missingSkills?.length) {
    return { error: "No missing skills recorded yet — run analyzeResumeAgainstJD first." };
  }

  const safeDays = Math.min(30, Math.max(1, Math.round(Number(days) || 7)));

  const result = await askForJSON(
    `You build focused interview-prep study plans.
Return ONLY JSON: {"roadmap": [{"day": number, "topic": string, "done": false}]}
Spread the topics across exactly the number of days given. Front-load the highest-impact skills.`,
    `Skills to cover: ${app.missingSkills.join(", ")}
Days available: ${safeDays}
Target role: ${app.role || "software role"} at ${app.company}`
  );

  const user = await User.findById(userId);
  if (!user.skillProfile) user.skillProfile = {};
  user.skillProfile.gaps = app.missingSkills;
  user.skillProfile.roadmap = result.roadmap || [];
  await user.save();

  return { days: safeDays, roadmap: user.skillProfile.roadmap };
};

const getCampusVisitHistory = async (userId, { company }) => {
  const visits = await CompanyVisit.find({
    user: userId,
    company: { $regex: company, $options: "i" }
  }).limit(5);

  if (!visits.length) {
    return { found: false, note: "No historical campus-visit record for this company." };
  }
  return {
    found: true,
    visits: visits.map((v) => ({
      company: v.company,
      role: v.role,
      whenVisited: v.rawDateText || `${v.visitMonth || "?"}/${v.visitYear || "?"}`,
      maxSelections: v.maxSelections,
      workLocation: v.workLocation,
      bond: v.bond,
      packageOffered: v.packageOffered,
      eligibility: v.eligibility
    }))
  };
};

const getRecentMockOAResults = async (userId, { limit }) => {
  const n = Math.min(5, Math.max(1, Math.round(Number(limit) || 3)));
  const attempts = await MockOA.find({ user: userId, status: "evaluated" })
    .sort({ createdAt: -1 })
    .limit(n);

  return attempts.map((a) => ({
    skills: a.skills,
    totalScore: a.totalScore,
    takenOn: a.createdAt,
    weakAreas: (a.evaluation || [])
      .filter((e) => {
        const q = a.questions[e.questionIndex];
        return q && e.marksAwarded < (q.maxMarks || 0) * 0.5;
      })
      .map((e) => ({
        question: a.questions[e.questionIndex]?.questionText?.slice(0, 120),
        marksAwarded: e.marksAwarded,
        feedback: e.feedback
      }))
  }));
};

const executors = {
  listApplications,
  getApplicationDetail,
  getStudentProfile,
  analyzeResumeAgainstJD,
  generateRoadmap,
  getCampusVisitHistory,
  getRecentMockOAResults
};

/**
 * Runs a tool by name. Never throws — errors are returned as data so the
 * agent can recover and explain itself instead of the whole request dying.
 */
export const executeTool = async (name, args, userId) => {
  const fn = executors[name];
  if (!fn) return { error: `Unknown tool: ${name}` };
  try {
    return await fn(userId, args || {});
  } catch (err) {
    console.error(`Tool ${name} failed:`, err);
    return { error: err.message };
  }
};