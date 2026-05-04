const router = require('express').Router();
const { CourseSchedule, CourseType, Course } = require('../models');
const { success, fail } = require('../utils/response');

/**
 * GET /api/schedules/:id
 * 时段详情（含剩余名额）
 */
router.get('/:id', async (req, res) => {
  try {
    const schedule = await CourseSchedule.findByPk(req.params.id, {
      include: [{
        model: CourseType, as: 'courseType',
        include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }]
      }]
    });
    if (!schedule) return res.status(404).json(fail('时段不存在', 404));
    res.json(success(schedule));
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
