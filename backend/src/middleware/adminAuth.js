const { fail } = require('../utils/response');

/**
 * 管理员权限中间件
 * 必须在 auth 中间件之后使用
 */
module.exports = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json(fail('无管理员权限', 403));
  }
  next();
};
