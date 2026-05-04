const axios = require('axios');

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
 * 获取小程序全局 access_token（用于订阅消息等）
 */
async function getAccessToken() {
  const { WX_APP_ID, WX_APP_SECRET } = process.env;
  const url = 'https://api.weixin.qq.com/cgi-bin/token';
  const { data } = await axios.get(url, {
    params: { grant_type: 'client_credential', appid: WX_APP_ID, secret: WX_APP_SECRET }
  });
  if (data.errcode) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }
  return data.access_token;
}

module.exports = { wxLogin, getAccessToken };
