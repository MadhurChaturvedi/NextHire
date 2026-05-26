const express = require('express');
const {
  uploadResume,
  analyzeResume,
  getResumeAnalysis,
  getResumeHistory,
  deleteResume,
  postCareerRecommendation
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze', protect, analyzeResume);
router.get('/history', protect, getResumeHistory);
router.post('/career-recommendation', protect, postCareerRecommendation);
router.get('/:id', protect, getResumeAnalysis);
router.delete('/:id', protect, deleteResume);

module.exports = router;
