const mongoose = require('mongoose');

const CareerRoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  requiredSkills: [String],
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
  recommendedCertifications: [String]
});

module.exports = mongoose.model('CareerRole', CareerRoleSchema);



