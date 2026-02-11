// LiveGigs Data Loader - 安全版本
(function() {
    'use strict';

    const CONFIG = {
        contentPath: './content/',
        debug: true
    };

    function log(...args) {
        if (CONFIG.debug) console.log('[DataLoader]', ...args);
    }

    // 安全更新 - 不破坏原有结构
    function safeUpdate(selector, value, attribute) {
        if (!value || value === 'undefined' || value === 'null') {
            log('Skipping empty value for', selector);
            return;
        }

        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (!el) return;

            if (attribute === 'text') {
                el.textContent = value;
            } else if (attribute === 'src') {
                el.src = value;
            } else if (attribute === 'href') {
                el.href = value;
            }

            log('Updated', selector, '->', value);
        });
    }

    // 加载JSON
    async function loadJSON(filename) {
        try {
            const url = `${CONFIG.contentPath}${filename}.json?t=${Date.now()}`;
            log('Loading:', url);

            const response = await fetch(url);
            if (!response.ok) {
                log('File not found:', filename);
                return null;
            }

            return await response.json();
        } catch (e) {
            log('Error loading', filename, e.message);
            return null;
        }
    }

    // 渲染Banner
    function renderBanners(banners) {
        if (!banners || !Array.isArray(banners)) return;

        banners.forEach((banner, index) => {
            if (!banner.title) return;

            // 只更新已有元素，不创建新元素
            const bannerEl = document.querySelector(`[data-banner-id="${index + 1}"]`);
            if (bannerEl) {
                const titleEl = bannerEl.querySelector('.banner-title');
                const imgEl = bannerEl.querySelector('img');
                const btnEl = bannerEl.querySelector('.banner-btn');

                if (titleEl) titleEl.textContent = banner.title;
                if (imgEl && banner.image) imgEl.src = banner.image;
                if (btnEl) {
                    btnEl.textContent = banner.btn || 'View Details →';
                    if (banner.link) btnEl.href = banner.link;
                }
            }
        });
    }

    // 渲染Events
    function renderEvents(events) {
        if (!events || !Array.isArray(events)) return;

        const container = document.getElementById('eventsGrid');
        if (!container) return;

        // 如果events为空，保留原有内容
        if (events.length === 0) {
            log('No events data, keeping existing content');
            return;
        }

        // 只更新已有卡片，不重新创建
        events.forEach((event, index) => {
            const card = container.querySelector(`[data-event-id="${index + 1}"]`);
            if (!card) return;

            const titleEl = card.querySelector('.event-title');
            const imgEl = card.querySelector('img');
            const dateEl = card.querySelector('.event-date');
            const locationEl = card.querySelector('.event-location');
            const btnEl = card.querySelector('.event-btn');

            if (titleEl && event.title) titleEl.textContent = event.title;
            if (imgEl && event.image) imgEl.src = event.image;
            if (dateEl && event.date) dateEl.textContent = event.date;
            if (locationEl && event.location) locationEl.textContent = event.location;
            if (btnEl) {
                if (event.btn) btnEl.textContent = event.btn;
                if (event.link) btnEl.href = event.link;
            }
        });

        // 更新Load More按钮
        const loadMore = document.getElementById('loadMoreBtn');
        if (loadMore) {
            loadMore.style.display = events.length <= 3 ? 'none' : 'block';
        }
    }

    // 渲染底部
    function renderFooter(footer) {
        if (!footer) return;

        if (footer.email) {
            const emailEl = document.querySelector('a[href^="mailto"]');
            if (emailEl) {
                emailEl.href = `mailto:${footer.email}`;
                emailEl.textContent = footer.email;
            }
        }

        if (footer.phone) {
            const phoneEl = document.querySelector('a[href^="tel"]');
            if (phoneEl) {
                phoneEl.href = `tel:${footer.phone}`;
                phoneEl.textContent = footer.phone;
            }
        }

        if (footer.address) {
            const addressEl = document.querySelector('.footer-address');
            if (addressEl) {
                addressEl.innerHTML = footer.address.replace(/\n/g, '<br>');
            }
        }
    }

    // 初始化
    async function init(pageType) {
        log('Initializing for page:', pageType);

        // 加载数据
        const data = await loadJSON('data');
        if (!data) {
            log('No data file found, using default content');
            return;
        }

        // 渲染各部分内容
        if (data.banners) renderBanners(data.banners);
        if (data.events) renderEvents(data.events);

        // 底部数据
        const isCN = pageType === 'cn';
        const footerKey = isCN ? 'footerCN' : 'footerGlobal';
        if (data[footerKey]) renderFooter(data[footerKey]);

        log('Initialization complete');
    }

    // 暴露到全局
    window.DataLoader = {
        init: init
    };

    log('DataLoader loaded');
})();