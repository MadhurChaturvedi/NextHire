const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

const buildContextPayload = ({
  message,
  resumeText = "",
  skills = [],
  targetRole = "Software Engineer",
  missingSkills = [],
  roadmap = [],
  recommendedProjects = [],
  interviewPrep = {},
  name = "Applicant",
  history = [],
}) => {
  const contextSections = [
    `Applicant name: ${name}`,
    `Target role: ${targetRole}`,
    resumeText
      ? `Resume content: ${resumeText}`
      : "Resume content: No resume uploaded yet.",
    skills.length
      ? `Detected skills: ${skills.join(", ")}`
      : "Detected skills: none",
    missingSkills.length
      ? `Missing skills: ${missingSkills.join(", ")}`
      : "Missing skills: none",
    roadmap.length
      ? `Roadmap: ${roadmap
          .slice(0, 4)
          .map((step) => step.title || step.step || step)
          .join(" | ")}`
      : "Roadmap: none",
    recommendedProjects.length
      ? `Recommended projects: ${recommendedProjects
          .slice(0, 4)
          .map((project) => project.title || project.name || project)
          .join(" | ")}`
      : "Recommended projects: none",
  ];

  const formattedHistory = history
    .slice(-8)
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n");

  return {
    systemPrompt: `You are NextHire, a concise career coach and interview mentor. When asked to analyze a resume, produce a short, actionable summary listing top strengths, top 3 missing skills, and 3 quick improvement tips. Be practical and personalize responses using the context below. Applicant name: ${name}.`,
    input: {
      message,
      resumeContext: contextSections.join("\n"),
      history: history.slice(-8),
      formattedHistory,
    },
  };
};

const generateRagReply = async ({
  message,
  resumeText = "",
  skills = [],
  targetRole = "Software Engineer",
  missingSkills = [],
  roadmap = [],
  recommendedProjects = [],
  interviewPrep = {},
  name = "Applicant",
  history = [],
}) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const payload = buildContextPayload({
    message,
    resumeText,
    skills,
    targetRole,
    missingSkills,
    roadmap,
    recommendedProjects,
    interviewPrep,
    name,
    history,
  });

  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "groq-1",
    temperature: 0.7,
    maxTokens: 700,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "{systemPrompt}"],
    [
      "human",
      "Resume context:\n{resumeContext}\n\nConversation history:\n{formattedHistory}\n\nCurrent message:\n{message}",
    ],
  ]);

  const chain = prompt.pipe(llm);
  const result = await chain.invoke({
    systemPrompt: payload.systemPrompt,
    resumeContext: payload.input.resumeContext,
    formattedHistory: payload.input.formattedHistory,
    message: payload.input.message,
  });

  const content =
    typeof result?.content === "string"
      ? result.content.trim()
      : (result?.content?.[0]?.text || "").trim();

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return {
    response: content,
    is_fallback: false,
    retrieved_chunks: [],
  };
};

module.exports = {
  buildContextPayload,
  generateRagReply,
};
