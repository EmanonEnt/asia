// LiveGigs Asia - Data Loader with Cache Busting
// 版本: 1.0.1 - 添加缓存清除功能

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    baseUrl: 'https://emanonent.github.io/asia/content',
    version: '1.0.1', // 每次更新数据时递增此版本号
    cacheBuster: true, // 启用缓存清除
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

  // 更新元素内容
  function updateElement(element, value, type) {
    if (!element) return;

    try {
      switch(type) {
        case 'src':
          element.src = value;
          break;
        case 'href':
          element.href = value;
          break;
        case 'text':
        default:
          element.textContent = value;
      }
      console.log('[LiveGigsData] Updated:', element.getAttribute('data-editable'), '->', value);
    } catch (e) {
      console.error('[LiveGigsData] Error updating element:', e);
    }
  }

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
    if (footer.contact) {
      const emailEl = document.querySelector('[data-editable="footer-email"] a, .footer-contact-left a[href^="mailto"]');
      if (emailEl && footer.contact.email) {
        emailEl.href = 'mailto:' + footer.contact.email;
        emailEl.textContent = footer.contact.email;
      }

      const phoneEl = document.querySelector('[data-editable="footer-phone"] a, .footer-contact-left a[href^="tel"]');
      if (phoneEl && footer.contact.phone) {
        phoneEl.href = 'tel:' + footer.contact.phone;
        phoneEl.textContent = footer.contact.phone;
      }

      const addressEl = document.querySelector('[data-editable="footer-address"], .footer-contact-right .contact-item');
      if (addressEl && footer.contact.address) {
        addressEl.innerHTML = footer.contact.address.replace(/\n/g, '<br>');
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
          if (social.url && social.platform) {
            const a = document.createElement('a');
            a.href = social.url;
            a.className = 'social-icon';
            a.title = social.platform;
            a.setAttribute('data-platform', social.platform);
            a.setAttribute('data-editable', `social-${social.platform}`);
            a.setAttribute('data-href', social.url);

            // 使用SVG图标或文字
            if (social.icon) {
              a.innerHTML = social.icon;
            } else {
              a.textContent = social.platform.charAt(0).toUpperCase();
            }

            socialContainer.appendChild(a);
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

  // 强制刷新函数（清除缓存并重新加载）
  async function forceRefresh() {
    console.log('[LiveGigsData] Force refreshing...');

    // 递增版本号
    CONFIG.version = new Date().getTime().toString();

    // 重新加载
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
    // DOM已经加载完成
    loadAndRender(getPageType());
  }

  console.log('[LiveGigsData] Initialized v' + CONFIG.version);
})();
