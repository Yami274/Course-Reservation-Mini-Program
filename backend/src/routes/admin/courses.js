const router = require('express').Router();
const { Op } = require('sequelize');
const { Course, CourseType, CourseSchedule, Order, Category, Teacher, Location } = require('../../models');
const { success, fail, paginate } = require('../../utils/response');

// ========== 课程 CRUD ==========

/**
 * GET /api/admin/courses
 * 课程列表（含草稿/已发布/已归档）
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query;
    const where = {};
    if (status) where.status = status;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };

    const { rows, count } = await Course.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });
    res.json(paginate(rows, count, page, pageSize));
  } catch (err) {
    console.error('Admin get courses error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/admin/courses/:id
 * 课程详情（管理端，含全部班型和时段）
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: CourseType, as: 'courseTypes', include: [{ model: CourseSchedule, as: 'schedules' }] }
      ]
    });
    if (!course) return res.status(404).json(fail('课程不存在', 404));
    res.json(success(course));
  } catch (err) {
    console.error('Admin get course error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * POST /api/admin/courses
 * 创建课程
 */
router.post('/', async (req, res) => {
  try {
    const { title, category_id, cover, intro, teacher_ids, location_ids, status } = req.body;
    if (!title || !category_id) {
      return res.status(400).json(fail('课程名称和分类为必填项'));
    }

    const course = await Course.create({
      title,
      category_id,
      cover: cover || '',
      intro: intro || '',
      teacher_ids: teacher_ids || [],
      location_ids: location_ids || [],
      status: status || 'draft'
    });
    res.json(success(course, '创建成功'));
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/admin/courses/:id
 * 更新课程
 */
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json(fail('课程不存在', 404));

    const { title, category_id, cover, intro, teacher_ids, location_ids, status } = req.body;
    await course.update({
      title: title ?? course.title,
      category_id: category_id ?? course.category_id,
      cover: cover ?? course.cover,
      intro: intro ?? course.intro,
      teacher_ids: teacher_ids ?? course.teacher_ids,
      location_ids: location_ids ?? course.location_ids,
      status: status ?? course.status
    });
    res.json(success(course, '更新成功'));
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * DELETE /api/admin/courses/:id
 * 删除课程（有关联订单时禁止删除）
 */
router.delete('/:id', async (req, res) => {
  try {
    const orderCount = await Order.count({ where: { course_id: req.params.id } });
    if (orderCount > 0) {
      return res.status(400).json(fail('该课程存在预约订单，无法删除，请先下架'));
    }
    // 同时删除关联的班型和时段
    const types = await CourseType.findAll({ where: { course_id: req.params.id } });
    for (const t of types) {
      await CourseSchedule.destroy({ where: { course_type_id: t.id } });
    }
    await CourseType.destroy({ where: { course_id: req.params.id } });
    await Course.destroy({ where: { id: req.params.id } });
    res.json(success(null, '删除成功'));
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/admin/courses/:id/status
 * 上架/下架课程
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json(fail('无效的状态值'));
    }
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json(fail('课程不存在', 404));
    await course.update({ status });
    res.json(success(null, `课程已${status === 'published' ? '上架' : status === 'archived' ? '归档' : '转为草稿'}`));
  } catch (err) {
    console.error('Update course status error:', err);
    res.status(500).json(fail(err.message));
  }
});

// ========== 班型 CRUD ==========

/**
 * POST /api/admin/courses/:courseId/types
 * 为课程添加班型
 */
router.post('/:courseId/types', async (req, res) => {
  try {
    const { name, capacity, price } = req.body;
    if (!name) return res.status(400).json(fail('班型名称不能为空'));

    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json(fail('课程不存在', 404));

    const courseType = await CourseType.create({
      course_id: Number(req.params.courseId),
      name,
      capacity: capacity || 20,
      price: price || 0
    });
    res.json(success(courseType, '班型添加成功'));
  } catch (err) {
    console.error('Create course type error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/admin/courses/types/:id
 * 编辑班型
 */
router.put('/types/:id', async (req, res) => {
  try {
    const ct = await CourseType.findByPk(req.params.id);
    if (!ct) return res.status(404).json(fail('班型不存在', 404));

    const { name, capacity, price } = req.body;
    await ct.update({
      name: name ?? ct.name,
      capacity: capacity ?? ct.capacity,
      price: price ?? ct.price
    });
    res.json(success(ct, '班型更新成功'));
  } catch (err) {
    console.error('Update course type error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * DELETE /api/admin/courses/types/:id
 * 删除班型
 */
router.delete('/types/:id', async (req, res) => {
  try {
    const scheduleCount = await CourseSchedule.count({ where: { course_type_id: req.params.id } });
    if (scheduleCount > 0) {
      // 先删时段再删班型
      await CourseSchedule.destroy({ where: { course_type_id: req.params.id } });
    }
    await CourseType.destroy({ where: { id: req.params.id } });
    res.json(success(null, '班型已删除'));
  } catch (err) {
    console.error('Delete course type error:', err);
    res.status(500).json(fail(err.message));
  }
});

// ========== 时段 CRUD ==========

/**
 * POST /api/admin/courses/types/:typeId/schedules
 * 为班型添加时段
 */
router.post('/types/:typeId/schedules', async (req, res) => {
  try {
    const { date, start_time, end_time, max_count } = req.body;
    if (!date || !start_time || !end_time) {
      return res.status(400).json(fail('日期和时间为必填项'));
    }

    const ct = await CourseType.findByPk(req.params.typeId);
    if (!ct) return res.status(404).json(fail('班型不存在', 404));

    const schedule = await CourseSchedule.create({
      course_type_id: Number(req.params.typeId),
      date,
      start_time,
      end_time,
      max_count: max_count || 20,
      booked_count: 0,
      status: 'active'
    });
    res.json(success(schedule, '时段添加成功'));
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/admin/courses/schedules/:id
 * 编辑时段
 */
router.put('/schedules/:id', async (req, res) => {
  try {
    const schedule = await CourseSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json(fail('时段不存在', 404));

    const { date, start_time, end_time, max_count, status } = req.body;
    // 修改max_count时不能低于已预约数
    if (max_count !== undefined && max_count < schedule.booked_count) {
      return res.status(400).json(fail('名额不能低于已预约人数'));
    }

    await schedule.update({
      date: date ?? schedule.date,
      start_time: start_time ?? schedule.start_time,
      end_time: end_time ?? schedule.end_time,
      max_count: max_count ?? schedule.max_count,
      status: status ?? schedule.status
    });
    res.json(success(schedule, '时段更新成功'));
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * DELETE /api/admin/courses/schedules/:id
 * 删除时段
 */
router.delete('/schedules/:id', async (req, res) => {
  try {
    const orderCount = await Order.count({ where: { schedule_id: req.params.id } });
    if (orderCount > 0) {
      return res.status(400).json(fail('该时段已有预约，无法删除'));
    }
    await CourseSchedule.destroy({ where: { id: req.params.id } });
    res.json(success(null, '时段已删除'));
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
