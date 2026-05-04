const router = require('express').Router();
const { Op, fn, col } = require('sequelize');
const { Order, Course, Student, CourseSchedule } = require('../../models');
const { success, fail } = require('../../utils/response');

/**
 * GET /api/admin/dashboard
 * 数据总览核心数据
 * Query: period=week|month (默认 month)
 */
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const period = req.query.period || 'month';

    // 本周/本月起止
    const dayMs = 24 * 3600 * 1000;
    let periodStart;
    if (period === 'week') {
      const dow = today.getDay() || 7;
      periodStart = new Date(today.getTime() - (dow - 1) * dayMs);
      periodStart.setHours(0, 0, 0, 0);
    } else {
      periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const trendStart = new Date(Date.now() - 30 * dayMs);

    // 名额预警：已满或快满的时段
    const schedules = await CourseSchedule.findAll({
      where: { status: 'active' },
      raw: true
    });
    const warningCount = schedules.filter(s => {
      const left = (s.max_count || 0) - (s.booked_count || 0);
      return left <= 2 && left >= 0;
    }).length;

    const [
      periodOrders,
      pendingCount,
      totalStudents,
      totalCourses,
      todayOrders,
      allOrders
    ] = await Promise.all([
      Order.count({ where: { created_at: { [Op.gte]: periodStart } } }),
      Order.count({ where: { status: 'pending' } }),
      Student.count(),
      Course.count({ where: { status: 'published' } }),
      Order.count({ where: { created_at: { [Op.gte]: today } } }),
      Order.findAll({
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', col('id')), 'count']
        ],
        where: { created_at: { [Op.gte]: trendStart } },
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'ASC']],
        raw: true
      })
    ]);

    res.json(success({
      todayOrders,
      periodOrders,
      pendingCount,
      totalStudents,
      totalCourses,
      warningCount,
      trend: allOrders
    }));
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
