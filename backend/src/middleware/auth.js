const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { fail } = require('../utils/response');

/**
 * JWT 认证中间件
 * 从 Authorization header 中提取 Bearer token 并验证，同时校验用户是否存在
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(fail('请先登录', 401));
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 校验用户是否仍存在于数据库中（防止 seed 重置后 token 中的 userId 已失效）
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json(fail('用户不存在，请重新登录', 401));
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(fail('登录已过期，请重新登录', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json(fail('无效的登录凭证', 401));
    }
    next(err);
  }
};
