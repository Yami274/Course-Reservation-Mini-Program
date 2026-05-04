const router = require('express').Router();
const { Op } = require('sequelize');
const { Student, User, Order, Course, CourseType, CourseSchedule } = require('../../models');
const { success, fail, paginate } = require('../../utils/response');

/**
 * GET /api/admin/students
 * 学员列表（管理端，分页 + 搜索）
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'phone'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset
    });

    // 为每个学员统计预约次数和最近上课时间
    const list = await Promise.all(rows.map(async (s) => {
      const orderCount = await Order.count({ where: { student_id: s.id } });
      const lastOrder = await Order.findOne({
        where: { student_id: s.id },
        include: [{ model: CourseSchedule, as: 'schedule', attributes: ['date', 'start_time'] }],
        order: [['created_at', 'DESC']]
      });
      let lastClass = '';
      if (lastOrder?.schedule) {
        lastClass = `${lastOrder.schedule.date} ${(lastOrder.schedule.start_time || '').slice(0, 5)}`;
      }
      return {
        id: s.id,
        name: s.name,
        age: s.age,
        phone: s.phone,
        notes: s.notes,
        created_at: s.created_at,
        user: s.user,
        orderCount,
        lastClass
      };
    }));

    res.json(paginate(list, count, page, pageSize));
  } catch (err) {
    console.error('Admin get students error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/admin/students/:id
 * 学员详情（含预约记录）
 */
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'phone'] }]
    });
    if (!student) return res.status(404).json(fail('学员不存在', 404));

    const orders = await Order.findAll({
      where: { student_id: student.id },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title'] },
        { model: CourseType, as: 'courseType', attributes: ['id', 'name'] },
        { model: CourseSchedule, as: 'schedule', attributes: ['date', 'start_time', 'end_time'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(success({ student, orders }));
  } catch (err) {
    console.error('Admin get student detail error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
