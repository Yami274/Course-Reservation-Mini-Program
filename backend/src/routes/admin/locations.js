const router = require('express').Router();
const { Location } = require('../../models');
const { success, fail } = require('../../utils/response');

router.get('/', async (req, res) => {
  const list = await Location.findAll({ order: [['created_at', 'DESC']] });
  res.json(success(list));
});

router.post('/', async (req, res) => {
  const { name, address, latitude, longitude, contact } = req.body;
  if (!name || !address) return res.status(400).json(fail('名称和地址不能为空'));
  const loc = await Location.create({ name, address, latitude: latitude || 0, longitude: longitude || 0, contact: contact || '' });
  res.json(success(loc, '创建成功'));
});

router.put('/:id', async (req, res) => {
  const loc = await Location.findByPk(req.params.id);
  if (!loc) return res.status(404).json(fail('地点不存在', 404));
  const { name, address, latitude, longitude, contact } = req.body;
  await loc.update({
    name: name ?? loc.name, address: address ?? loc.address,
    latitude: latitude ?? loc.latitude, longitude: longitude ?? loc.longitude,
    contact: contact ?? loc.contact
  });
  res.json(success(loc, '更新成功'));
});

router.delete('/:id', async (req, res) => {
  await Location.destroy({ where: { id: req.params.id } });
  res.json(success(null, '删除成功'));
});

module.exports = router;
