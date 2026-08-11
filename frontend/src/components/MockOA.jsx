import { useState } from 'react';
import api from '../api/axios';

const ROWS_MAP = { short: 3, medium: 6, long: 14 };

export default function MockOA() {
  const [skillsInput, setSkillsInput] = useState('');
  const [mockOAId, setMockOAId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTest = async () => {
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!skills.length) {
      setError('Enter at least one skill.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/mockoa/generate', { skills });
      setMockOAId(data.mockOAId);
      setQuestions(data.questions);
      setAnswers({});
      setResult(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate test. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    setLoading(true);
    setError('');
    try {
      const answerArray = questions.map((_, i) => ({
        questionIndex: i,
        answerText: answers[i] || ''
      }));
      const { data } = await api.post(`/mockoa/${mockOAId}/submit`, { answers: answerArray });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit test. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setSkillsInput('');
    setMockOAId(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setError('');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mock OA</h1>
          <p className="text-gray-500 mt-1">
            Enter the skills you've learned. HireMate AI generates a test, gives you space to answer, and scores it out of 100.
          </p>
        </div>
        {(questions.length > 0 || result) && (
          <button
            onClick={resetAll}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            + New Test
          </button>
        )}
      </div>

      {/* Results view */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Score: {result.totalScore} / 100</h2>
          <p className="text-gray-500 mb-6">{result.overallFeedback}</p>
          {questions.map((q, i) => {
            const ev = result.evaluation.find(e => e.questionIndex === i);
            return (
              <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3">
                <p className="font-medium text-gray-900">{i + 1}. {q.questionText}</p>
                <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                  Your answer: {answers[i] || '(blank)'}
                </p>
                <p className="text-sm mt-2 text-gray-700">
                  <span className="font-semibold">{ev?.marksAwarded}/{q.maxMarks}</span>
                  {' — '}{ev?.feedback}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Test-taking view */}
      {!result && questions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {questions.map((q, i) => (
            <div key={i} className="mb-5">
              <label className="block font-medium text-gray-900 mb-1">
                {i + 1}. {q.questionText}{' '}
                <span className="text-xs text-gray-400">({q.maxMarks} marks)</span>
              </label>
              <textarea
                rows={ROWS_MAP[q.expectedAnswerLength] || 5}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={answers[i] || ''}
                onChange={e => setAnswers({ ...answers, [i]: e.target.value })}
                placeholder="Type your answer here..."
              />
            </div>
          ))}
          <button
            onClick={submitTest}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Evaluating...' : 'Submit Test'}
          </button>
        </div>
      )}

      {/* Start screen */}
      {!result && questions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <label className="block font-medium text-gray-900 mb-2">Skills to test</label>
          <input
            type="text"
            placeholder="e.g. DSA, SQL, React"
            value={skillsInput}
            onChange={e => setSkillsInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generateTest}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Test'}
          </button>
        </div>
      )}
    </div>
  );
}