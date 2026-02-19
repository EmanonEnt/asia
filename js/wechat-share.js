// ============================================
// 微信分享配置 - v8.5.7v3
// ============================================

// 部署后替换为你的Vercel API地址
const WX_API_URL = 'https://asia-on8u8wzmz-emanonents-projects.vercel.app/api/wx-config';

// 初始化微信分享
async function initWeChatShare() {
    if (!isWeChatBrowser()) {
        console.log('非微信浏览器，跳过微信分享配置');
        return;
    }
    
    try {
        const currentUrl = encodeURIComponent(window.location.href.split('#')[0]);
        const response = await fetch(`${WX_API_URL}?url=${currentUrl}`);
        const data = await response.json();
        
        if (data.success) {
            wx.config({
                debug: false,
                appId: data.config.appId,
                timestamp: data.config.timestamp,
                nonceStr: data.config.nonceStr,
                signature: data.config.signature,
                jsApiList: [
                    'updateAppMessageShareData',
                    'updateTimelineShareData',
                    'onMenuShareAppMessage',
                    'onMenuShareTimeline'
                ]
            });
            
            wx.ready(function() {
                console.log('微信配置成功');
                setupWeChatShareData();
            });
            
            wx.error(function(res) {
                console.error('微信配置失败:', res);
            });
        }
    } catch (error) {
        console.error('获取微信配置失败:', error);
    }
}

function setupWeChatShareData() {
    const shareData = {
        title: document.title || 'LiveGigs Asia - Events',
        desc: getMetaDescription(),
        link: window.location.href,
        imgUrl: getShareImage(),
        success: function() { console.log('分享成功'); },
        cancel: function() { console.log('分享取消'); }
    };
    
    wx.updateAppMessageShareData(shareData);
    wx.updateTimelineShareData({
        title: shareData.title,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        success: shareData.success,
        cancel: shareData.cancel
    });
    wx.onMenuShareAppMessage(shareData);
    wx.onMenuShareTimeline({
        title: shareData.title,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        success: shareData.success,
        cancel: shareData.cancel
    });
}

function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent);
}

function getMetaDescription() {
    const meta = document.querySelector('meta[name="description"]');
    return meta ? meta.content : 'LiveGigs Asia - Concerts, Festivals, Tickets, Tour Dates';
}

function getShareImage() {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) return ogImage.content;
    return window.location.origin + '/image/webtop.png';
}

document.addEventListener('DOMContentLoaded', initWeChatShare);
