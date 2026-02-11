// LiveGigs Data Loader - 修复版 v2.0
(function() {
    'use strict';

    // 数据缓存
    let dataCache = {};

    // 安全获取文本
    function safeText(obj, key, defaultValue) {
        if (!obj || typeof obj !== 'object') return defaultValue;
        const value = obj[key];
        if (value === undefined || value === null || value === '') return defaultValue;
        return String(value);
    }

    // 安全获取数组
    function safeArray(obj, key) {
        if (!obj || typeof obj !== 'object') return [];
        const value = obj[key];
        if (!Array.isArray(value)) return [];
        return value.filter(item => item !== null && item !== undefined);
    }

    // 加载 JSON
    async function loadJSON(filename) {
        try {
            const response = await fetch('./content/' + filename + '.json?v=' + Date.now());
            if (!response.ok) throw new Error('Not found');
            return await response.json();
        } catch (e) {
            console.warn('Failed to load ' + filename + ':', e);
            return null;
        }
    }

    // 渲染底部 - 修复版
    async function renderFooter() {
        const isCN = window.location.pathname.includes('cn') || window.location.href.includes('cn.html');
        const filename = isCN ? 'footer-cn' : 'footer-global';

        const data = await loadJSON(filename);
        if (!data) return;

        // 查找底部区域
        const footer = document.querySelector('.footer') || document.querySelector('footer') || document.querySelector('#footer');
        if (!footer) return;

        // 更新版权文字
        const copyrightEl = footer.querySelector('.footer-copyright') || footer.querySelector('.copyright') || footer.querySelector('[data-field="copyright"]');
        if (copyrightEl) {
            copyrightEl.textContent = safeText(data, 'copyright', '© 2025 LIVEGIGS ASIA. ALL RIGHTS RESERVED.');
        }

        // 更新社交链接
        const socialContainer = footer.querySelector('.footer-social') || footer.querySelector('.social-links') || footer.querySelector('[data-field="social"]');
        if (socialContainer && data.socialLinks) {
            const links = safeArray(data, 'socialLinks');
            let html = '';

            links.forEach(function(link) {
                if (!link || !link.url) return;
                const icon = safeText(link, 'icon', 'globe');
                const url = safeText(link, 'url', '#');
                const title = safeText(link, 'title', '');

                // Font Awesome 图标映射
                let iconClass = 'fas fa-globe';
                if (icon.includes('facebook') || icon === 'fb') iconClass = 'fab fa-facebook-f';
                else if (icon.includes('instagram') || icon === 'ig') iconClass = 'fab fa-instagram';
                else if (icon.includes('youtube') || icon === 'yt') iconClass = 'fab fa-youtube';
                else if (icon.includes('twitter') || icon === 'x') iconClass = 'fab fa-twitter';
                else if (icon.includes('weibo') || icon === 'wb') iconClass = 'fab fa-weibo';
                else if (icon.includes('wechat') || icon === 'wx') iconClass = 'fab fa-weixin';
                else if (icon.includes('tiktok')) iconClass = 'fab fa-tiktok';

                html += '<a href="' + url + '" class="social-icon" target="_blank" title="' + title + '"><i class="' + iconClass + '"></i></a>';
            });

            if (html) {
                socialContainer.innerHTML = html;
            }
        }
    }

    // 渲染 Banner
    async function renderBanners() {
        const data = await loadJSON('banners');
        if (!data || !data.banners) return;

        const banners = safeArray(data, 'banners');
        const container = document.querySelector('.hero-slider') || document.querySelector('.banner-container') || document.querySelector('[data-section="banners"]');
        if (!container) return;

        container.innerHTML = '';

        banners.forEach(function(banner, index) {
            if (!banner) return;
            const image = safeText(banner, 'image', '');
            const title = safeText(banner, 'title', '');
            const buttonText = safeText(banner, 'buttonText', 'VIEW DETAILS');
            const link = safeText(banner, 'link', '#');

            if (!image) return;

            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            slide.innerHTML = '<img src="' + image + '" alt="' + title + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '">' +
                '<div class="hero-content">' +
                (title ? '<h2>' + title + '</h2>' : '') +
                '<a href="' + link + '" class="btn-primary">' + buttonText + '</a>' +
                '</div>';
            container.appendChild(slide);
        });

        if (window.initSlider) window.initSlider();
    }

    // 渲染海报
    async function renderPosters() {
        const page = window.location.pathname;
        let filename = 'index-posters';
        if (page.includes('cn')) filename = 'cn-posters';
        else if (page.includes('events')) filename = 'events-posters';

        const data = await loadJSON(filename);
        if (!data || !data.posters) return;

        const posters = safeArray(data, 'posters');
        const containers = document.querySelectorAll('.poster-item, .poster-card, [data-section="poster"]');

        containers.forEach(function(container, index) {
            const poster = posters[index];
            if (!poster) return;

            const image = safeText(poster, 'image', '');
            const title = safeText(poster, 'title', '');
            const linkText = safeText(poster, 'linkText', 'View Details →');
            const link = safeText(poster, 'link', '#');

            if (image) {
                const imgEl = container.querySelector('img');
                if (imgEl) imgEl.src = image;
            }

            if (title) {
                const titleEl = container.querySelector('.poster-title, h3, [data-field="title"]');
                if (titleEl) titleEl.textContent = title;
            }

            const linkEl = container.querySelector('a');
            if (linkEl) {
                linkEl.href = link;
                const linkTextEl = linkEl.querySelector('.link-text') || linkEl;
                if (linkText) linkTextEl.textContent = linkText;
            }
        });
    }

    // 渲染 Events
    async function renderEvents() {
        const data = await loadJSON('events-managed');
        if (!data || !data.events) return;

        const events = safeArray(data, 'events');
        const container = document.querySelector('.events-grid') || document.querySelector('.events-container') || document.querySelector('[data-section="events"]');
        if (!container) return;

        const displayEvents = events.slice(0, 6);
        const hasMore = events.length > 6;

        let html = '';
        displayEvents.forEach(function(event) {
            if (!event) return;

            const image = safeText(event, 'image', './image/placeholder.jpg');
            const title = safeText(event, 'title', 'Untitled Event');
            const date = safeText(event, 'date', '');
            const venue = safeText(event, 'venue', '');
            const time = safeText(event, 'time', '');
            const ticket = safeText(event, 'ticket', '');
            const onTour = event.onTour === true || event.onTour === 'true';
            const soldOut = event.soldOut === true || event.soldOut === 'true';
            const description = safeText(event, 'description', '');
            const buttonText = safeText(event, 'buttonText', 'BUY TICKETS');
            const link = safeText(event, 'link', '#');

            let tags = '';
            if (onTour) tags += '<span class="tag on-tour">ON TOUR</span>';
            if (soldOut) tags += '<span class="tag sold-out">SOLD OUT</span>';

            let details = [];
            if (date) details.push('<span class="date">' + date + '</span>');
            if (venue) details.push('<span class="venue">' + venue + '</span>');
            if (time) details.push('<span class="time">' + time + '</span>');
            if (ticket) details.push('<span class="ticket">' + ticket + '</span>');

            html += '<div class="event-card">' +
                '<div class="event-image">' +
                '<img src="' + image + '" alt="' + title + '" loading="lazy">' +
                (tags ? '<div class="event-tags">' + tags + '</div>' : '') +
                '</div>' +
                '<div class="event-info">' +
                '<h3 class="event-title">' + title + '</h3>' +
                (details.length ? '<div class="event-details">' + details.join(' | ') + '</div>' : '') +
                (description ? '<p class="event-desc">' + description + '</p>' : '') +
                '<a href="' + link + '" class="btn-event" target="_blank">' + buttonText + '</a>' +
                '</div></div>';
        });

        if (hasMore) {
            html += '<div class="load-more-container"><button class="btn-load-more" onclick="loadMoreEvents()">LOAD MORE</button></div>';
        }

        container.innerHTML = html;
    }

    // 初始化
    async function init() {
        console.log('[LiveGigs] Loading data...');
        await Promise.all([
            renderFooter(),
            renderBanners(),
            renderPosters(),
            renderEvents()
        ]);
        console.log('[LiveGigs] Data loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.LiveGigsData = { refresh: init };
})();
