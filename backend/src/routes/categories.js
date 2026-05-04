const router = require('express').Router();
const { Category } = require('../models');
const { success, fail } = require('../utils/response');

/**
 * GET /api/categories
 * 全部分类列表
 */
router.get('/', async (req, res) => {
  try {
    const list = await Category.findAll({ order: [['sort', 'ASC']] });
    res.json(success(list));
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
