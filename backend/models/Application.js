import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    company: { type: String, required: true },
    role: { type: String },

    status: {
      type: String,
      enum: ["not_applied", "applied", "oa", "interview", "result_awaited", "selected", "rejected", "missed"],
      default: "not_applied"
    },

    // Dates that drive the reminder engine
    deadline: { type: Date },
    oaDate: { type: Date },
    interviewDate: { type: Date },

    priority: { type: Number, min: 1, max: 5, default: 3 },

    // Filled in by the LLM JD-analysis step 
    jd: {
      rawText: String,
      requiredSkills: [String],
      niceToHaveSkills: [String],
      keywords: [String]
    },

    resumeMatchScore: { type: Number, default: null },
    missingSkills: [String],
    resumeVersionUsed: { type: String }, // e.g. "amazon_resume_v2"

    reminderLog: [
      {
        sentAt: { type: Date, default: Date.now },
        message: String,
        stage: String // e.g. "24h_before_deadline", "2h_before_deadline"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
