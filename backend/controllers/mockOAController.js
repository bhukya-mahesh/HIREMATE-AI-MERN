import MockOA from "../models/MockOA.js";
import { askForJSON } from "../utils/llm.js";

export const generateMockOA = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !skills.length) {
      return res.status(400).json({ error: 'skills array is required' });
    }

    const systemPrompt = `You are an exam setter for a campus placement mock online assessment.
Return ONLY valid JSON, no markdown, no preamble, in this exact shape:
{
  "questions": [
    {
      "questionText": "...",
      "type": "mcq | short | coding | scenario",
      "maxMarks": <number, total across all questions sums to 100>,
      "expectedAnswerLength": "short | medium | long"
    }
  ]
}`;

    const userPrompt = `Skills to test: ${skills.join(", ")}
Generate exactly this mix of questions, in this order:
- 4 to 5 MCQ questions (type: "mcq", expectedAnswerLength: "short") — include the options directly inside questionText, and keep each worth fewer marks than the descriptive/coding ones.
- 2 long descriptive questions (type: "short" or "scenario", expectedAnswerLength: "long") — conceptual or scenario-based, requiring a detailed written explanation.
- 2 coding questions (type: "coding", expectedAnswerLength: "long") — ask for approach/pseudocode/code, not code execution.

Vary difficulty across easy/medium/hard. Weight maxMarks so the total across all questions sums to exactly 100, with descriptive and coding questions worth noticeably more than MCQs.`;

    const parsed = await askForJSON(systemPrompt, userPrompt);

    const mockOA = await MockOA.create({
      user: req.user._id,
      skills,
      questions: parsed.questions,
      status: 'generated'
    });

    res.json({ mockOAId: mockOA._id, questions: mockOA.questions });
  } catch (err) {
    console.error('MockOA generate error:', err);
    res.status(500).json({ error: 'Failed to generate mock OA' });
  }
};

export const submitMockOA = async (req, res) => {
  try {
    const { answers } = req.body;
    const mockOA = await MockOA.findOne({ _id: req.params.id, user: req.user._id });
    if (!mockOA) return res.status(404).json({ error: 'Mock OA not found' });

    mockOA.answers = answers;
    mockOA.status = 'submitted';

    const qaPairs = mockOA.questions.map((q, i) => ({
      questionIndex: i,
      questionText: q.questionText,
      maxMarks: q.maxMarks,
      answerText: answers.find(a => a.questionIndex === i)?.answerText || ''
    }));

    const systemPrompt = `You are grading a mock online assessment. For each question, evaluate the candidate's answer
against the question and award marks out of the maxMarks given. Be strict but fair —
partial credit for partially correct answers, 0 for blank/irrelevant answers.
Return ONLY valid JSON in this exact shape:
{
  "evaluations": [
    { "questionIndex": 0, "marksAwarded": <number>, "feedback": "1-2 line feedback" }
  ],
  "totalScore": <sum, out of 100>,
  "overallFeedback": "3-4 line summary of strengths and gaps"
}`;

    const userPrompt = `Questions and answers:\n${JSON.stringify(qaPairs)}`;

    const result = await askForJSON(systemPrompt, userPrompt);

    mockOA.evaluation = result.evaluations;
    mockOA.totalScore = result.totalScore;
    mockOA.overallFeedback = result.overallFeedback;
    mockOA.status = 'evaluated';
    await mockOA.save();

    res.json({
      totalScore: mockOA.totalScore,
      evaluation: mockOA.evaluation,
      overallFeedback: mockOA.overallFeedback
    });
  } catch (err) {
    console.error('MockOA submit error:', err);
    res.status(500).json({ error: 'Failed to submit/evaluate mock OA' });
  }
};

export const getMockOA = async (req, res) => {
  try {
    const mockOA = await MockOA.findOne({ _id: req.params.id, user: req.user._id });
    if (!mockOA) return res.status(404).json({ error: 'Not found' });
    res.json(mockOA);
  } catch (err) {
    console.error('MockOA fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch mock OA' });
  }
};