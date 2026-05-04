const router = require('express').Router();

// 公开接口
router.use('/auth', require('./auth'));

// 用户端接口（部分需要登录）
router.use('/courses', require('./courses'));
router.use('/categories', require('./categories'));
router.use('/banners', require('./banners'));
router.use('/notices', require('./notices'));
router.use('/locations', require('./locations'));
router.use('/schedules', require('./schedules'));
router.use('/orders', require('./orders'));
router.use('/students', require('./students'));

// 管理端接口
router.use('/admin', require('./admin'));

module.exports = router;
