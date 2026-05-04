const router = require('express').Router();
const { Op } = require('sequelize');
const { Course, Category, CourseType, CourseSchedule, Teacher, Location } = require('../models');
const { success, fail, paginate } = require('../utils/response');

/**
 * GET /api/courses
 * 课程列表（分页 + 分类筛选 + 关键词搜索）
 * 包含班型和时段，前端可据此计算余席和价格
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category_id, keyword, status = 'published' } = req.query;
    const where = { status };

    if (category_id) where.category_id = Number(category_id);
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };

    const { rows, count } = await Course.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        {
          model: CourseType, as: 'courseTypes',
          include: [{
            model: CourseSchedule, as: 'schedules',
            where: { status: ['active', 'full'] },
            required: false
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    // 批量查询关联的讲师和地点
    const allTeacherIds = [...new Set(rows.flatMap(c => c.teacher_ids || []))];
    const allLocationIds = [...new Set(rows.flatMap(c => c.location_ids || []))];

    const [teachers, locations] = await Promise.all([
      allTeacherIds.length > 0 ? Teacher.findAll({ where: { id: { [Op.in]: allTeacherIds } } }) : [],
      allLocationIds.length > 0 ? Location.findAll({ where: { id: { [Op.in]: allLocationIds } } }) : []
    ]);

    const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));
    const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));

    const list = rows.map(c => {
      const json = c.toJSON();
      json.teachers = (c.teacher_ids || []).map(id => teacherMap[id]).filter(Boolean);
      json.locations = (c.location_ids || []).map(id => locationMap[id]).filter(Boolean);
      return json;
    });

    res.json(paginate(list, count, page, pageSize));
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/courses/hot
 * 热门课程（按创建时间倒序，取前N个），包含班型时段
 */
router.get('/hot', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const courses = await Course.findAll({
      where: { status: 'published' },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        {
          model: CourseType, as: 'courseTypes',
          include: [{
            model: CourseSchedule, as: 'schedules',
            where: { status: ['active', 'full'] },
            required: false
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit)
    });

    // 批量查询关联的讲师
    const allTeacherIds = [...new Set(courses.flatMap(c => c.teacher_ids || []))];
    const teachers = allTeacherIds.length > 0
      ? await Teacher.findAll({ where: { id: { [Op.in]: allTeacherIds } } })
      : [];
    const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));

    const list = courses.map(c => {
      const json = c.toJSON();
      json.teachers = (c.teacher_ids || []).map(id => teacherMap[id]).filter(Boolean);
      return json;
    });

    res.json(success(list));
  } catch (err) {
    console.error('Get hot courses error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * GET /api/courses/:id
 * 课程详情（含分类、班型、时段、讲师、地点）
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        {
          model: CourseType, as: 'courseTypes',
          include: [{
            model: CourseSchedule, as: 'schedules',
            where: { status: ['active', 'full'] },
            required: false
          }]
        }
      ]
    });

    if (!course) {
      return res.status(404).json(fail('课程不存在', 404));
    }

    // 查询关联的讲师和地点
    const teacherIds = course.teacher_ids || [];
    const locationIds = course.location_ids || [];

    const [teachers, locations] = await Promise.all([
      teacherIds.length > 0 ? Teacher.findAll({ where: { id: { [Op.in]: teacherIds } } }) : [],
      locationIds.length > 0 ? Location.findAll({ where: { id: { [Op.in]: locationIds } } }) : []
    ]);

    const result = course.toJSON();
    result.teachers = teachers;
    result.locations = locations;

    res.json(success(result));
  } catch (err) {
    console.error('Get course detail error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
