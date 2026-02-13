/**
 * LiveGigs Asia - Data Loader
 * 自动根据页面类型加载对应的数据
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        dataPath: './content/',
        version: new Date().getTime(), // 防止缓存
        debug: true
    };

    // 页面类型检测
    function detectPageType() {
        const path = window.location.pathname;
        const htmlName = path.split('/').pop() || 'index.html';

        if (htmlName === 'cn.html' || path.includes('/cn')) {
            return 'cn';
        } else if (htmlName === 'events.html') {
            return 'events';
        } else if (htmlName === 'partners.html') {
            return 'partners';
        } else if (htmlName === 'privacypolicy.html') {
            return 'privacy';
        } else if (htmlName === 'accessibilitystatement.html') {
            return 'accessibility';
        } else {
            return 'index';
        }
    }

    // 日志
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[LiveGigsData]', ...args);
        }
    }

    // 加载JSON
    async function loadJSON(filename) {
        try {
            const url = CONFIG.dataPath + filename + '?v=' + CONFIG.version;
            log('Loading:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return await response.json();
        } catch (error) {
            log('Error loading', filename, error);
            return null;
        }
    }

    // 渲染Banner
    function renderBanners(data) {
        if (!data || !data.banners) return;

        const container = document.getElementById('banner-container');
        if (!container) return;

        // 清空现有内容
        container.innerHTML = '';

        data.banners.forEach((banner, index) => {
            if (!banner.image) return;

            const slide = document.createElement('div');
            slide.className = 'banner-slide' + (index === 0 ? ' active' : '');
            slide.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: ${index === 0 ? '1' : '0'};
                transition: opacity 0.8s ease;
                background: url('${banner.image}') center/cover no-repeat;
            `;

            // 标题
            if (banner.title) {
                const title = document.createElement('div');
                title.className = 'banner-title';
                title.innerHTML = banner.title;
                slide.appendChild(title);
            }

            // 按钮
            if (banner.buttonText && banner.buttonLink) {
                const btn = document.createElement('a');
                btn.className = 'banner-btn';
                btn.href = banner.buttonLink;
                btn.target = '_blank';
                btn.textContent = banner.buttonText;
                slide.appendChild(btn);
            }

            container.appendChild(slide);
        });

        // 启动轮播
        if (data.banners.length > 1) {
            startBannerRotation(container, data.banners.length);
        }
    }

    // Banner轮播
    function startBannerRotation(container, count) {
        let current = 0;
        const slides = container.querySelectorAll('.banner-slide');

        setInterval(() => {
            slides[current].style.opacity = '0';
            slides[current].classList.remove('active');

            current = (current + 1) % count;

            slides[current].style.opacity = '1';
            slides[current].classList.add('active');
        }, 5000);
    }

    // 渲染海报区域
    function renderPosters(data, pageType) {
        if (!data || !data.posters) return;

        // 海报1
        const poster1 = document.getElementById('poster1-container');
        if (poster1 && data.posters[0]) {
            renderSinglePoster(poster1, data.posters[0]);
        }

        // 海报2（支持轮播）
        const poster2 = document.getElementById('poster2-container');
        if (poster2 && data.posters[1]) {
            if (data.posters[1].carousel && data.posters[1].carousel.length > 0) {
                renderCarouselPoster(poster2, data.posters[1]);
            } else {
                renderSinglePoster(poster2, data.posters[1]);
            }
        }

        // 海报3
        const poster3 = document.getElementById('poster3-container');
        if (poster3 && data.posters[2]) {
            renderSinglePoster(poster3, data.posters[2]);
        }
    }

    // 渲染单个海报
    function renderSinglePoster(container, poster) {
        if (!poster || !poster.image) return;

        container.innerHTML = `
            <div class="poster-item" style="position: relative; width: 100%; height: 100%;">
                <img src="${poster.image}" alt="${poster.title || ''}" style="width: 100%; height: 100%; object-fit: cover;">
                ${poster.title ? `<div class="poster-title">${poster.title}</div>` : ''}
                ${poster.buttonText && poster.buttonLink ? `
                    <a href="${poster.buttonLink}" target="_blank" class="poster-btn">${poster.buttonText}</a>
                ` : ''}
            </div>
        `;
    }

    // 渲染轮播海报（海报2）
    function renderCarouselPoster(container, poster) {
        if (!poster.carousel || poster.carousel.length === 0) return;

        let currentIndex = 0;
        const items = poster.carousel;

        function showItem(index) {
            const item = items[index];
            container.innerHTML = `
                <div class="poster-carousel-item" style="position: relative; width: 100%; height: 100%; animation: fadeIn 0.5s;">
                    <img src="${item.image}" alt="${item.title || ''}" style="width: 100%; height: 100%; object-fit: cover;">
                    ${item.title ? `<div class="poster-title">${item.title}</div>` : ''}
                    ${item.buttonText && item.link ? `
                        <a href="${item.link}" target="_blank" class="poster-btn">${item.buttonText}</a>
                    ` : ''}
                </div>
            `;
        }

        // 显示第一个
        showItem(0);

        // 自动轮播
        if (items.length > 1) {
            setInterval(() => {
                currentIndex = (currentIndex + 1) % items.length;
                showItem(currentIndex);
            }, 4000);
        }

        // 点击切换
        container.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            showItem(currentIndex);
        });
    }

    // 渲染底部区域 - 关键修复：CN页面使用独立配置
    function renderFooter(data, pageType) {
        if (!data) return;

        log('Rendering footer for page type:', pageType);

        // 站点名称和副标题
        const siteName = document.getElementById('footer-site-name');
        const siteSub = document.getElementById('footer-site-sub');

        if (siteName) {
            siteName.textContent = data.siteName || 'LIVEGIGS';
        }
        if (siteSub) {
            siteSub.textContent = data.siteSub || (pageType === 'cn' ? 'CN' : 'ASIA');
        }

        // 联系信息
        const contactText = document.getElementById('footer-contact-text');
        const email = document.getElementById('footer-email');
        const phone = document.getElementById('footer-phone');
        const address = document.getElementById('footer-address');

        if (contactText) contactText.textContent = data.contactText || '';

        if (email) {
            if (data.email) {
                email.innerHTML = `<a href="mailto:${data.email}" style="color: inherit; text-decoration: none;">${data.email}</a>`;
            } else {
                email.textContent = '';
            }
        }

        if (phone) {
            if (data.phone) {
                phone.innerHTML = `<a href="tel:${data.phone}" style="color: inherit; text-decoration: none;">${data.phone}</a>`;
            } else {
                phone.textContent = '';
            }
        }

        if (address) {
            address.innerHTML = data.address ? data.address.replace(/\n/g, '<br>') : '';
        }

        // 社交媒体 - 关键修复
        renderSocialIcons(data.social, pageType);

        // 版权文字
        const copyright = document.querySelector('.copyright, #footer-copyright');
        if (copyright && data.copyright) {
            copyright.textContent = data.copyright;
        }

        // 制作单位Logo
        const producer = document.querySelector('.producer-logo, #footer-producer');
        if (producer && data.producerLogo) {
            producer.innerHTML = `<img src="${data.producerLogo}" alt="EMANON" style="height: 100%; width: auto;">`;
        }
    }

    // 渲染社交媒体图标 - 关键修复
    function renderSocialIcons(socialData, pageType) {
        const container = document.getElementById('socialContainer') || document.getElementById('footer-social');
        if (!container || !socialData) return;

        container.innerHTML = '';

        socialData.forEach(item => {
            if (!item.icon) return;

            const iconDiv = document.createElement('div');
            iconDiv.className = 'social-icon';
            iconDiv.style.cssText = `
                width: 44px;
                height: 44px;
                background: #050505;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                cursor: ${item.link ? 'pointer' : 'default'};
                overflow: hidden;
            `;

            // 获取图标URL
            const iconUrl = getSocialIconUrl(item.icon);

            if (item.link) {
                iconDiv.innerHTML = `
                    <a href="${item.link}" target="_blank" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                        <img src="${iconUrl}" alt="${item.name || ''}" style="width: 22px; height: 22px; object-fit: contain;" 
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23c0c0c0%22><text x=%2212%22 y=%2216%22 text-anchor=%22middle%22 font-size=%2212%22>?</text></svg>'">
                    </a>
                `;
            } else {
                iconDiv.innerHTML = `
                    <img src="${iconUrl}" alt="${item.name || ''}" style="width: 22px; height: 22px; object-fit: contain; opacity: 0.7;"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23c0c0c0%22><text x=%2212%22 y=%2216%22 text-anchor=%22middle%22 font-size=%2212%22>?</text></svg>'">
                `;
            }

            container.appendChild(iconDiv);
        });
    }

    // 获取社交媒体图标URL
    function getSocialIconUrl(iconName) {
        const iconMap = {
            'facebook': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg',
            'instagram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
            'youtube': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg',
            'x': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg',
            'twitter': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
            'weibo': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sinaweibo.svg',
            'wechat': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/wechat.svg',
            'xiaohongshu': './image/icon-xiaohongshu.svg',
            'miniprogram': './image/icon-miniprogram.svg'
        };

        return iconMap[iconName.toLowerCase()] || iconName;
    }

    // 主加载函数
    async function loadAndRender(pageType) {
        const type = pageType || detectPageType();
        log('Page type detected:', type);

        // 加载数据
        const promises = [];

        // Banner（index和cn共用）
        if (type === 'index' || type === 'cn') {
            promises.push(loadJSON('banners.json').then(data => {
                if (data) renderBanners(data);
                return data;
            }));
        }

        // 海报
        if (type === 'index' || type === 'cn' || type === 'events') {
            const posterFile = type === 'cn' ? 'cn-posters.json' : 
                              type === 'events' ? 'events-posters.json' : 'index-posters.json';
            promises.push(loadJSON(posterFile).then(data => {
                if (data) renderPosters(data, type);
                return data;
            }));
        }

        // 底部 - 关键：CN使用独立配置
        const footerFile = type === 'cn' ? 'footer-cn.json' : 'footer-global.json';
        promises.push(loadJSON(footerFile).then(data => {
            if (data) renderFooter(data, type);
            return data;
        }));

        await Promise.all(promises);
        log('All data loaded for type:', type);
    }

    // 暴露全局接口
    window.LiveGigsData = {
        loadAndRender: loadAndRender,
        detectPageType: detectPageType,
        refresh: function() {
            CONFIG.version = new Date().getTime();
            return loadAndRender();
        }
    };

    // DOM加载完成后自动执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadAndRender());
    } else {
        loadAndRender();
    }

})();
