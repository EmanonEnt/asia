// api/wx-config.js
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  const appId = process.env.WECHAT_APPID;
  const appSecret = process.env.WECHAT_APPSECRET;
  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'WeChat credentials not set' });
  }

  try {
    // 获取 access_token
    const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
    const tokenData = await tokenRes.json();
    if (tokenData.errcode) throw new Error(tokenData.errmsg);
    const accessToken = tokenData.access_token;

    // 获取 jsapi_ticket
    const ticketRes = await fetch(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`);
    const ticketData = await ticketRes.json();
    if (ticketData.errcode) throw new Error(ticketData.errmsg);
    const jsapiTicket = ticketData.ticket;

    // 生成签名
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`)
      .digest('hex');

    res.json({ appId, timestamp, nonceStr, signature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
