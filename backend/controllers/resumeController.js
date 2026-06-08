const Resume = require("../models/Resume");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";
const mockAi = require("../utils/mockAi");

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

    // Call Python Service /parse-file endpoint by streaming the uploaded file.
    // This avoids relying on the Python service having access to the same filesystem.
    let parseResult;
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(absolutePath), {
        filename: req.file.originalname,
      });

      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/parse-file`,
        form,
        {
          timeout: 10000,
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );
      parseResult = response.data;
    } catch (apiError) {
      console.warn(
        "Python NLP Service parsing error, using local fallback:",
        apiError.message,
      );
      parseResult = await mockAi.parse(absolutePath);
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
      const form = new FormData();
      form.append("file", fs.createReadStream(absolutePath), {
        filename: req.file.originalname,
      });

      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/parse-file`,
        form,
        {
          timeout: 10000,
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );
      parseResult = response.data;
    } catch (apiError) {
      console.warn(
        "Python NLP Service parsing error, using local fallback:",
        apiError.message,
      );
      parseResult = await mockAi.parse(absolutePath);
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

    // Call Python Service /analyze endpoint. Fallback to mock AI if service unreachable.
    let analyzeResult;
    try {
      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/analyze`,
        {
          text: resume.extractedText || "",
          skills: resume.skills || [],
          target_role: targetRole,
        },
        { timeout: 5000 },
      );
      analyzeResult = response.data;
    } catch (apiError) {
      console.warn(
        "Python NLP Service analysis error, using local fallback:",
        apiError.message,
      );
      analyzeResult = await mockAi.analyze({
        text: resume.extractedText || "",
        skills: resume.skills || [],
        target_role: targetRole,
      });
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

    // Call Python Service /analyze endpoint with custom variables. Fallback to mockAi.
    let analyzeResult;
    try {
      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/analyze`,
        {
          text: `Custom search with skills: ${skills.join(", ")}`,
          skills: skills,
          target_role: targetRole,
        },
        { timeout: 5000 },
      );
      analyzeResult = response.data;
    } catch (apiError) {
      console.warn(
        "Python NLP Service custom analysis error, using fallback:",
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
