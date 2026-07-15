const Resume = require("../models/Resume");
const mockAi = require("../utils/mockAi");
const { generateRagReply } = require("../utils/aiService");

// @desc    Chat with AI Assistant (RAG) using a selected resume
// @route   POST /api/chat
// @access  Private
const handleChat = async (req, res) => {
  try {
    const { message, resumeId, history } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a message" });
    }

    let payload = {
      message,
      history: history || [],
    };

    // If a resume ID is provided, retrieve its text and analytics details to feed the RAG context
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res
          .status(404)
          .json({ success: false, message: "Resume not found" });
      }

      // Check ownership
      if (resume.userId.toString() !== req.user.id.toString()) {
        return res.status(401).json({
          success: false,
          message: "Not authorized to access this resume",
        });
      }

      payload.resume_text = resume.extractedText || "";
      payload.skills = resume.skills || [];
      payload.target_role =
        resume.recommendations?.targetRole || "Software Engineer";
      payload.missing_skills = resume.recommendations?.missingSkills || [];
      payload.roadmap = resume.recommendations?.roadmap || [];
      payload.recommendedProjects =
        resume.recommendations?.recommendedProjects || [];
      payload.interview_prep = resume.recommendations?.interviewPrep || {};
      payload.name = resume.parsedData?.name || req.user.name || "Applicant";
    } else {
      // Default empty values for general chat when no resume is uploaded yet
      payload.target_role = "Software Engineer";
      payload.name = req.user.name || "Applicant";
    }

    try {
      const response = await generateRagReply({
        message: payload.message,
        resumeText: payload.resume_text || "",
        skills: payload.skills || [],
        targetRole: payload.target_role || "Software Engineer",
        missingSkills: payload.missing_skills || [],
        roadmap: payload.roadmap || [],
        recommendedProjects: payload.recommendedProjects || [],
        interviewPrep: payload.interview_prep || {},
        name: payload.name || "Applicant",
        history: payload.history || [],
      });
      return res.json({
        success: true,
        response: response.response,
        is_fallback: response.is_fallback,
        retrieved_chunks: response.retrieved_chunks,
      });
    } catch (apiError) {
      console.error("Groq AI chat error:", apiError.message);
      try {
        // Use local mock AI analyzer to provide a useful fallback response
        const analysis = await mockAi.analyze({
          text: payload.resume_text || "",
          skills: payload.skills || [],
          target_role: payload.target_role || "",
        });

        const respTextParts = [];
        respTextParts.push(
          "(Fallback) Could not reach external AI service; returning local analysis.",
        );
        respTextParts.push(`Overall ATS score: ${analysis.score.overall}`);
        if (analysis.matchingSkills && analysis.matchingSkills.length) {
          respTextParts.push(
            `Matching skills: ${analysis.matchingSkills.join(", ")}`,
          );
        }
        if (analysis.missingSkills && analysis.missingSkills.length) {
          respTextParts.push(
            `Missing skills: ${analysis.missingSkills.join(", ")}`,
          );
        }
        if (analysis.roadmap && analysis.roadmap.length) {
          respTextParts.push(
            "Top roadmap steps: " +
              analysis.roadmap
                .slice(0, 3)
                .map((r) => r.title || r.step)
                .join(" | "),
          );
        }

        return res.json({
          success: true,
          response: respTextParts.join("\n"),
          is_fallback: true,
          retrieved_chunks: [],
        });
      } catch (fallbackErr) {
        console.error("Local mock AI fallback error:", fallbackErr.message);
        return res.status(500).json({
          success: false,
          message: "Failed to connect to AI Service and local fallback failed.",
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleChat,
};
