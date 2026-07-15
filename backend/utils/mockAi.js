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

const pdf = require("pdf-parse");
const mammoth = require("mammoth");

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf8");
  }

  if (ext === ".pdf") {
    const data = fs.readFileSync(filePath);
    try {
      const res = await pdf(data);
      return res.text || "";
    } catch (e) {
      return "";
    }
  }

  if (ext === ".docx" || ext === ".doc") {
    try {
      const res = await mammoth.extractRawText({ path: filePath });
      return res.value || "";
    } catch (e) {
      return "";
    }
  }

  // fallback: read as utf8 if possible
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return "";
  }
}

function extractContactInfo(text) {
  const contact = { name: "Unknown Applicant", email: "", phone: "" };
  if (!text) return contact;
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Heuristic: first non-empty line is likely the name if it contains letters and spaces and no @ or digits
  if (lines.length) {
    const first = lines[0];
    if (
      /^[A-Za-z .'-]{2,60}$/.test(first) &&
      !first.includes("@") &&
      !/\d/.test(first)
    ) {
      contact.name = first;
    }
  }

  // email
  const emailMatch = text.match(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  );
  if (emailMatch) contact.email = emailMatch[0];

  // phone (basic international/local patterns)
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{6,}\d)/);
  if (phoneMatch) contact.phone = phoneMatch[0];

  return contact;
}

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
    if (!fs.existsSync(filePath)) return result;

    const text = await extractTextFromFile(filePath);
    result.text =
      text || `Parsed placeholder text for file: ${path.basename(filePath)}`;

    // contact extraction
    result.contact = extractContactInfo(result.text);

    // simple skill extraction using defaultTemplate
    const textLower = (result.text || "").toLowerCase();
    const skillsFound = new Set();
    for (const s of defaultTemplate.skills) {
      const key = s.toLowerCase();
      // word boundary search for multi-word keys
      const re = new RegExp("\\b" + key.replace(/[-.]/g, "\\$&") + "\\b", "i");
      if (re.test(textLower)) skillsFound.add(key);
    }
    result.skills = Array.from(skillsFound);

    // basic structure extraction (look for headings)
    const eduMatch = result.text.match(
      /education[\s:\n\r]+([\s\S]{0,300}?)(\n\n|experience|projects|certifications|$)/i,
    );
    if (eduMatch) result.structure.education = eduMatch[1].trim();
    const expMatch = result.text.match(
      /experience[\s:\n\r]+([\s\S]{0,600}?)(\n\n|education|projects|certifications|$)/i,
    );
    if (expMatch) result.structure.experience = expMatch[1].trim();
  } catch (err) {
    // keep defaults on failure
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
