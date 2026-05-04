const router = require('express').Router();
const { Banner } = require('../../models');
const { success, fail } = require('../../utils/response');

router.get('/', async (req, res) => {
  const list = await Banner.findAll({ order: [['sort', 'ASC']] });
  res.json(success(list));
});

router.post('/', async (req, res) => {
  const { image, title, subtitle, link_url, sort, status } = req.body;
  if (!image) return res.status(400).json(fail('图片地址不能为空'));
  const banner = await Banner.create({ image, title: title || '', subtitle: subtitle || '', link_url: link_url || '', sort: sort || 0, status: status || 'active' });
  res.json(success(banner, '创建成功'));
});

router.put('/:id', async (req, res) => {
  const banner = await Banner.findByPk(req.params.id);
  if (!banner) return res.status(404).json(fail('轮播图不存在', 404));
  const { image, title, subtitle, link_url, sort, status } = req.body;
  await banner.update({
    image: image ?? banner.image, title: title ?? banner.title, subtitle: subtitle ?? banner.subtitle,
    link_url: link_url ?? banner.link_url, sort: sort ?? banner.sort, status: status ?? banner.status
  });
  res.json(success(banner, '更新成功'));
});

router.delete('/:id', async (req, res) => {
  await Banner.destroy({ where: { id: req.params.id } });
  res.json(success(null, '删除成功'));
});

module.exports = router;
