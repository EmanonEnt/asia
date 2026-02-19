const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const appId = process.env.APPID;
  const appSecret = process.env.APPSECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  try {
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    const tokenData = await tokenRes.json();
    
    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get access_token', details: tokenData });
    }

    const ticketRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${tokenData.access_token}&type=jsapi`
    );
    const ticketData = await ticketRes.json();
    
    if (!ticketData.ticket) {
      return res.status(500).json({ error: 'Failed to get ticket', details: ticketData });
    }

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
