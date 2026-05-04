/**
 * 统一API响应格式
 * { code: 0, message: 'ok', data: {...} }
 */

const success = (data = null, message = 'ok') => ({
  code: 0,
  message,
  data
});

const fail = (message = '请求失败', code = 400) => ({
  code,
  message,
  data: null
});

const paginate = (rows, count, page, pageSize) => ({
  code: 0,
  message: 'ok',
  data: {
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: Math.ceil(count / pageSize)
  }
});

module.exports = { success, fail, paginate };
