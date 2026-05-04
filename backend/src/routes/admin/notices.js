const router = require('express').Router();
const { Notice } = require('../../models');
const { success, fail } = require('../../utils/response');

router.get('/', async (req, res) => {
  const list = await Notice.findAll({ order: [['created_at', 'DESC']] });
  res.json(success(list));
});

router.post('/', async (req, res) => {
  const { content, start_date, end_date, status } = req.body;
  if (!content || !start_date || !end_date) return res.status(400).json(fail('内容、开始日期和结束日期不能为空'));
  const notice = await Notice.create({ content, start_date, end_date, status: status || 'active' });
  res.json(success(notice, '创建成功'));
});

router.put('/:id', async (req, res) => {
  const notice = await Notice.findByPk(req.params.id);
  if (!notice) return res.status(404).json(fail('公告不存在', 404));
  const { content, start_date, end_date, status } = req.body;
  await notice.update({
    content: content ?? notice.content, start_date: start_date ?? notice.start_date,
    end_date: end_date ?? notice.end_date, status: status ?? notice.status
  });
  res.json(success(notice, '更新成功'));
});

router.delete('/:id', async (req, res) => {
  await Notice.destroy({ where: { id: req.params.id } });
  res.json(success(null, '删除成功'));
});

module.exports = router;
