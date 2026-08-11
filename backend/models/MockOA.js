import mongoose from "mongoose";

const mockOASchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [String],
  questions: [{
    questionText: String,
    type: { type: String, enum: ['mcq', 'short', 'coding', 'scenario'] },
    maxMarks: Number,
    expectedAnswerLength: { type: String, enum: ['short', 'medium', 'long'] }
  }],
  answers: [{
    questionIndex: Number,
    answerText: String
  }],
  evaluation: [{
    questionIndex: Number,
    marksAwarded: Number,
    feedback: String
  }],
  totalScore: Number,
  overallFeedback: String,
  status: { type: String, enum: ['generated', 'in_progress', 'submitted', 'evaluated'], default: 'generated' }
}, { timestamps: true });

export default mongoose.model('MockOA', mockOASchema);