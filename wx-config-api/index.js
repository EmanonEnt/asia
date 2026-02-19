const crypto = require('crypto');
const http = require('http');

// 配置微信公众号参数（直接填你的真实值）
const APPID = 'wx019d141a63482cd8';
const APPSECRET = '180374121eb3edf8a8070891be064ed4'; // 替换为你的真实AppSecret

// 缓存ticket（避免频繁调用微信接口）
let jsapi_ticket = '';
let ticketExpireTime = 0;

// 获取微信access_token
async function getAccessToken() {
  try {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    if (data.errcode) {
      throw new Error(`获取access_token失败: ${data.errmsg} (错误码: ${data.errcode})`);
    }
    if (!data.access_token) {
      throw new Error('微信接口未返回access_token');
    }

    return data.access_token;
  } catch (error) {
    throw error;
  }
}

// 获取微信jsapi_ticket
async function getJsapiTicket() {
  // 如果缓存未过期，直接返回缓存的ticket
  if (jsapi_ticket && Date.now() < ticketExpireTime) {
    return jsapi_ticket;
  }

  try {
    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    if (data.errcode) {
      throw new Error(`获取jsapi_ticket失败: ${data.errmsg} (错误码: ${data.errcode})`);
    }
    if (!data.ticket) {
      throw new Error('微信接口未返回ticket');
    }

    // 缓存ticket，有效期2小时
    jsapi_ticket = data.ticket;
    ticketExpireTime = Date.now() + (data.expires_in - 60) * 1000; // 提前60秒刷新

    return data.ticket;
  } catch (error) {
    throw error;
  }
}

// 生成微信JS-SDK签名
function createSignature(ticket, nonceStr, timestamp, url) {
  const signStr = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  return crypto.createHash('sha1').update(signStr).digest('hex');
}

// 创建HTTP服务
const server = http.createServer(async (req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  // 解析URL参数
  const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const url = urlParams.get('url');

  if (!url) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: '缺少url参数' }));
    return;
  }

  try {
    const ticket = await getJsapiTicket();
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createSignature(ticket, nonceStr, timestamp, url);

    res.writeHead(200);
    res.end(JSON.stringify({
      appId: APPID,
      timestamp,
      nonceStr,
      signature
    }));
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

// 启动服务
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`服务运行在端口 ${port}`);
});
