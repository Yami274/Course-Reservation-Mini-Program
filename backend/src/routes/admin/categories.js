const router = require('express').Router();
const { Category, Course } = require('../../models');
const { success, fail } = require('../../utils/response');

router.get('/', async (req, res) => {
  try {
    const list = await Category.findAll({ order: [['sort', 'ASC']] });
    res.json(success(list));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, sort, parent_id } = req.body;
    if (!name) return res.status(400).json(fail('分类名称不能为空'));
    const cat = await Category.create({ name, icon: icon || '', sort: sort || 0, parent_id: parent_id || 0 });
    res.json(success(cat, '创建成功'));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, icon, sort, parent_id } = req.body;
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json(fail('分类不存在', 404));
    await cat.update({
      name: name ?? cat.name,
      icon: icon ?? cat.icon,
      sort: sort ?? cat.sort,
      parent_id: parent_id ?? cat.parent_id
    });
    res.json(success(cat, '更新成功'));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

router.delete('/:id', async (req, res) => {
  try {
    const count = await Course.count({ where: { category_id: req.params.id } });
    if (count > 0) return res.status(400).json(fail('该分类下有课程，无法删除'));
    await Category.destroy({ where: { id: req.params.id } });
    res.json(success(null, '删除成功'));
  } catch (err) { res.status(500).json(fail(err.message)); }
});

module.exports = router;
