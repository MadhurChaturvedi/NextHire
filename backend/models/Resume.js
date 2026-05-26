const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String
  },
  skills: [String],
  parsedData: {
    name: String,
    email: String,
    phone: String,
    education: String,
    experience: String,
    certifications: String,
    projects: String
  },
  score: {
    overall: Number,
    skillRelevance: Number,
    keywordDensity: Number,
    structureScore: Number,
    checks: [String]
  },
  recommendations: {
    targetRole: String,
    missingSkills: [String],
    roadmap: [
      {
        step: Number,
        title: String,
        description: String,
        resources: String
      }
    ],
    recommendedProjects: [
      {
        title: String,
        description: String,
        techStack: String
      }
    ],
    recommendedCertifications: [String],
    interviewPrep: {
      technical_questions: [String],
      behavioral_guidance: String,
      role_specific_focus: String
    }
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);
