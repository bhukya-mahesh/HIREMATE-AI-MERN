import Application from "../models/Application.js";
import User from "../models/User.js";

import { extractPdfText } from "../utils/pdfExtractor.js";
import { askForJSON, askForText } from "../utils/llm.js";

/* ------------------------- JD Analysis ------------------------- */

export const analyzeJD = async (req, res) => {
  try {
    const app = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!app)
      return res.status(404).json({
        message: "Application not found",
      });

    if (!req.file)
      return res.status(400).json({
        message: "JD PDF is required",
      });

    const jdText = await extractPdfText(req.file.buffer);

    const result = await askForJSON(
      `You are an expert recruiter.
Return ONLY JSON:

{
 "requiredSkills":[],
 "niceToHaveSkills":[],
 "keywords":[]
}`,
      jdText.slice(0, 6000)
    );

    app.jd = {
      rawText: jdText.slice(0, 4000),
      requiredSkills: result.requiredSkills || [],
      niceToHaveSkills: result.niceToHaveSkills || [],
      keywords: result.keywords || [],
    };

    await app.save();

    res.json({
      message: "JD analyzed successfully",
      jd: app.jd,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ---------------------- Resume Analysis ---------------------- */

export const analyzeResume = async (req, res) => {
  try {
    const app = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!app)
      return res.status(404).json({
        message: "Application not found",
      });

    if (!req.file)
      return res.status(400).json({
        message: "Resume PDF required",
      });

    if (!app.jd?.requiredSkills?.length)
      return res.status(400).json({
        message: "Analyze JD first",
      });

    const resumeText = await extractPdfText(
      req.file.buffer
    );

    const result = await askForJSON(
      `You are an ATS expert.

Return ONLY JSON

{
 "matchScore":0,
 "missingSkills":[],
 "matchedSkills":[],
 "suggestion":""
}`,
      `
Required Skills

${app.jd.requiredSkills.join(",")}

Resume

${resumeText.slice(0, 6000)}
`
    );

    app.resumeMatchScore =
      result.matchScore ?? 0;

    app.missingSkills =
      result.missingSkills || [];

    await app.save();

    res.json({
      message: "Resume analyzed",
      ...result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ---------------------- Roadmap ---------------------- */

export const generateRoadmap = async (
  req,
  res
) => {
  try {
    const app = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!app)
      return res.status(404).json({
        message: "Application not found",
      });

    if (!app.missingSkills.length)
      return res.status(400).json({
        message:
          "Run Resume Analysis first",
      });

    const { days = 7 } = req.body;

    const result = await askForJSON(
      `Create a study roadmap.

Return ONLY JSON

{
 "roadmap":[]
}`,
      `
Missing Skills

${app.missingSkills.join(",")}

Days

${days}
`
    );

    const user =
      await User.findById(req.user._id);

    if (!user.skillProfile)
      user.skillProfile = {};

    user.skillProfile.gaps =
      app.missingSkills;

    user.skillProfile.roadmap =
      result.roadmap || [];

    await user.save();

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

/* ---------------------- Mentor ---------------------- */

export const getMentorMessage =
  async (req, res) => {
    try {
      const apps =
        await Application.find({
          user: req.user._id,
        });

      const user =
        await User.findById(req.user._id);

      const roadmap =
        user?.skillProfile?.roadmap || [];

      const snapshot = {
        totalApplications: apps.length,

        notAppliedCount: apps.filter(
          (a) =>
            a.status === "not_applied"
        ).length,

        missedCount: apps.filter(
          (a) => a.status === "missed"
        ).length,

        roadmapProgress: `${roadmap.filter(
          (r) => r.done
        ).length}/${roadmap.length}`,

        streak: user?.streak || 0,
      };

      const message =
        await askForText(
          `You are HireMate AI.

Generate a strict but motivating mentor message in under 4 sentences.`,
          JSON.stringify(snapshot)
        );

      res.json({
        message,
        snapshot,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: err.message,
      });
    }
  };