// LiveGigs Asia - Data Loader v3
// 兼容现有网站结构，自动渲染数据

(function() {
    'use strict';

    const CONFIG = {
        githubRaw: 'https://raw.githubusercontent.com/EmanonEnt/asia/main/content/',
        cacheTime: 30000
    };

    // 检查值是否有效
    function hasValue(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
    }

    // 处理URL
    function processUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (!url.startsWith('./') && !url.startsWith('/')) url = './' + url;
        return url;
    }

    // HTML转义
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 加载JSON
    async function loadJSON(filename) {
        try {
            const version = localStorage.getItem('lg_data_version') || Date.now();
            const url = `${CONFIG.githubRaw}${filename}?v=${version}&t=${Date.now()}`;
            const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to load', filename, error);
            return null;
        }
    }

    // 渲染Banner
    function renderBanners(banners) {
        if (!Array.isArray(banners)) return;

        const container = document.querySelector('.banner-slider, .hero-slider, #hero-slider');
        if (!container) return;

        const activeBanners = banners.filter(b => b.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
        if (activeBanners.length === 0) return;

        const html = activeBanners.map(banner => {
            const imageUrl = processUrl(banner.image);
            const linkUrl = processUrl(banner.link);
            const title = banner.title || '';
            const buttonText = banner.button_text || '';

            let contentHtml = '';
            if (hasValue(title)) contentHtml += `<h2 class="banner-title">${escapeHtml(title)}</h2>`;
            if (hasValue(buttonText) && linkUrl) contentHtml += `<a href="${linkUrl}" class="banner-btn">${escapeHtml(buttonText)}</a>`;

            if (!hasValue(imageUrl)) return '';

            return `<div class="banner-slide" style="background-image: url('${imageUrl}');">${contentHtml ? `<div class="banner-content">${contentHtml}</div>` : ''}</div>`;
        }).join('');

        if (html) container.innerHTML = html;
    }

    // 渲染海报
    function renderPosters(posters, pageType) {
        if (!posters || !posters[pageType]) return;

        const pagePosters = posters[pageType];

        for (let i = 0; i < 3; i++) {
            const poster = pagePosters[i] || {};
            const container = document.querySelector(`#poster-${i+1}, .poster-item-${i+1}, [data-poster="${i+1}"]`);
            if (!container) continue;

            const imageUrl = processUrl(poster.image);
            const linkUrl = processUrl(poster.link);
            const title = poster.title || '';
            const linkText = poster.link_text || '';

            let html = '';
            if (hasValue(imageUrl)) html += `<div class="poster-image-wrapper"><img src="${imageUrl}" alt="${escapeHtml(title)}" class="poster-image"></div>`;
            if (hasValue(title)) html += `<h3 class="poster-title">${escapeHtml(title)}</h3>`;
            if (hasValue(linkText) && linkUrl) html += `<a href="${linkUrl}" class="poster-link">${escapeHtml(linkText)}</a>`;

            container.innerHTML = html;
        }
    }

    // 渲染活动
    function renderEvents(events) {
        if (!Array.isArray(events)) return;

        const container = document.querySelector('#events-grid, .events-container, .events-grid');
        if (!container) return;

        window.allEventsData = events;
        const initialCount = 3;
        const visibleEvents = events.slice(0, initialCount);

        renderEventGrid(container, visibleEvents);

        if (events.length > 3) addLoadMoreButton(container, events, initialCount);
    }

    function renderEventGrid(container, events) {
        const html = events.map(event => {
            const imageUrl = processUrl(event.image);
            const linkUrl = processUrl(event.link);

            let fieldsHtml = '';
            if (hasValue(event.date)) fieldsHtml += `<div class="event-date">${escapeHtml(event.date)}</div>`;
            if (hasValue(event.location)) fieldsHtml += `<div class="event-location">${escapeHtml(event.location)}</div>`;
            if (hasValue(event.time)) fieldsHtml += `<div class="event-time">${escapeHtml(event.time)}</div>`;
            if (hasValue(event.ticket)) fieldsHtml += `<div class="event-ticket">${escapeHtml(event.ticket)}</div>`;
            if (hasValue(event.description)) fieldsHtml += `<div class="event-desc">${escapeHtml(event.description)}</div>`;

            let statusHtml = '';
            if (event.status === 'ontour') statusHtml = '<span class="event-status ontour">ON TOUR</span>';
            else if (event.status === 'soldout') statusHtml = '<span class="event-status soldout">SOLD OUT</span>';

            let buttonHtml = '';
            if (hasValue(event.button_text) && linkUrl) buttonHtml = `<a href="${linkUrl}" class="event-btn">${escapeHtml(event.button_text)}</a>`;

            let imageHtml = '';
            if (hasValue(imageUrl)) imageHtml = `<div class="event-image-wrapper"><img src="${imageUrl}" alt="${escapeHtml(event.title || '')}" class="event-image">${statusHtml}</div>`;

            let titleHtml = '';
            if (hasValue(event.title)) titleHtml = `<h3 class="event-title">${escapeHtml(event.title)}</h3>`;

            return `<div class="event-card">${imageHtml}<div class="event-info">${titleHtml}${fieldsHtml}${buttonHtml}</div></div>`;
        }).join('');

        container.innerHTML = html;
    }

    function addLoadMoreButton(container, allEvents, initialCount) {
        let btn = container.parentNode.querySelector('.load-more-btn');
        if (btn) btn.remove();

        btn = document.createElement('button');
        btn.className = 'load-more-btn';
        btn.textContent = 'Load More';
        btn.style.cssText = 'display: block; margin: 30px auto; padding: 12px 40px; background: #8b0000; color: #fff; border: none; cursor: pointer; font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif; font-size: 16px; text-transform: uppercase;';

        let currentCount = initialCount;
        btn.addEventListener('click', () => {
            currentCount += 3;
            const visibleEvents = allEvents.slice(0, currentCount);
            renderEventGrid(container, visibleEvents);
            if (currentCount >= allEvents.length) btn.style.display = 'none';
        });

        container.parentNode.appendChild(btn);
    }

    // 渲染Partners Banners
    function renderPartnerBanners(banners) {
        if (!Array.isArray(banners)) return;

        for (let i = 0; i < 4; i++) {
            const banner = banners[i] || {};
            if (banner.active === false) continue;

            const container = document.querySelector(`#partner-banner-${i+1}, .partner-banner-${i+1}, [data-partner-banner="${i+1}"]`);
            if (!container) continue;

            const imageUrl = processUrl(banner.image);
            const logoUrl = processUrl(banner.logo);
            const linkUrl = processUrl(banner.link);

            let html = '';
            if (hasValue(imageUrl)) html += `<div class="pb-bg" style="background-image: url('${imageUrl}');"></div>`;
            if (hasValue(logoUrl)) html += `<img src="${logoUrl}" class="pb-logo" alt="Logo">`;

            let contentHtml = '';
            if (hasValue(banner.title)) contentHtml += `<h3 class="pb-title">${escapeHtml(banner.title)}</h3>`;
            if (hasValue(banner.description)) contentHtml += `<p class="pb-desc">${escapeHtml(banner.description)}</p>`;
            if (hasValue(banner.button_text) && linkUrl) contentHtml += `<a href="${linkUrl}" class="pb-btn">${escapeHtml(banner.button_text)}</a>`;

            if (contentHtml) html += `<div class="pb-content">${contentHtml}</div>`;
            container.innerHTML = html;
        }
    }

    // 渲染Collaborators
    function renderCollaborators(collaborators) {
        if (!Array.isArray(collaborators)) return;

        const container = document.querySelector('#collaborators-grid, .collaborators-container, .collab-grid');
        if (!container) return;

        const html = collaborators.map(item => {
            const logoUrl = processUrl(item.logo || item);
            const linkUrl = processUrl(item.link);
            const name = item.name || '';

            if (!hasValue(logoUrl)) return '';

            const imgHtml = `<img src="${logoUrl}" alt="${escapeHtml(name)}" class="collab-logo" style="width: 180px; height: 110px; object-fit: contain;" onerror="this.style.display='none'">`;

            if (linkUrl) return `<a href="${linkUrl}" class="collab-item" target="_blank" rel="noopener" title="${escapeHtml(name)}">${imgHtml}</a>`;
            else return `<div class="collab-item" title="${escapeHtml(name)}">${imgHtml}</div>`;
        }).filter(Boolean).join('');

        container.innerHTML = html || '<p style="color: #666;">暂无合作伙伴</p>';
    }

    // 渲染底部
    function renderFooter(footerData, isCN) {
        if (!footerData) return;

        const container = document.querySelector('footer, .footer, #footer');
        if (!container) return;

        // 版权文字
        const copyrightEl = container.querySelector('.copyright, .footer-copyright, .copyright-text');
        if (copyrightEl && hasValue(footerData.copyright)) {
            copyrightEl.textContent = footerData.copyright;
        }

        // 社交链接
        const socialContainer = container.querySelector('.social-links, .footer-social, .social-icons');
        if (socialContainer && Array.isArray(footerData.social)) {
            const socialHtml = footerData.social.map(social => {
                if (!hasValue(social.url)) return '';

                const url = processUrl(social.url);
                const iconUrl = processUrl(social.icon);
                const name = social.name || '';

                if (hasValue(iconUrl)) {
                    return `<a href="${url}" class="social-link" target="_blank" rel="noopener" title="${escapeHtml(name)}">
                        <img src="${iconUrl}" alt="${escapeHtml(name)}" style="width: 40px; height: 40px; border-radius: 50%;" onerror="this.style.display='none'; this.parentNode.textContent='${escapeHtml(name)}';">
                    </a>`;
                } else {
                    return `<a href="${url}" class="social-link" target="_blank" rel="noopener">${escapeHtml(name)}</a>`;
                }
            }).filter(Boolean).join('');

            if (socialHtml) socialContainer.innerHTML = socialHtml;
        }

        // 制作单位Logo
        const producerEl = container.querySelector('.producer-logo img, .footer-producer img, .emanon-logo');
        if (producerEl) {
            const logoUrl = processUrl(footerData.producer);
            if (hasValue(logoUrl)) producerEl.src = logoUrl;
        }
    }

    // 主初始化
    async function init() {
        const files = ['banners', 'posters', 'events', 'partner-banners', 'collaborators', 'footer-global', 'footer-cn'];
        const data = {};

        for (const file of files) {
            data[file] = await loadJSON(`${file}.json`);
        }

        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '') || 'index';
        const isCN = pageName === 'cn' || pageName === 'livegigscn';

        if (data.banners) renderBanners(data.banners);

        if (data.posters) {
            let pageType = 'index';
            if (isCN) pageType = 'cn';
            else if (pageName === 'events') pageType = 'events';
            renderPosters(data.posters, pageType);
        }

        if (pageName === 'events' && data.events) renderEvents(data.events);

        if (pageName === 'partners') {
            if (data['partner-banners']) renderPartnerBanners(data['partner-banners']);
            if (data.collaborators) renderCollaborators(data.collaborators);
        }

        const footerData = isCN ? data['footer-cn'] : data['footer-global'];
        if (footerData) renderFooter(footerData, isCN);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.LiveGigsData = { refresh: init };
})();