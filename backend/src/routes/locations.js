const router = require('express').Router();
const { Location } = require('../models');
const { success, fail } = require('../utils/response');

/**
 * GET /api/locations
 * 全部上课地点列表
 */
router.get('/', async (req, res) => {
  try {
    const list = await Location.findAll({ order: [['created_at', 'DESC']] });
    res.json(success(list));
  } catch (err) {
    console.error('Get locations error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
