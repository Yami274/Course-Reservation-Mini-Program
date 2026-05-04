const router = require('express').Router();
const { Banner } = require('../models');
const { success, fail } = require('../utils/response');

/**
 * GET /api/banners
 * 启用的轮播图列表（按排序字段升序）
 */
router.get('/', async (req, res) => {
  try {
    const list = await Banner.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC']]
    });
    res.json(success(list));
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
