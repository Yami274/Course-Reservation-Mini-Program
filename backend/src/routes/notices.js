const router = require('express').Router();
const { Op } = require('sequelize');
const { Notice } = require('../models');
const { success, fail } = require('../utils/response');

/**
 * GET /api/notices
 * 当前有效的公告列表
 */
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const list = await Notice.findAll({
      where: {
        status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      },
      order: [['created_at', 'DESC']]
    });
    res.json(success(list));
  } catch (err) {
    console.error('Get notices error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
