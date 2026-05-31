const express = require('express');
const CareerRole = require('../models/CareerRole');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all career roles (names only)
// @route   GET /api/career-roles
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const roles = await CareerRole.find().select('roleName requiredSkills');
    res.json({ success: true, roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get a single career role by name
// @route   GET /api/career-roles/:roleName
// @access  Private
router.get('/:roleName', protect, async (req, res) => {
  try {
    const role = await CareerRole.findOne({ roleName: decodeURIComponent(req.params.roleName) });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Career role not found' });
    }
    res.json({ success: true, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
