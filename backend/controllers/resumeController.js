const Resume = require("../models/Resume");
const path = require("path");
const fs = require("fs");
const mockAi = require("../utils/mockAi");
const { generateRagReply } = require("../utils/aiService");

// @desc    Upload resume and parse initial details
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a file" });
    }

    const absolutePath = path.resolve(req.file.path);

    let parseResult;
    try {
      parseResult = await mockAi.parse(absolutePath);
    } catch (apiError) {
      console.warn("Resume parsing fallback error:", apiError.message);
      parseResult = {
        text: `Parsed placeholder text for file: ${path.basename(absolutePath)}`,
        contact: { name: "Unknown Applicant", email: "", phone: "" },
        skills: [],
        structure: {
          education: "",
          experience: "",
          certifications: "",
          projects: "",
        },
      };
    }

    // Save to MongoDB
    const resume = await Resume.create({
      userId: req.user.id,
      filename: req.file.originalname,
      filepath: absolutePath,
      extractedText: parseResult.text,
      skills: parseResult.skills,
      parsedData: {
        // store an empty string when name isn't found so frontend shows 'N/A'
        name: parseResult.contact.name || "",
        email: parseResult.contact.email || "",
        phone: parseResult.contact.phone || "",
        education: parseResult.structure.education || "",
        experience: parseResult.structure.experience || "",
        certifications: parseResult.structure.certifications || "",
        projects: parseResult.structure.projects || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      resume,
    });
  } catch (error) {
    // Cleanup file in case of error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dev-only upload endpoint (no auth) - stores resume with a generated ObjectId user
const uploadResumeDev = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a file" });
    }

    const absolutePath = path.resolve(req.file.path);

    let parseResult;
    try {
      parseResult = await mockAi.parse(absolutePath);
    } catch (apiError) {
      console.warn("Resume parsing fallback error:", apiError.message);
      parseResult = {
        text: `Parsed placeholder text for file: ${path.basename(absolutePath)}`,
        contact: { name: "Unknown Applicant", email: "", phone: "" },
        skills: [],
        structure: {
          education: "",
          experience: "",
          certifications: "",
          projects: "",
        },
      };
    }

    // Save to MongoDB with a generated ObjectId (dev only)
    const { ObjectId } = require("mongodb");
    const resume = await Resume.create({
      userId: new ObjectId(),
      filename: req.file.originalname,
      filepath: absolutePath,
      extractedText: parseResult.text,
      skills: parseResult.skills,
      parsedData: {
        name: parseResult.contact.name || "",
        email: parseResult.contact.email || "",
        phone: parseResult.contact.phone || "",
        education: parseResult.structure.education || "",
        experience: parseResult.structure.experience || "",
        certifications: parseResult.structure.certifications || "",
        projects: parseResult.structure.projects || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "(DEV) Resume uploaded and parsed successfully",
      resume,
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Analyze resume against target job role
// @route   POST /api/resumes/analyze
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!resumeId || !targetRole) {
      return res.status(400).json({
        success: false,
        message: "Please provide resumeId and targetRole",
      });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    // Make sure user owns this resume
    if (resume.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to analyze this resume",
      });
    }

    // First, produce a deterministic analysis using local logic so scores and missing skills
    // are reliable even if external AI is slow or inconsistent.
    let analyzeResult;
    try {
      analyzeResult = await mockAi.analyze({
        text: resume.extractedText || "",
        skills: resume.skills || [],
        target_role: targetRole,
      });
    } catch (localErr) {
      console.warn("Local analysis failed:", localErr.message);
      analyzeResult = {
        score: {
          overall: 50,
          skillRelevance: 40,
          keywordDensity: 50,
          structureScore: 50,
          checks: [],
        },
        matchingSkills: (resume.skills || []).slice(0, 6),
        missingSkills: [],
        roadmap: [],
        recommendedProjects: [],
        recommendedCertifications: [],
        interviewPrep: {
          technical_questions: [],
          behavioral_guidance: "Use STAR method.",
          role_specific_focus: `Focus on ${targetRole} topics.`,
        },
      };
    }

    // Then, request a narrative/insight from the RAG model to provide human-friendly suggestions.
    try {
      const result = await generateRagReply({
        message: `Please provide a concise, actionable resume analysis for the role: ${targetRole}. Include top strengths, top 3 missing skills, and 3 quick improvement tips. Be concise.`,
        resumeText: resume.extractedText || "",
        skills: resume.skills || [],
        targetRole,
        missingSkills: analyzeResult.missingSkills || [],
        roadmap: analyzeResult.roadmap || [],
        recommendedProjects: analyzeResult.recommendedProjects || [],
        interviewPrep: analyzeResult.interviewPrep || {},
        name: resume.parsedData?.name || "Applicant",
        history: [],
      });
      // attach narrative to analyzeResult for frontend display
      analyzeResult.narrative = result.response;
    } catch (apiError) {
      console.warn(
        "Groq AI analysis error, using local narrative fallback:",
        apiError.message,
      );
      // If RAG fails, attempt to generate a short narrative from local analysis
      const bullets = [];
      bullets.push(`Overall ATS score: ${analyzeResult.score.overall}`);
      if (analyzeResult.matchingSkills && analyzeResult.matchingSkills.length)
        bullets.push(
          `Matching skills: ${analyzeResult.matchingSkills.join(", ")}`,
        );
      if (analyzeResult.missingSkills && analyzeResult.missingSkills.length)
        bullets.push(
          `Missing skills: ${analyzeResult.missingSkills.join(", ")}`,
        );
      bullets.push(
        "Top suggestions: focus on core missing skills, add measurable project outcomes, and tailor the summary to the role.",
      );
      analyzeResult.narrative = `(Fallback) ${bullets.join(" | ")}`;
    }

    // Update Resume document with score and recommendations
    resume.score = {
      overall: analyzeResult.score.overall,
      skillRelevance: analyzeResult.score.skillRelevance,
      keywordDensity: analyzeResult.score.keywordDensity,
      structureScore: analyzeResult.score.structureScore,
      checks: analyzeResult.score.checks || [],
    };

    resume.recommendations = {
      targetRole: targetRole,
      missingSkills: analyzeResult.missingSkills || [],
      roadmap: analyzeResult.roadmap || [],
      recommendedProjects: analyzeResult.recommendedProjects || [],
      recommendedCertifications: analyzeResult.recommendedCertifications || [],
      interviewPrep: analyzeResult.interviewPrep || {
        technical_questions: [],
        behavioral_guidance: "",
        role_specific_focus: "",
      },
    };

    await resume.save();

    res.json({
      success: true,
      message: "Resume analyzed successfully",
      resume,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get resume analysis by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume analysis not found" });
    }

    // Check ownership
    if (resume.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to view this analysis",
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all resume uploads for the current user
// @route   GET /api/resumes/history
// @access  Private
const getResumeHistory = async (req, res) => {
  try {
    const history = await Resume.find({ userId: req.user.id })
      .select("-extractedText") // exclude full text to reduce payload size
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a resume from history
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    // Check ownership
    if (resume.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this resume",
      });
    }

    // Delete local file if it exists
    if (resume.filepath && fs.existsSync(resume.filepath)) {
      try {
        fs.unlinkSync(resume.filepath);
      } catch (err) {
        console.error("Error deleting local file:", err.message);
      }
    }

    await resume.deleteOne();

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate career recommendations based on custom target role & skills selection
// @route   POST /api/resumes/career-recommendation
// @access  Private
const postCareerRecommendation = async (req, res) => {
  try {
    const { targetRole, skills } = req.body;

    if (!targetRole || !skills) {
      return res.status(400).json({
        success: false,
        message: "Please provide targetRole and skills",
      });
    }

    let analyzeResult;
    try {
      const result = await generateRagReply({
        message: `Recommend a career path for ${targetRole} using these skills: ${skills.join(", ")}`,
        resumeText: `Custom search with skills: ${skills.join(", ")}`,
        skills,
        targetRole,
        missingSkills: [],
        roadmap: [],
        recommendedProjects: [],
        interviewPrep: {},
        name: "Applicant",
        history: [],
      });
      analyzeResult = {
        matchingSkills: skills.slice(0, 6),
        missingSkills: [],
        roadmap: [],
        recommendedProjects: [],
        recommendedCertifications: [],
        interviewPrep: {
          technical_questions: [],
          behavioral_guidance: "Use STAR method.",
          role_specific_focus: `Focus on ${targetRole} topics.`,
        },
        response: result.response,
      };
    } catch (apiError) {
      console.warn(
        "Groq AI custom analysis error, using fallback:",
        apiError.message,
      );
      analyzeResult = await mockAi.analyze({
        text: `Custom search with skills: ${skills.join(", ")}`,
        skills,
        target_role: targetRole,
      });
    }

    res.json({
      success: true,
      recommendations: {
        targetRole,
        matchingSkills: analyzeResult.matchingSkills,
        missingSkills: analyzeResult.missingSkills,
        roadmap: analyzeResult.roadmap,
        recommendedProjects: analyzeResult.recommendedProjects,
        recommendedCertifications: analyzeResult.recommendedCertifications,
        interviewPrep: analyzeResult.interviewPrep,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResume,
  uploadResumeDev,
  analyzeResume,
  getResumeAnalysis,
  getResumeHistory,
  deleteResume,
  postCareerRecommendation,
};
