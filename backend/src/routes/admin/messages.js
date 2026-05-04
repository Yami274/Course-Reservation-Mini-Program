const router = require('express').Router();
const { Op } = require('sequelize');
const { Message } = require('../../models');
const { success, fail, paginate } = require('../../utils/response');
const { getAccessToken } = require('../../utils/wechat');
const axios = require('axios');

/**
 * GET /api/admin/messages
 * 推送历史记录
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const where = {};
    if (type) where.type = type;

    const { count, rows } = await Message.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset
    });

    res.json(paginate(rows, count, page, pageSize));
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json(fail(err.message));
  }
});

/**
 * POST /api/admin/messages
 * 发送微信订阅消息
 * Body: { user_openid, template_id, data, page?, type?, student_name?, course_title? }
 */
router.post('/', async (req, res) => {
  try {
    const { user_openid, template_id, data, page, type, student_name, course_title } = req.body;

    if (!user_openid || !template_id || !data) {
      return res.status(400).json(fail('缺少必填参数: user_openid, template_id, data'));
    }

    // 获取 access_token
    const accessToken = await getAccessToken();

    // 发送订阅消息
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
    const payload = {
      touser: user_openid,
      template_id,
      page: page || '',
      data
    };

    let msgStatus = 'success';
    let errorMsg = '';

    try {
      const response = await axios.post(url, payload);
      if (response.data.errcode !== 0) {
        msgStatus = 'failed';
        errorMsg = response.data.errmsg || '发送失败';
      }
    } catch (sendErr) {
      msgStatus = 'failed';
      errorMsg = sendErr.message;
    }

    // 记录发送历史
    await Message.create({
      user_openid,
      template_id,
      type: type || '',
      student_name: student_name || '',
      course_title: course_title || '',
      status: msgStatus,
      error_msg: errorMsg
    });

    if (msgStatus === 'success') {
      res.json(success(null, '消息发送成功'));
    } else {
      res.status(500).json(fail(`消息发送失败: ${errorMsg}`));
    }
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json(fail(err.message));
  }
});

module.exports = router;
