import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    modules: [
      {
        title: String,
        summary: String,
        sourceExcerpt: String,
        embedding: [Number],
        explanation: { type: String, default: null },
        done: { type: Boolean, default: false }
      }
    ],
    chatHistory: [
      {
        question: String,
        answer: String,
        sourceModuleIndexes: [Number],
        askedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

bookSchema.virtual("progressPercent").get(function () {
  if (!this.modules.length) return 0;
  const done = this.modules.filter((m) => m.done).length;
  return Math.round((done / this.modules.length) * 100);
});

bookSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Book", bookSchema);