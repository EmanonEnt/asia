// LiveGigs Asia - 数据加载器
// 从 GitHub content 文件夹加载 JSON 数据并渲染到页面

(function() {
    'use strict';

    const CONFIG = {
        // GitHub 原始文件地址前缀
        githubRaw: 'https://raw.githubusercontent.com/EmanonEnt/asia/main/content/',
        // 本地缓存时间（毫秒）
        cacheTime: 60000, // 1分钟
        // 调试模式
        debug: false
    };

    // 数据缓存
    let dataCache = {};
    let lastLoadTime = 0;

    // 调试日志
    function log(...args) {
        if (CONFIG.debug) console.log('[LiveGigs Data]', ...args);
    }

    // 加载 JSON 数据
    async function loadJSON(filename) {
        try {
            // 添加时间戳避免缓存
            const timestamp = Date.now();
            const url = `${CONFIG.githubRaw}${filename}?t=${timestamp}`;

            log('Loading:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            log('Loaded:', filename, data);
            return data;
        } catch (error) {
            console.error('Failed to load', filename, error);
            return null;
        }
    }

    // 初始化加载所有数据
    async function initData() {
        const now = Date.now();
        if (now - lastLoadTime < CONFIG.cacheTime && Object.keys(dataCache).length > 0) {
            log('Using cached data');
            return dataCache;
        }

        log('Loading fresh data...');

        const files = ['banners', 'posters', 'events', 'collaborators', 'footer-global', 'footer-cn'];

        for (const file of files) {
            dataCache[file] = await loadJSON(`${file}.json`);
        }

        lastLoadTime = now;
        return dataCache;
    }

    // 安全获取嵌套属性
    function safeGet(obj, path, defaultValue = '') {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result == null || typeof result !== 'object') return defaultValue;
            result = result[key];
        }
        return result !== undefined && result !== null ? result : defaultValue;
    }

    // 检查值是否有效（非空）
    function isValid(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (typeof value === 'number' && isNaN(value)) return false;
        return true;
    }

    // 处理图片地址（支持本地和远程）
    function processImageUrl(url) {
        if (!url) return '';
        // 如果已经是完整URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // 如果是本地路径，确保以 ./ 开头
        if (!url.startsWith('./') && !url.startsWith('/')) {
            url = './' + url;
        }
        return url;
    }

    // 处理链接地址（支持本地和远程）
    function processLinkUrl(url) {
        if (!url) return '#';
        // 如果已经是完整URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // 如果是本地路径，确保以 ./ 开头
        if (!url.startsWith('./') && !url.startsWith('/')) {
            url = './' + url;
        }
        return url;
    }

    // 渲染 Banner
    function renderBanners(banners) {
        if (!Array.isArray(banners) || banners.length === 0) {
            log('No banners to render');
            return;
        }

        // 查找 banner 容器
        const container = document.querySelector('.banner-slider, .hero-slider, #banner-container');
        if (!container) {
            log('Banner container not found');
            return;
        }

        // 过滤启用的banner并按排序
        const activeBanners = banners
            .filter(b => b.active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (activeBanners.length === 0) return;

        // 生成HTML
        const html = activeBanners.map(banner => {
            const imageUrl = processImageUrl(banner.image);
            const linkUrl = processLinkUrl(banner.link);
            const title = escapeHtml(banner.title || '');
            const buttonText = escapeHtml(banner.button_text || 'View Details →');

            return `
                <div class="banner-slide" style="background-image: url('${imageUrl}');">
                    <div class="banner-content">
                        ${isValid(title) ? `<h2 class="banner-title">${title}</h2>` : ''}
                        ${isValid(banner.button_text) ? `
                            <a href="${linkUrl}" class="banner-btn">${buttonText}</a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        log('Rendered', activeBanners.length, 'banners');
    }

    // 渲染海报区域
    function renderPosters(posters, pageType) {
        if (!posters || !posters[pageType]) {
            log('No posters for page:', pageType);
            return;
        }

        const pagePosters = posters[pageType];

        // 查找海报容器
        for (let i = 0; i < 3; i++) {
            const poster = pagePosters[i] || {};
            const container = document.querySelector(`#poster-${i+1}, .poster-item-${i+1}, [data-poster="${i+1}"]`);

            if (!container) continue;

            const imageUrl = processImageUrl(poster.image);
            const linkUrl = processLinkUrl(poster.link);
            const title = escapeHtml(poster.title || '');
            const linkText = escapeHtml(poster.link_text || 'View Details →');

            // 海报2特殊处理：多图滚播
            if (i === 1 && poster.carousel && Array.isArray(poster.carousel_images) && poster.carousel_images.length > 0) {
                renderCarousel(container, poster);
                continue;
            }

            // 单图海报
            let html = '';

            if (isValid(imageUrl)) {
                html += `<div class="poster-image-wrapper">
                    <img src="${imageUrl}" alt="${title}" class="poster-image" onerror="this.style.display='none'">
                </div>`;
            }

            if (isValid(title)) {
                html += `<h3 class="poster-title">${title}</h3>`;
            }

            if (isValid(poster.link_text) && isValid(poster.link)) {
                html += `<a href="${linkUrl}" class="poster-link">${linkText}</a>`;
            }

            container.innerHTML = html;
        }

        log('Rendered posters for', pageType);
    }

    // 渲染滚播
    function renderCarousel(container, poster) {
        const images = poster.carousel_images || [];
        const title = escapeHtml(poster.title || '');
        const linkText = escapeHtml(poster.link_text || 'View Details →');
        const linkUrl = processLinkUrl(poster.link);

        let html = '<div class="carousel-container">';
        html += '<div class="carousel-track">';

        images.forEach(img => {
            const imgUrl = processImageUrl(img);
            html += `<div class="carousel-slide">
                <img src="${imgUrl}" alt="${title}" onerror="this.style.display='none'">
            </div>`;
        });

        html += '</div>';

        if (isValid(title)) {
            html += `<h3 class="poster-title">${title}</h3>`;
        }

        if (isValid(poster.link_text) && isValid(poster.link)) {
            html += `<a href="${linkUrl}" class="poster-link">${linkText}</a>`;
        }

        html += '</div>';

        container.innerHTML = html;

        // 初始化滚播逻辑
        initCarousel(container.querySelector('.carousel-container'));
    }

    // 初始化滚播
    function initCarousel(container) {
        if (!container) return;

        const track = container.querySelector('.carousel-track');
        const slides = container.querySelectorAll('.carousel-slide');
        if (slides.length <= 1) return;

        let current = 0;

        setInterval(() => {
            current = (current + 1) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
        }, 3000);
    }

    // 渲染活动列表
    function renderEvents(events) {
        if (!Array.isArray(events)) {
            log('Events is not an array');
            return;
        }

        const container = document.querySelector('#events-grid, .events-container, [data-events]');
        if (!container) {
            log('Events container not found');
            return;
        }

        // 存储所有活动数据
        container.dataset.allEvents = JSON.stringify(events);

        // 初始显示3个
        const initialCount = 3;
        const visibleEvents = events.slice(0, initialCount);

        renderEventGrid(container, visibleEvents);

        // 如果活动数量 > 3，显示 Load More 按钮
        if (events.length > initialCount) {
            addLoadMoreButton(container, events, initialCount);
        }

        log('Rendered', visibleEvents.length, 'of', events.length, 'events');
    }

    // 渲染活动网格
    function renderEventGrid(container, events) {
        const html = events.map(event => {
            const imageUrl = processImageUrl(event.image);
            const linkUrl = processLinkUrl(event.link);

            // 构建活动卡片 - 只显示有值的字段
            let fieldsHtml = '';

            if (isValid(event.date)) {
                fieldsHtml += `<div class="event-date">${escapeHtml(event.date)}</div>`;
            }
            if (isValid(event.location)) {
                fieldsHtml += `<div class="event-location">${escapeHtml(event.location)}</div>`;
            }
            if (isValid(event.time)) {
                fieldsHtml += `<div class="event-time">${escapeHtml(event.time)}</div>`;
            }
            if (isValid(event.ticket)) {
                fieldsHtml += `<div class="event-ticket">${escapeHtml(event.ticket)}</div>`;
            }
            if (isValid(event.description)) {
                fieldsHtml += `<div class="event-desc">${escapeHtml(event.description)}</div>`;
            }

            // 状态标签
            let statusHtml = '';
            if (event.status === 'ontour') {
                statusHtml = '<span class="event-status ontour">ON TOUR</span>';
            } else if (event.status === 'soldout') {
                statusHtml = '<span class="event-status soldout">SOLD OUT</span>';
            }

            // 按钮
            let buttonHtml = '';
            if (isValid(event.button_text) && isValid(event.link)) {
                buttonHtml = `<a href="${linkUrl}" class="event-btn">${escapeHtml(event.button_text)}</a>`;
            }

            return `
                <div class="event-card">
                    <div class="event-image-wrapper">
                        <img src="${imageUrl}" alt="${escapeHtml(event.title || '')}" class="event-image" onerror="this.src='./image/placeholder.jpg'">
                        ${statusHtml}
                    </div>
                    <div class="event-info">
                        ${isValid(event.title) ? `<h3 class="event-title">${escapeHtml(event.title)}</h3>` : ''}
                        ${fieldsHtml}
                        ${buttonHtml}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // 添加 Load More 按钮
    function addLoadMoreButton(container, allEvents, initialCount) {
        // 检查是否已存在按钮
        let btn = container.parentNode.querySelector('.load-more-btn');
        if (btn) btn.remove();

        btn = document.createElement('button');
        btn.className = 'load-more-btn';
        btn.textContent = 'Load More';
        btn.style.cssText = `
            display: block;
            margin: 30px auto;
            padding: 12px 40px;
            background: #8b0000;
            color: #fff;
            border: none;
            cursor: pointer;
            font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
            font-size: 16px;
            text-transform: uppercase;
        `;

        let currentCount = initialCount;
        const increment = 3;

        btn.addEventListener('click', () => {
            currentCount += increment;
            const visibleEvents = allEvents.slice(0, currentCount);
            renderEventGrid(container, visibleEvents);

            // 如果没有更多活动，隐藏按钮
            if (currentCount >= allEvents.length) {
                btn.style.display = 'none';
            }
        });

        container.parentNode.appendChild(btn);
    }

    // 渲染合作伙伴
    function renderCollaborators(collaborators) {
        if (!Array.isArray(collaborators) || collaborators.length === 0) {
            log('No collaborators to render');
            return;
        }

        const container = document.querySelector('#collaborators-grid, .collaborators-container');
        if (!container) {
            log('Collaborators container not found');
            return;
        }

        const html = collaborators.map(item => {
            const logoUrl = processImageUrl(item.logo || item);
            const linkUrl = item.link ? processLinkUrl(item.link) : null;

            const imgHtml = `<img src="${logoUrl}" alt="Partner" class="collab-logo" 
                style="width: 180px; height: 110px; object-fit: contain;" 
                onerror="this.style.display='none'">`;

            if (linkUrl) {
                return `<a href="${linkUrl}" class="collab-item" target="_blank" rel="noopener">${imgHtml}</a>`;
            } else {
                return `<div class="collab-item">${imgHtml}</div>`;
            }
        }).join('');

        container.innerHTML = html;
        log('Rendered', collaborators.length, 'collaborators');
    }

    // 渲染底部
    function renderFooter(footerData, isCN = false) {
        if (!footerData) {
            log('No footer data');
            return;
        }

        const container = document.querySelector('footer, .footer, #footer');
        if (!container) {
            log('Footer container not found');
            return;
        }

        // 版权文字
        const copyrightEl = container.querySelector('.copyright, .footer-copyright');
        if (copyrightEl && isValid(footerData.copyright)) {
            copyrightEl.textContent = footerData.copyright;
        }

        // 社交链接
        const socialContainer = container.querySelector('.social-links, .footer-social');
        if (socialContainer && Array.isArray(footerData.social)) {
            const socialHtml = footerData.social.map(social => {
                const url = processLinkUrl(social.url);
                return `<a href="${url}" class="social-link" target="_blank" rel="noopener">
                    <span class="social-icon">${social.icon || social.name}</span>
                </a>`;
            }).join('');
            socialContainer.innerHTML = socialHtml;
        }

        // 制作单位Logo
        const producerEl = container.querySelector('.producer-logo, .footer-producer img');
        if (producerEl && isValid(footerData.producer)) {
            const logoUrl = processImageUrl(footerData.producer);
            producerEl.src = logoUrl;
        }

        log('Rendered footer');
    }

    // HTML转义
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 主初始化函数
    async function init() {
        log('Initializing LiveGigs Data Loader...');

        const data = await initData();

        // 根据页面类型渲染不同内容
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '') || 'index';

        // 渲染 Banner（所有页面）
        if (data.banners) {
            renderBanners(data.banners);
        }

        // 渲染海报
        if (data.posters) {
            let pageType = 'index';
            if (pageName === 'cn' || pageName === 'livegigscn') pageType = 'cn';
            else if (pageName === 'events') pageType = 'events';
            renderPosters(data.posters, pageType);
        }

        // 渲染活动（events页面）
        if (pageName === 'events' && data.events) {
            renderEvents(data.events);
        }

        // 渲染合作伙伴（partners页面）
        if (pageName === 'partners' && data.collaborators) {
            renderCollaborators(data.collaborators);
        }

        // 渲染底部
        const isCN = pageName === 'cn' || pageName === 'livegigscn';
        const footerData = isCN ? data['footer-cn'] : data['footer-global'];
        if (footerData) {
            renderFooter(footerData, isCN);
        }

        log('Initialization complete');
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露全局接口
    window.LiveGigsData = {
        refresh: init,
        getData: () => dataCache,
        clearCache: () => { lastLoadTime = 0; }
    };

})();