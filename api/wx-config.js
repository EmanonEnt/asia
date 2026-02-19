const crypto = require('crypto');

module.exports = async (req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const appId = process.env.wx019d141a63482cd8;
  const appSecret = process.env.180374121eb3edf8a8070891be064ed4;

  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  try {
    // 获取 access_token
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    const tokenData = await tokenRes.json();
    
    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get access_token', details: tokenData });
    }

    // 获取 jsapi_ticket
    const ticketRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${tokenData.access_token}&type=jsapi`
    );
    const ticketData = await ticketRes.json();
    
    if (!ticketData.ticket) {
      return res.status(500).json({ error: 'Failed to get ticket', details: ticketData });
    }

    // 生成签名
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const timestamp = Math.floor(Date.now() / 1000);
    const ticket = ticketData.ticket;
    
    const string1 = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${decodeURIComponent(url)}`;
    const signature = crypto.createHash('sha1').update(string1).digest('hex');

    res.json({
      appId,
      timestamp,
      nonceStr,
      signature
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
