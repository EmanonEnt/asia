// api/wx-config.js - 微信JSSDK签名接口（Vercel Serverless Function）
import crypto from 'crypto';

// 1. 配置微信公众号参数（优先从Vercel环境变量读取，本地调试用备用值）
const APPID = process.env.WECHAT_APPID || 'wx019d141a63482cd8'; // 你的AppID（已填）
const APPSECRET = process.env.WECHAT_SECRET || '180374121eb3edf8a8070891be064ed4'; // 👉 替换为你的真实AppSecret，或在Vercel添加WECHAT_SECRET环境变量

// 2. 缓存ticket（避免频繁调用微信接口）
let jsapi_ticket = '';
let ticketExpireTime = 0;

/**
 * 获取微信access_token
 * @returns {string} 有效的access_token
 */
async function getAccessToken() {
  try {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    // 微信接口错误处理
    if (data.errcode) {
      throw new Error(`获取access_token失败: ${data.errmsg} (错误码: ${data.errcode})`);
    }
    if (!data.access_token) {
      throw new Error('微信接口未返回access_token');
    }

    return data.access_token;
  } catch (error) {
    console.error('getAccessToken 错误:', error);
    throw error;
  }
}

/**
 * 获取微信jsapi_ticket（带7200秒缓存）
 * @returns {string} 有效的jsapi_ticket
 */
async function getJsapiTicket() {
  try {
    // 检查缓存是否有效（提前60秒过期，避免边界问题）
    if (Date.now() < ticketExpireTime && jsapi_ticket) {
      return jsapi_ticket;
    }

    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    // 微信接口错误处理
    if (data.errcode) {
      throw new Error(`获取jsapi_ticket失败: ${data.errmsg} (错误码: ${data.errcode})`);
    }
    if (!data.ticket) {
      throw new Error('微信接口未返回jsapi_ticket');
    }

    // 更新缓存
    jsapi_ticket = data.ticket;
    ticketExpireTime = Date.now() + (data.expires_in - 60) * 1000; // 提前60秒更新
    return jsapi_ticket;
  } catch (error) {
    console.error('getJsapiTicket 错误:', error);
    throw error;
  }
}

/**
 * 生成微信JSSDK签名
 * @param {string} ticket - jsapi_ticket
 * @param {string} nonceStr - 随机字符串
 * @param {string} timestamp - 时间戳
 * @param {string} url - 当前页面URL
 * @returns {string} SHA1签名
 */
function createSignature(ticket, nonceStr, timestamp, url) {
  // 按微信要求拼接字符串
  const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  // SHA1加密生成签名
  return crypto.createHash('sha1').update(str).digest('hex');
}

/**
 * Vercel Serverless 主处理函数
 * 支持 GET/POST 两种请求方式
 */
export default async function handler(req, res) {
  // 设置CORS跨域（解决前端跨域问题）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. 校验AppSecret配置
    if (!APPSECRET) {
      return res.status(400).json({
        error: '请配置微信AppSecret',
        tip: '在Vercel添加WECHAT_SECRET环境变量，或直接填写APPSECRET常量'
      });
    }

    // 2. 获取前端传入的URL（支持GET/POST）
    let url = '';
    if (req.method === 'GET') {
      url = req.query.url || '';
    } else if (req.method === 'POST') {
      url = req.body?.url || '';
    }

    if (!url) {
      return res.status(400).json({
        error: '缺少url参数',
        tip: '请传入当前页面的完整URL（包含http/https，不含#及后面内容）'
      });
    }

    // 3. 生成签名所需参数
    const ticket = await getJsapiTicket();
    const nonceStr = Math.random().toString(36).substr(2, 15); // 15位随机字符串
    const timestamp = Math.floor(Date.now() / 1000).toString(); // 秒级时间戳
    const signature = createSignature(ticket, nonceStr, timestamp, url);

    // 4. 返回微信JSSDK配置
    res.status(200).json({
      appId: APPID,
      timestamp,
      nonceStr,
      signature,
      ticket, // 调试用，生产环境可删除
      url // 调试用，生产环境可删除
    });
  } catch (error) {
    // 错误兜底，返回详细信息便于调试
    console.error('wx-config接口全局错误:', error);
    res.status(500).json({
      error: '服务器内部错误',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : '' // 开发环境返回堆栈
    });
  }
}
