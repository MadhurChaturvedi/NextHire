const test = require("node:test");
const assert = require("node:assert/strict");
const { buildContextPayload } = require("../utils/aiService");

test("buildContextPayload includes resume context and history", () => {
  const payload = buildContextPayload({
    message: "Help me prepare for the interview",
    resumeText: "Built React and Node applications for SaaS products.",
    skills: ["react", "node.js"],
    targetRole: "Full Stack Engineer",
    missingSkills: ["typescript"],
    roadmap: [{ title: "Learn TypeScript" }],
    recommendedProjects: [{ title: "Open source dashboard" }],
    interviewPrep: {
      technical_questions: ["Explain your React state strategy"],
    },
    name: "Alicia",
    history: [{ role: "user", content: "Hello" }],
  });

  assert.equal(payload.input.message, "Help me prepare for the interview");
  assert.match(payload.input.resumeContext, /React/);
  assert.match(payload.input.resumeContext, /Full Stack Engineer/);
  assert.match(payload.input.resumeContext, /typescript/i);
  assert.match(payload.systemPrompt, /Alicia/);
  assert.equal(payload.input.history.length, 1);
});
