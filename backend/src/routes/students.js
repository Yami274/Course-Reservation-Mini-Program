const router = require('express').Router();
const auth = require('../middleware/auth');
const { Student } = require('../models');
const { success, fail } = require('../utils/response');

router.use(auth);

/**
 * GET /api/students
 * 我的学员列表
 */
router.get('/', async (req, res) => {
  try {
    const list = await Student.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']]
    });
    res.json(success(list));
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * POST /api/students
 * 添加学员
 * Body: { name, age?, phone?, notes? }
 */
router.post('/', async (req, res) => {
  try {
    const { name, age, phone, notes } = req.body;
    if (!name) return res.status(400).json(fail('学员姓名不能为空'));

    const student = await Student.create({
      user_id: req.userId,
      name,
      age: age || 0,
      phone: phone || '',
      notes: notes || ''
    });
    res.json(success(student, '添加成功'));
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * PUT /api/students/:id
 * 编辑学员信息
 */
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id, user_id: req.userId }
    });
    if (!student) return res.status(404).json(fail('学员不存在', 404));

    const { name, age, phone, notes } = req.body;
    await student.update({
      name: name ?? student.name,
      age: age ?? student.age,
      phone: phone ?? student.phone,
      notes: notes ?? student.notes
    });
    res.json(success(student, '更新成功'));
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * DELETE /api/students/:id
 * 删除学员
 */
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id, user_id: req.userId }
    });
    if (!student) return res.status(404).json(fail('学员不存在', 404));

    await student.destroy();
    res.json(success(null, '删除成功'));
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
