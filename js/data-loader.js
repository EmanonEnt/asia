// LiveGigs Data Loader - 修复版 v2.1
(function() {
    'use strict';

    function safeText(obj, key, defaultValue) {
        if (!obj || typeof obj !== 'object') return defaultValue;
        const value = obj[key];
        if (value === undefined || value === null || value === '') return defaultValue;
        return String(value);
    }

    function safeArray(obj, key) {
        if (!obj || typeof obj !== 'object') return [];
        const value = obj[key];
        if (!Array.isArray(value)) return [];
        return value.filter(item => item !== null && item !== undefined);
    }

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

    // 渲染底部 - 修复copyright
    async function renderFooter() {
        const isCN = window.location.pathname.includes('cn') || window.location.href.includes('cn.html');
        const filename = isCN ? 'footer-cn' : 'footer-global';

        const data = await loadJSON(filename);
        if (!data) {
            console.log('[LiveGigs] Footer data not found, using defaults');
            return;
        }

        console.log('[LiveGigs] Footer data:', data);

        const footer = document.querySelector('.footer') || document.querySelector('footer');
        if (!footer) {
            console.warn('[LiveGigs] Footer element not found');
            return;
        }

        // 修复：尝试多种选择器找copyright
        let copyrightEl = footer.querySelector('.footer-copyright') || 
                         footer.querySelector('.copyright') || 
                         footer.querySelector('[data-field="copyright"]') ||
                         footer.querySelector('.footer-bottom p') ||
                         footer.querySelector('.footer-text');

        if (copyrightEl) {
            const copyrightText = safeText(data, 'copyright', '© 2025 LIVEGIGS ASIA. ALL RIGHTS RESERVED.');
            console.log('[LiveGigs] Setting copyright:', copyrightText);
            copyrightEl.textContent = copyrightText;
        } else {
            console.warn('[LiveGigs] Copyright element not found in footer');
        }

        // 社交链接
        const socialContainer = footer.querySelector('.footer-social') || 
                               footer.querySelector('.social-links') ||
                               footer.querySelector('.social-icons');

        if (socialContainer && data.socialLinks) {
            const links = safeArray(data, 'socialLinks');
            let html = '';

            links.forEach(function(link) {
                if (!link || !link.url) return;
                const icon = safeText(link, 'icon', 'globe');
                const url = safeText(link, 'url', '#');
                const title = safeText(link, 'title', '');

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

            if (html) socialContainer.innerHTML = html;
        }
    }

    // 渲染 Banner
    async function renderBanners() {
        const data = await loadJSON('banners');
        if (!data || !data.banners) return;

        const banners = safeArray(data, 'banners');
        const container = document.querySelector('.hero-slider') || 
                         document.querySelector('.banner-container');
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

    // 渲染海报 - 修复海报2滚播
    async function renderPosters() {
        const page = window.location.pathname;
        let filename = 'index-posters';
        if (page.includes('cn')) filename = 'cn-posters';
        else if (page.includes('events')) filename = 'events-posters';

        const data = await loadJSON(filename);
        if (!data || !data.posters) return;

        const posters = safeArray(data, 'posters');

        // 查找海报容器 - 支持多种选择器
        const containers = document.querySelectorAll('.poster-item, .poster-card, [data-poster]');

        containers.forEach(function(container, index) {
            const poster = posters[index];
            if (!poster) return;

            const image = safeText(poster, 'image', '');
            const title = safeText(poster, 'title', '');
            const linkText = safeText(poster, 'linkText', 'View Details →');
            const link = safeText(poster, 'link', '#');
            const carousel = poster.carousel || [];

            // 更新图片
            if (image) {
                const imgEl = container.querySelector('img');
                if (imgEl) imgEl.src = image;
            }

            // 更新标题
            if (title) {
                const titleEl = container.querySelector('.poster-title, h3, .title');
                if (titleEl) titleEl.textContent = title;
            }

            // 更新链接
            const linkEl = container.querySelector('a');
            if (linkEl) {
                linkEl.href = link;
                const linkTextEl = linkEl.querySelector('.link-text') || linkEl;
                if (linkText) linkTextEl.textContent = linkText;
            }

            // 处理海报2滚播（Events页面第2个海报）
            if (page.includes('events') && index === 1 && carousel.length > 0) {
                initCarousel(container, carousel, title, linkText, link);
            }
        });
    }

    // 初始化滚播
    function initCarousel(container, images, title, linkText, link) {
        if (!images || images.length === 0) return;

        let currentIndex = 0;
        const imgEl = container.querySelector('img');

        if (!imgEl) return;

        // 创建滚播指示器
        let indicators = container.querySelector('.carousel-indicators');
        if (!indicators && images.length > 1) {
            indicators = document.createElement('div');
            indicators.className = 'carousel-indicators';
            indicators.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;';

            images.forEach(function(_, i) {
                const dot = document.createElement('span');
                dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.5);cursor:pointer;';
                if (i === 0) dot.style.background = '#8b0000';
                dot.onclick = function() { goToSlide(i); };
                indicators.appendChild(dot);
            });

            container.style.position = 'relative';
            container.appendChild(indicators);
        }

        function goToSlide(index) {
            currentIndex = index;
            if (imgEl) imgEl.src = images[index];

            // 更新指示器
            const dots = indicators?.querySelectorAll('span');
            if (dots) {
                dots.forEach(function(dot, i) {
                    dot.style.background = i === index ? '#8b0000' : 'rgba(255,255,255,0.5)';
                });
            }
        }

        // 自动播放
        if (images.length > 1) {
            setInterval(function() {
                goToSlide((currentIndex + 1) % images.length);
            }, 3000);
        }
    }

    // 渲染 Events - 修复
    async function renderEvents() {
        console.log('[LiveGigs] Loading events...');

        const data = await loadJSON('events-managed');
        if (!data) {
            console.warn('[LiveGigs] Events data not found');
            return;
        }

        console.log('[LiveGigs] Events data:', data);

        const events = safeArray(data, 'events');
        const container = document.querySelector('.events-grid') || 
                         document.querySelector('.events-container') ||
                         document.querySelector('[data-section="events"]');

        if (!container) {
            console.warn('[LiveGigs] Events container not found');
            return;
        }

        console.log('[LiveGigs] Found events container, rendering', events.length, 'events');

        const displayEvents = events.slice(0, 6);
        const hasMore = events.length > 6;

        let html = '';
        displayEvents.forEach(function(event, index) {
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

            html += '<div class="event-card" data-event-id="' + index + '">' +
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
            html += '<div class="load-more-container" style="grid-column:1/-1;text-align:center;margin-top:20px;">' +
                '<button class="btn-load-more" onclick="loadMoreEvents()">LOAD MORE</button>' +
                '</div>';
        }

        container.innerHTML = html;
        console.log('[LiveGigs] Events rendered successfully');
    }

    // 渲染 Partners Banners
    async function renderPartnersBanners() {
        const data = await loadJSON('partners-banners');
        if (!data || !data.banners) return;

        const banners = safeArray(data, 'banners');

        banners.forEach(function(banner, index) {
            if (!banner) return;
            const bannerNum = index + 1;
            const container = document.querySelector('.banner-' + bannerNum) || 
                             document.querySelector('[data-banner="' + bannerNum + '"]');

            if (!container) return;

            const image = safeText(banner, 'image', '');
            const logo = safeText(banner, 'logo', '');
            const title = safeText(banner, 'title', '');
            const description = safeText(banner, 'description', '');
            const buttonText = safeText(banner, 'buttonText', 'LEARN MORE');
            const link = safeText(banner, 'link', '#');

            if (image) container.style.backgroundImage = 'url(' + image + ')';

            if (logo) {
                const logoEl = container.querySelector('.banner-logo');
                if (logoEl) logoEl.src = logo;
            }

            if (title) {
                const titleEl = container.querySelector('.banner-title, h2, h3');
                if (titleEl) titleEl.textContent = title;
            }

            if (description) {
                const descEl = container.querySelector('.banner-desc, p');
                if (descEl) descEl.textContent = description;
            }

            const btnEl = container.querySelector('.banner-btn, .btn-banner, a');
            if (btnEl) {
                btnEl.href = link;
                btnEl.textContent = buttonText;
            }
        });
    }

    // 渲染 Collaborators - 修复为动态数量
    async function renderCollaborators() {
        console.log('[LiveGigs] Loading collaborators...');

        const data = await loadJSON('collaborators');
        if (!data) {
            console.warn('[LiveGigs] Collaborators data not found');
            return;
        }

        console.log('[LiveGigs] Collaborators data:', data);

        const logos = safeArray(data, 'logos');
        const container = document.querySelector('.collaborators-grid') || 
                         document.querySelector('.partners-logos') ||
                         document.querySelector('[data-section="collaborators"]');

        if (!container) {
            console.warn('[LiveGigs] Collaborators container not found');
            return;
        }

        console.log('[LiveGigs] Rendering', logos.length, 'collaborators');

        let html = '';
        logos.forEach(function(logo, index) {
            if (!logo) return;
            const image = safeText(logo, 'image', '');
            const name = safeText(logo, 'name', '');
            const link = safeText(logo, 'link', '');

            if (!image) return;

            if (link && link !== '#' && link !== '') {
                html += '<a href="' + link + '" class="collaborator-logo" target="_blank" data-index="' + index + '">' +
                    '<img src="' + image + '" alt="' + name + '" loading="lazy">' +
                    '</a>';
            } else {
                html += '<div class="collaborator-logo" data-index="' + index + '">' +
                    '<img src="' + image + '" alt="' + name + '" loading="lazy">' +
                    '</div>';
            }
        });

        container.innerHTML = html;
        console.log('[LiveGigs] Collaborators rendered successfully');
    }

    // 初始化
    async function init() {
        console.log('[LiveGigs] Data Loader v2.1 starting...');

        await Promise.all([
            renderFooter(),
            renderBanners(),
            renderPosters(),
            renderEvents(),
            renderPartnersBanners(),
            renderCollaborators()
        ]);

        console.log('[LiveGigs] All data loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.LiveGigsData = { refresh: init };
})();
