const router = require('express').Router();
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const { User } = require('../../models');
const { success, fail } = require('../../utils/response');

/**
 * POST /api/admin/login
 * 管理后台登录（用户名密码）
 * 无需 auth 中间件
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(fail('请输入用户名和密码'));
    }

    const user = await User.findOne({
      where: { nickname: username, role: 'admin' }
    });

    if (!user) {
      return res.status(401).json(fail('用户名或密码错误', 401));
    }

    // 验证密码（环境变量配置，默认 admin123）
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      return res.status(401).json(fail('用户名或密码错误', 401));
    }

    const token = jwt.sign(
      { userId: user.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json(success({ token, user }));
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json(fail(err.message));
  }
});

// 以下路由需要登录和管理员权限
router.use(auth);
router.use(adminAuth);

router.use('/dashboard', require('./dashboard'));
router.use('/courses', require('./courses'));
router.use('/categories', require('./categories'));
router.use('/orders', require('./orders'));
router.use('/teachers', require('./teachers'));
router.use('/locations', require('./locations'));
router.use('/banners', require('./banners'));
router.use('/notices', require('./notices'));
router.use('/messages', require('./messages'));
router.use('/students', require('./students'));
router.use('/upload', require('./upload'));

module.exports = router;
