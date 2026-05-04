const router = require('express').Router();
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Order, CourseSchedule, Course, CourseType, Student, User } = require('../models');
const { success, fail, paginate } = require('../utils/response');

router.use(auth);

/**
 * POST /api/orders
 * 提交预约（含名额检查和并发控制）
 * Body: { course_id, course_type_id, schedule_id, student_id }
 */
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { course_id, course_type_id, schedule_id, student_id } = req.body;

    if (!course_id || !course_type_id || !schedule_id || !student_id) {
      await t.rollback();
      return res.status(400).json(fail('缺少必填参数'));
    }

    // 检查同时段是否已有待审核/已通过的预约（防重复提交）
    const existing = await Order.findOne({
      where: {
        user_id: req.userId,
        schedule_id,
        status: { [Op.in]: ['pending', 'approved'] }
      }
    });
    if (existing) {
      await t.rollback();
      return res.status(400).json(fail('该时段您已有预约，请勿重复提交'));
    }

    // 名额检查（行级锁防超卖）
    const schedule = await CourseSchedule.findByPk(schedule_id, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!schedule || schedule.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json(fail('该时段已取消'));
    }
    if (schedule.booked_count >= schedule.max_count) {
      await schedule.update({ status: 'full' }, { transaction: t });
      await t.commit();
      return res.status(400).json(fail('名额已满'));
    }

    // 创建订单
    const order = await Order.create({
      user_id: req.userId,
      course_id,
      course_type_id,
      schedule_id,
      student_id,
      status: 'pending'
    }, { transaction: t });

    // 扣减名额
    const newBookedCount = schedule.booked_count + 1;
    await schedule.update({
      booked_count: newBookedCount,
      status: newBookedCount >= schedule.max_count ? 'full' : 'active'
    }, { transaction: t });

    await t.commit();
    res.json(success(order, '预约已提交，请等待管理员审核'));
  } catch (err) {
    await t.rollback();
    console.error('Create order error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/orders
 * 我的预约列表（按状态筛选+分页）
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const where = { user_id: req.userId };
    if (status) where.status = status;

    const { rows, count } = await Order.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'cover'] },
        { model: CourseType, as: 'courseType', attributes: ['id', 'name'] },
        { model: CourseSchedule, as: 'schedule', attributes: ['id', 'date', 'start_time', 'end_time'] },
        { model: Student, as: 'student', attributes: ['id', 'name', 'age', 'phone'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    res.json(paginate(rows, count, page, pageSize));
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/orders/:id
 * 预约详情
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.userId },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'cover', 'intro'] },
        { model: CourseType, as: 'courseType', attributes: ['id', 'name'] },
        { model: CourseSchedule, as: 'schedule', attributes: ['id', 'date', 'start_time', 'end_time', 'max_count', 'booked_count'] },
        { model: Student, as: 'student', attributes: ['id', 'name', 'age', 'phone'] }
      ]
    });

    if (!order) return res.status(404).json(fail('订单不存在', 404));
    res.json(success(order));
  } catch (err) {
    console.error('Get order detail error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/orders/:id/cancel
 * 取消预约（释放名额）
 */
router.put('/:id/cancel', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.userId }
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json(fail('订单不存在', 404));
    }
    if (!['pending', 'approved'].includes(order.status)) {
      await t.rollback();
      return res.status(400).json(fail('当前状态不可取消'));
    }

    await order.update({ status: 'cancelled' }, { transaction: t });

    // 释放名额
    const schedule = await CourseSchedule.findByPk(order.schedule_id, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });
    if (schedule) {
      const newCount = Math.max(0, schedule.booked_count - 1);
      await schedule.update({
        booked_count: newCount,
        status: 'active'
      }, { transaction: t });
    }

    await t.commit();
    res.json(success(null, '已取消预约'));
  } catch (err) {
    await t.rollback();
    console.error('Cancel order error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
