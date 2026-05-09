const axios = require('axios');
const redis = require('../config/redis');

const ACCESS_TOKEN_KEY = 'wx:access_token';

/**
 * 微信小程序登录：code 换取 openid 和 session_key
 */
async function wxLogin(code) {
  const { WX_APP_ID, WX_APP_SECRET } = process.env;
  if (!WX_APP_ID || !WX_APP_SECRET) {
    throw new Error('微信小程序 AppID 或 AppSecret 未配置');
  }
  const url = 'https://api.weixin.qq.com/sns/jscode2session';
  const { data } = await axios.get(url, {
    params: { appid: WX_APP_ID, secret: WX_APP_SECRET, js_code: code, grant_type: 'authorization_code' }
  });
  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg} (code: ${data.errcode})`);
  }
  return data; // { openid, session_key, unionid? }
}

/**
 * 获取小程序全局 access_token（带 Redis 缓存，有效期 7000s，比微信 2h 提前 200s 刷新）
 */
async function getAccessToken() {
  const cached = await redis.get(ACCESS_TOKEN_KEY);
  if (cached) return cached;

  const { WX_APP_ID, WX_APP_SECRET } = process.env;
  const url = 'https://api.weixin.qq.com/cgi-bin/token';
  const { data } = await axios.get(url, {
    params: { grant_type: 'client_credential', appid: WX_APP_ID, secret: WX_APP_SECRET }
  });
  if (data.errcode) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }
  await redis.set(ACCESS_TOKEN_KEY, data.access_token, 'EX', 7000);
  return data.access_token;
}

/**
 * 获取用户手机号（新版，base library 2.21.2+）
 * 前端通过 <button open-type="getPhoneNumber"> 获取 code，传入此函数换取手机号
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-info/phone-number/getPhoneNumber.html
 */
async function getPhoneNumber(code) {
  const { WX_APP_ID, WX_APP_SECRET } = process.env;
  if (!WX_APP_ID || !WX_APP_SECRET) {
    throw new Error('微信小程序 AppID 或 AppSecret 未配置');
  }
  const accessToken = await getAccessToken();
  const url = 'https://api.weixin.qq.com/wxa/business/getuserphonenumber';
  const { data } = await axios.post(
    `${url}?access_token=${accessToken}`,
    { code }
  );
  if (data.errcode !== 0) {
    throw new Error(`获取手机号失败: ${data.errmsg} (code: ${data.errcode})`);
  }
  // data.phone_info: { phoneNumber, purePhoneNumber, countryCode, watermark }
  return data.phone_info;
}

module.exports = { wxLogin, getAccessToken, getPhoneNumber };
