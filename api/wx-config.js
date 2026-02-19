// api/wx-config.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: '缺少url参数' });
  }

  const APPID = process.env.APPID;
  const APPSECRET = process.env.APPSECRET;

  if (!APPID || !APPSECRET) {
    return res.status(500).json({ success: false, message: '未配置APPID或APPSECRET' });
  }

  try {
    // 1. 获取access_token
    const tokenRes = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      return res.status(500).json({ success: false, message: '获取access_token失败', error: tokenData });
    }

    // 2. 获取jsapi_ticket
    const ticketRes = await fetch(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${access_token}`);
    const ticketData = await ticketRes.json();
    const jsapi_ticket = ticketData.ticket;

    if (!jsapi_ticket) {
      return res.status(500).json({ success: false, message: '获取jsapi_ticket失败', error: ticketData });
    }

    // 3. 生成签名
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const string1 = `jsapi_ticket=${jsapi_ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    
    // 这里需要引入crypto库来生成sha1签名
    const crypto = require('crypto');
    const signature = crypto.createHash('sha1').update(string1).digest('hex');

    // 4. 返回配置信息
    res.status(200).json({
      success: true,
      config: {
        appId: APPID,
        timestamp,
        nonceStr,
        signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareTimeline',
          'onMenuShareAppMessage'
        ]
      }
    });
  } catch (error) {
    console.error('微信配置错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
}
