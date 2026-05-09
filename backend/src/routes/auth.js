const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { wxLogin, getPhoneNumber } = require('../utils/wechat');
const { User } = require('../models');
const { success, fail } = require('../utils/response');

const isDev = () => process.env.NODE_ENV !== 'production';
const wxConfigured = () => !!(process.env.WX_APP_ID && process.env.WX_APP_SECRET);

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/login
 * 微信小程序登录（code 换 openid）
 * Body: { code?, nickname?, avatar? }
 */
router.post('/login', async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body;

    // 开发模式：未配置微信凭证时走测试账号
    if (isDev() && !wxConfigured()) {
      const [user] = await User.findOrCreate({
        where: { openid: 'dev_test_openid' },
        defaults: { nickname: nickname || '测试用户', avatar: avatar || '', role: 'user' }
      });
      if (nickname || avatar) {
        await user.update({
          nickname: nickname || user.nickname,
          avatar: avatar || user.avatar
        });
      }
      return res.json(success({ token: signToken(user), user }));
    }

    if (!code) {
      return res.status(400).json(fail('缺少登录凭证code'));
    }

    const { openid } = await wxLogin(code);
    const [user] = await User.findOrCreate({
      where: { openid },
      defaults: { nickname: nickname || '新用户', avatar: avatar || '' }
    });
    if (nickname || avatar) {
      await user.update({
        nickname: nickname || user.nickname,
        avatar: avatar || user.avatar
      });
    }

    res.json(success({ token: signToken(user), user }));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(fail(err.message || '登录失败'));
  }
});

/**
 * POST /api/auth/phone-login
 * 手机号一键登录
 * Body: { code } — 前端 getPhoneNumber 回调返回的 code（新版 API）
 */
router.post('/phone-login', async (req, res) => {
  try {
    const { code } = req.body;

    // 开发模式：不调用微信 API，用虚拟手机号
    if (isDev() && !wxConfigured()) {
      const [user] = await User.findOrCreate({
        where: { phone: 'dev_test_phone' },
        defaults: { openid: `dev_phone_${Date.now()}`, nickname: '手机用户', avatar: '', role: 'user' }
      });
      return res.json(success({ token: signToken(user), user }));
    }

    if (!code) {
      return res.status(400).json(fail('缺少手机号授权code'));
    }

    const phoneInfo = await getPhoneNumber(code);
    const phoneNumber = phoneInfo.phoneNumber;

    // 按手机号查找或创建用户
    let user = await User.findOne({ where: { phone: phoneNumber } });
    if (!user) {
      // 新用户：创建账号，openid 暂为空（后续可绑定微信）
      user = await User.create({
        phone: phoneNumber,
        openid: `phone_${phoneNumber}_${Date.now()}`,
        nickname: `用户${phoneNumber.slice(-4)}`,
        avatar: '',
        role: 'user',
      });
    }

    res.json(success({ token: signToken(user), user }));
  } catch (err) {
    console.error('Phone login error:', err);
    res.status(500).json(fail(err.message || '手机号登录失败'));
  }
});

module.exports = router;
