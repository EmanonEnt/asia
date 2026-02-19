// api/wx-config.js
import crypto from 'crypto';
import fetch from 'node-fetch';

// 公众号配置（替换为你的真实信息）
const APPID = 'wx019d141a63482cd8';
const APPSECRET = '你的公众号AppSecret'; // 从微信公众平台-开发-基本配置获取
let jsapi_ticket = '';
let ticketExpireTime = 0;

// 1. 获取 access_token
async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.access_token;
}

// 2. 获取 jsapi_ticket（缓存7200秒）
async function getJsapiTicket() {
  // 检查ticket是否有效
  if (Date.now() < ticketExpireTime && jsapi_ticket) {
    return jsapi_ticket;
  }

  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
  const res = await fetch(url);
  const data = await res.json();
  
  jsapi_ticket = data.ticket;
  ticketExpireTime = Date.now() + (data.expires_in - 60) * 1000; // 提前60秒更新
  return jsapi_ticket;
}

// 3. 生成微信签名
function createSignature(ticket, noncestr, timestamp, url) {
  const str = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

// Vercel Serverless 主函数
export default async function handler(req, res) {
  try {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: '缺少页面URL参数' });
    }

    // 实时生成参数
    const timestamp = Math.floor(Date.now() / 1000); // 实时时间戳
    const noncestr = Math.random().toString(36).substr(2, 16); // 随机串
    const ticket = await getJsapiTicket();
    const signature = createSignature(ticket, noncestr, timestamp, url);

    // 返回给前端
    res.json({
      appId: APPID,
      timestamp,
      nonceStr: noncestr,
      signature
    });
  } catch (err) {
    console.error('生成微信配置失败:', err);
    res.status(500).json({ error: err.message });
  }
}
