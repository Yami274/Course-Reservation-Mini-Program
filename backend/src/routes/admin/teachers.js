const router = require('express').Router();
const { Teacher } = require('../../models');
const { success, fail } = require('../../utils/response');

router.get('/', async (req, res) => {
  try {
    const list = await Teacher.findAll({ order: [['created_at', 'DESC']] });
    res.json(success(list));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

router.post('/', async (req, res) => {
  try {
    const { name, avatar, title, intro } = req.body;
    if (!name) return res.status(400).json(fail('讲师姓名不能为空'));
    const teacher = await Teacher.create({ name, avatar: avatar || '', title: title || '', intro: intro || '' });
    res.json(success(teacher, '创建成功'));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json(fail('讲师不存在', 404));
    const { name, avatar, title, intro } = req.body;
    await teacher.update({
      name: name ?? teacher.name,
      avatar: avatar ?? teacher.avatar,
      title: title ?? teacher.title,
      intro: intro ?? teacher.intro
    });
    res.json(success(teacher, '更新成功'));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Teacher.destroy({ where: { id: req.params.id } });
    res.json(success(null, '删除成功'));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

module.exports = router;
