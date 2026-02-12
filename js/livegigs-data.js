// LiveGigs Asia - Data Loader with Cache Busting
// 版本: 1.0.2 - 兼容 link 和 url 两种字段格式

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    baseUrl: 'https://emanonent.github.io/asia/content',
    version: '1.0.2',
    cacheBuster: true,
    retryAttempts: 3,
    retryDelay: 1000
  };

  // 获取带缓存清除参数的URL
  function getUrl(path) {
    const timestamp = new Date().getTime();
    const version = CONFIG.version;
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}v=${version}&t=${timestamp}`;
  }

  // 获取页面类型
  function getPageType() {
    const path = window.location.pathname;
    if (path.includes('cn')) return 'cn';
    if (path.includes('events')) return 'events';
    if (path.includes('partners')) return 'partners';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('accessibility')) return 'accessibility';
    return 'index';
  }

  // 加载JSON数据（带重试）
  async function loadJSON(url, attempts = 0) {
    try {
      const finalUrl = CONFIG.cacheBuster ? getUrl(url) : url;
      console.log('[LiveGigsData] Loading:', finalUrl);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[LiveGigsData] Loaded successfully:', url);
      return data;
    } catch (error) {
      console.error(`[LiveGigsData] Error loading ${url}:`, error);

      if (attempts < CONFIG.retryAttempts) {
        console.log(`[LiveGigsData] Retrying... (${attempts + 1}/${CONFIG.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
        return loadJSON(url, attempts + 1);
      }

      return null;
    }
  }

  // 获取社交链接（兼容 link 和 url 字段）
  function getSocialUrl(socialItem) {
    // 优先使用 url 字段，如果不存在则使用 link 字段
    return socialItem.url || socialItem.link || '#';
  }

  // SVG 图标库
  const ICONS = {
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    weibo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.401-.649.386-1.031.425-1.922.008-2.557-.781-1.19-2.924-1.126-5.354-.034 0 0-.768.334-.571-.271.381-1.204.324-2.212-.27-2.793-1.35-1.33-4.945.047-8.028 3.079C1.116 10.641 0 12.792 0 14.667c0 3.589 4.613 5.773 9.127 5.773 5.916 0 9.856-3.44 9.856-6.175 0-1.649-1.389-2.583-2.894-3.016zm2.706-4.562c-.839-.936-2.089-1.27-3.285-1.082-.399.063-.666.433-.604.832.063.399.433.666.832.604.701-.11 1.447.09 1.947.646.5.557.669 1.318.478 2.008-.104.391.128.794.52.898.391.104.794-.128.898-.52.305-1.14.03-2.393-.786-3.386zm2.256-2.234c-1.671-1.863-4.163-2.533-6.548-2.158-.599.094-1.003.654-.909 1.253.094.599.654 1.003 1.253.909 1.68-.264 3.449.229 4.641 1.557 1.191 1.328 1.534 3.117.978 4.738-.185.571.126 1.185.697 1.37.571.185 1.185-.126 1.37-.697.761-2.351.293-5.042-1.482-6.972z"/></svg>',
    xiaohongshu: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    wechat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
    miniprogram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
  };

  // 渲染底部数据
  function renderFooter(data, pageType) {
    if (!data || !data.footer) {
      console.warn('[LiveGigsData] No footer data found');
      return;
    }

    const footer = data.footer;
    console.log('[LiveGigsData] Rendering footer for:', pageType);

    // 更新版权信息
    const copyrightEl = document.querySelector('.copyright, [data-editable="footer-copyright"]');
    if (copyrightEl && footer.copyright) {
      copyrightEl.textContent = footer.copyright;
    }

    // 更新联系信息
    if (footer.contact || footer.email) {
      // 兼容两种格式：footer.contact.email 或 footer.email
      const email = footer.contact?.email || footer.email;
      const phone = footer.contact?.phone || footer.phone;
      const address = footer.contact?.address || footer.address;

      const emailEl = document.querySelector('[data-editable="footer-email"] a, .footer-contact-left a[href^="mailto"]');
      if (emailEl && email) {
        emailEl.href = 'mailto:' + email;
        emailEl.textContent = email;
      }

      const phoneEl = document.querySelector('[data-editable="footer-phone"] a, .footer-contact-left a[href^="tel"]');
      if (phoneEl && phone) {
        phoneEl.href = 'tel:' + phone;
        phoneEl.textContent = phone;
      }

      const addressEl = document.querySelector('[data-editable="footer-address"], .footer-contact-right .contact-item');
      if (addressEl && address) {
        addressEl.innerHTML = address.replace(/\n/g, '<br>');
      }
    }

    // 更新社交链接
    if (footer.social && Array.isArray(footer.social)) {
      const socialContainer = document.getElementById('socialContainer');
      if (socialContainer) {
        // 清空现有社交图标
        socialContainer.innerHTML = '';

        // 添加新的社交图标
        footer.social.forEach((social, index) => {
          const url = getSocialUrl(social);
          const platform = social.platform || 'link';

          if (url && url !== '#') {
            const a = document.createElement('a');
            a.href = url;
            a.className = 'social-icon';
            a.title = social.name || platform;
            a.setAttribute('data-platform', platform);
            a.setAttribute('data-editable', `social-${platform}`);
            a.setAttribute('data-href', url);
            a.target = '_blank';

            // 使用预定义的SVG图标或默认图标
            if (ICONS[platform.toLowerCase()]) {
              a.innerHTML = ICONS[platform.toLowerCase()];
            } else {
              a.textContent = (social.name || platform).charAt(0).toUpperCase();
            }

            socialContainer.appendChild(a);
            console.log(`[LiveGigsData] Added social icon: ${platform} -> ${url}`);
          }
        });
      }
    }

    // 更新制作单位logo
    const producerEl = document.querySelector('.producer-logo, [data-editable="producer-logo"]');
    if (producerEl && footer.producer) {
      producerEl.src = footer.producer;
    }

    console.log('[LiveGigsData] Footer rendered successfully');
  }

  // 主加载函数
  async function loadAndRender(pageType) {
    console.log('[LiveGigsData] Starting load for page:', pageType);

    const pageTypeActual = pageType || getPageType();

    // 确定要加载的JSON文件
    let jsonUrl;
    if (pageTypeActual === 'cn') {
      jsonUrl = `${CONFIG.baseUrl}/footer-cn.json`;
    } else {
      jsonUrl = `${CONFIG.baseUrl}/footer-global.json`;
    }

    // 加载数据
    const data = await loadJSON(jsonUrl);

    if (data) {
      renderFooter(data, pageTypeActual);
    } else {
      console.warn('[LiveGigsData] Failed to load data, using default content');
    }
  }

  // 强制刷新函数
  async function forceRefresh() {
    console.log('[LiveGigsData] Force refreshing...');
    CONFIG.version = new Date().getTime().toString();
    await loadAndRender(getPageType());
    console.log('[LiveGigsData] Refresh complete');
  }

  // 暴露全局API
  window.LiveGigsData = {
    loadAndRender: loadAndRender,
    forceRefresh: forceRefresh,
    getPageType: getPageType,
    config: CONFIG
  };

  // 页面加载完成后自动加载数据
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadAndRender(getPageType());
    });
  } else {
    loadAndRender(getPageType());
  }

  console.log('[LiveGigsData] Initialized v' + CONFIG.version);
})();
