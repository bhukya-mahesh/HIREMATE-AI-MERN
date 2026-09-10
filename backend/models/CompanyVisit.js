import mongoose from "mongoose";

const companyVisitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    company: { type: String, required: true },
    role: { type: String, default: "" },

    // Month/year are nullable because source PDFs don't always give an exact date —
    // rawDateText preserves whatever the document actually said, for display.
    visitMonth: { type: Number, min: 1, max: 12, default: null },
    visitYear: { type: Number, default: null },
    rawDateText: { type: String, default: "" },

    maxSelections: { type: Number, default: null },
    workLocation: { type: String, default: "" },
    bond: { type: String, default: "" },
    packageOffered: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    otherDetails: { type: String, default: "" },

    sourceBatch: { type: String, default: "" }, // groups records from the same upload
  },
  { timestamps: true }
);

companyVisitSchema.index({ user: 1, visitYear: 1, visitMonth: 1 });

export default mongoose.model("CompanyVisit", companyVisitSchema);