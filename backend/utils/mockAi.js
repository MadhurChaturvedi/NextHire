const fs = require("fs");
const path = require("path");
const CareerRole = require("../models/CareerRole");

const defaultTemplate = {
  skills: [
    "react",
    "node.js",
    "javascript",
    "express",
    "html",
    "css",
    "mongodb",
    "sql",
    "git",
    "rest api",
    "typescript",
  ],
  roadmap: [],
  recommendedProjects: [],
  recommendedCertifications: [],
};

async function parse(filePath) {
  const result = {
    text: "",
    contact: { name: "Unknown Applicant", email: "", phone: "" },
    skills: [],
    structure: {
      education: "",
      experience: "",
      projects: "",
      certifications: "",
    },
  };

  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".txt") {
        result.text = fs.readFileSync(filePath, "utf8");
      } else {
        // For non-txt files return a minimal placeholder containing the filename
        result.text = `Parsed placeholder text for file: ${path.basename(filePath)}`;
      }

      // crude skill extraction from filename
      const nameLower = path.basename(filePath).toLowerCase();
      if (nameLower.includes("react")) result.skills.push("react");
      if (nameLower.includes("node")) result.skills.push("node.js");
      if (nameLower.includes("python")) result.skills.push("python");
    } else {
      result.text = "";
    }
  } catch (err) {
    result.text = "";
  }

  return result;
}

async function analyze({ text = "", skills = [], target_role = "" }) {
  // Try to load role template from DB
  let template = defaultTemplate;
  try {
    if (target_role) {
      const roleDoc = await CareerRole.findOne({ roleName: target_role });
      if (roleDoc) {
        template = {
          skills: roleDoc.requiredSkills || defaultTemplate.skills,
          roadmap: roleDoc.roadmap || [],
          recommendedProjects: roleDoc.recommendedProjects || [],
          recommendedCertifications: roleDoc.recommendedCertifications || [],
        };
      }
    }
  } catch (e) {
    // ignore DB errors and use default
  }

  const requiredSkills = template.skills || [];
  const matchingSkills = (skills || []).filter((s) =>
    requiredSkills.some(
      (rs) =>
        rs.toLowerCase() === s.toLowerCase() ||
        rs.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(rs.toLowerCase()),
    ),
  );
  const uniqueMatching = Array.from(new Set(matchingSkills));
  const missingSkills = requiredSkills.filter(
    (s) => !uniqueMatching.includes(s),
  );

  const skillRelevance = requiredSkills.length
    ? Math.round((uniqueMatching.length / requiredSkills.length) * 100)
    : 0;
  const keywordDensity = Math.min(100, Math.max(10, skillRelevance + 10));
  const structureScore = 60;
  const overall = Math.max(
    5,
    Math.min(
      100,
      Math.round(
        skillRelevance * 0.45 + keywordDensity * 0.35 + structureScore * 0.2,
      ),
    ),
  );

  return {
    score: {
      overall,
      skillRelevance,
      keywordDensity,
      structureScore,
      checks: [],
    },
    matchingSkills: uniqueMatching,
    missingSkills,
    suggestions: [],
    roadmap: template.roadmap || [],
    recommendedProjects: template.recommendedProjects || [],
    recommendedCertifications: template.recommendedCertifications || [],
    interviewPrep: {
      technical_questions: uniqueMatching
        .slice(0, 3)
        .map((s) => `Explain how you used ${s}`),
      behavioral_guidance: "Use STAR method.",
      role_specific_focus: `Focus on ${target_role || "relevant"} topics.`,
    },
  };
}

module.exports = { parse, analyze };
