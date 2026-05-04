const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { wxLogin } = require('../utils/wechat');
const { User } = require('../models');
const { success, fail } = require('../utils/response');

/**
 * POST /api/auth/login
 * 微信小程序登录
 * Body: { code, nickname?, avatar? }
 */
router.post('/login', async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body;

    // 开发环境：微信凭证未配置时，使用测试账号（无论是否传了code）
    const isDev = process.env.NODE_ENV !== 'production';
    const wxConfigured = process.env.WX_APP_ID && process.env.WX_APP_SECRET;

    if (isDev && !wxConfigured) {
      const [user] = await User.findOrCreate({
        where: { openid: 'dev_test_openid' },
        defaults: { nickname: '测试用户', avatar: '', role: 'user' }
      });
      if (nickname || avatar) await user.update({
        nickname: nickname || user.nickname,
        avatar: avatar || user.avatar
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      return res.json(success({ token, user }));
    }

    // 未传code → 报错
    if (!code) {
      return res.status(400).json(fail('缺少登录凭证code'));
    }

    // code换取openid
    const { openid } = await wxLogin(code);

    const [user] = await User.findOrCreate({
      where: { openid },
      defaults: {
        nickname: nickname || '新用户',
        avatar: avatar || ''
      }
    });

    if (nickname || avatar) {
      await user.update({
        nickname: nickname || user.nickname,
        avatar: avatar || user.avatar
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json(success({ token, user }));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(fail(err.message || '登录失败'));
  }
});

module.exports = router;
