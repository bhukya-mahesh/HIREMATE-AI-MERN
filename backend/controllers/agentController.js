import { askWithTools } from "../utils/llm.js";
import { toolDeclarations, executeTool } from "../utils/agentTools.js";

const MAX_STEPS = 8; // hard cap so a confused agent can't loop forever / burn quota

const SYSTEM_PROMPT = `You are HireMate's Placement Prep Agent, helping a student at NIT Silchar prepare for campus placements.

You have tools to read the student's applications, profile, mock-test history and campus-visit records, and to run resume analysis and build study roadmaps.

How to work:
- Start by finding the relevant application (listApplications) before assuming anything.
- Check what already exists before redoing work — if a resume score is already recorded, you don't need to recompute it unless the student asks.
- Choose roadmap length from the ACTUAL days until the deadline. A drive in 3 days gets a 3-day plan, not a 7-day plan. If the deadline is far away or missing, 7 days is a reasonable default.
- If the match score is already strong (85+), say so and suggest targeted mock practice rather than generating a full roadmap.
- If a tool returns an error (no JD uploaded, no skills on file), explain plainly what the student needs to do. Never invent data to work around a missing input.
- Use getCampusVisitHistory to add useful context (bond, typical intake, past role) when prepping for a specific company.

When you are done, write a short, direct summary for the student: what you found, what you did, and what they should do next. Use plain prose, no headings. Do not describe your tool calls mechanically — describe the outcome.`;

export const runPrepAgent = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "A message is required" });
    }

    // Rebuild the running conversation, then append this turn.
    const contents = [
      ...history
        .filter((h) => h.role === "user" || h.role === "model")
        .map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user", parts: [{ text: message }] }
    ];

    const steps = [];

    for (let i = 0; i < MAX_STEPS; i++) {
      const response = await askWithTools(SYSTEM_PROMPT, contents, toolDeclarations);

      const parts = response.candidates?.[0]?.content?.parts || [];
      const calls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);

      // No tool calls left → the agent is answering.
      if (!calls.length) {
        const answer = parts
          .filter((p) => p.text)
          .map((p) => p.text)
          .join("\n")
          .trim();

        return res.json({
          answer: answer || "I wasn't able to produce a response for that.",
          steps,
          history: [
            ...history,
            { role: "user", text: message },
            { role: "model", text: answer }
          ]
        });
      }

      // Record the model turn verbatim so the next call has full context.
      contents.push({ role: "model", parts });

      const responseParts = [];
      for (const call of calls) {
        const result = await executeTool(call.name, call.args, req.user._id);
        steps.push({ tool: call.name, args: call.args, ok: !result?.error });
        responseParts.push({
          functionResponse: { name: call.name, response: { result } }
        });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    res.json({
      answer:
        "I ran out of steps while working on that. Try narrowing the request to one company or one task.",
      steps,
      history
    });
  } catch (err) {
    console.error("runPrepAgent error:", err);
    res.status(500).json({ message: err.message });
  }
};