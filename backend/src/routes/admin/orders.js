const router = require('express').Router();
const { Op } = require('sequelize');
const { Order, CourseSchedule, User, Course, CourseType, Student } = require('../../models');
const { success, fail, paginate } = require('../../utils/response');

/**
 * GET /api/admin/orders
 * 预约订单列表（管理端）
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'phone', 'openid'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'cover'] },
        { model: CourseType, as: 'courseType', attributes: ['id', 'name'] },
        { model: CourseSchedule, as: 'schedule', attributes: ['id', 'date', 'start_time', 'end_time'] },
        { model: Student, as: 'student', attributes: ['id', 'name', 'age', 'phone'] }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });
    res.json(paginate(rows, count, page, pageSize));
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/admin/orders/:id
 * 订单详情
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'phone', 'openid'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'cover'] },
        { model: CourseType, as: 'courseType', attributes: ['id', 'name'] },
        { model: CourseSchedule, as: 'schedule', attributes: ['id', 'date', 'start_time', 'end_time'] },
        { model: Student, as: 'student', attributes: ['id', 'name', 'age', 'phone'] }
      ]
    });
    if (!order) return res.status(404).json(fail('订单不存在', 404));
    res.json(success(order));
  } catch (err) {
    console.error('Admin get order error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/admin/orders/:id/audit
 * 审核订单（通过/拒绝）
 * Body: { action: 'approve'|'reject', remark? }
 */
router.put('/:id/audit', async (req, res) => {
  try {
    const { action, remark } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json(fail('操作类型无效，仅支持 approve 或 reject'));
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json(fail('订单不存在', 404));
    if (order.status !== 'pending') {
      return res.status(400).json(fail('当前订单状态不允许审核'));
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await order.update({ status: newStatus, audit_remark: remark || '' });

    // 拒绝时释放名额
    if (action === 'reject') {
      const schedule = await CourseSchedule.findByPk(order.schedule_id);
      if (schedule) {
        const newCount = Math.max(0, schedule.booked_count - 1);
        await schedule.update({
          booked_count: newCount,
          status: 'active'
        });
      }
    }

    res.json(success(null, action === 'approve' ? '审核通过' : '已拒绝'));
  } catch (err) {
    console.error('Audit order error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/admin/orders/:id/cancel
 * 管理员取消订单
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json(fail('订单不存在', 404));
    if (order.status === 'cancelled') {
      return res.status(400).json(fail('订单已取消'));
    }

    await order.update({ status: 'cancelled', audit_remark: '管理员取消' });

    // 释放已通过/待审核订单的名额
    if (['pending', 'approved'].includes(order.status)) {
      const schedule = await CourseSchedule.findByPk(order.schedule_id);
      if (schedule && schedule.booked_count > 0) {
        await schedule.update({
          booked_count: schedule.booked_count - 1,
          status: 'active'
        });
      }
    }

    res.json(success(null, '已取消'));
  } catch (err) {
    console.error('Admin cancel order error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
