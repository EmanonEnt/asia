// LiveGigs Data Loader - 自动从JSON加载数据到前端
// 版本: 2.1 - 支持手动调用和自动检测

(function() {
    'use strict';

    // 数据缓存
    const dataCache = {};
    const cacheExpiry = 60000; // 1分钟缓存

    // 页面类型映射
    const pageTypeMap = {
        'index': 'index',
        'cn': 'cn', 
        'events': 'events',
        'partners': 'partners',
        'privacy': 'privacy',
        'accessibility': 'accessibility'
    };

    // 获取基础URL
    function getBaseUrl() {
        const path = window.location.pathname;
        const depth = path.split('/').filter(p => p && !p.includes('.')).length;
        return depth > 0 ? './'.repeat(depth) + 'content/' : './content/';
    }

    // 加载JSON数据
    async function loadJSON(filename) {
        const cacheKey = filename;
        const now = Date.now();

        if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp < cacheExpiry)) {
            return dataCache[cacheKey].data;
        }

        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}${filename}.json?v=${now}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                console.warn(`Failed to load ${filename}: ${response.status}`);
                return null;
            }

            const data = await response.json();
            dataCache[cacheKey] = { data: data, timestamp: now };
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    // 安全设置HTML内容
    function safeSetHTML(element, html) {
        if (element) element.innerHTML = html;
    }

    // 安全设置文本内容
    function safeSetText(element, text) {
        if (element) element.textContent = text || '';
    }

    // 安全设置属性
    function safeSetAttr(element, attr, value) {
        if (element && value) element.setAttribute(attr, value);
    }

    // 渲染Banner区域
    async function renderBanners() {
        const data = await loadJSON('banners');
        if (!data || !data.banners) return;

        const enabledBanners = data.banners.filter(b => b.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));

        const bannerContainer = document.querySelector('.banner-slider, .hero-slider, #banner-slider, .rebel-slide, [data-section="banner"]');
        if (!bannerContainer) {
            console.log('Banner container not found');
            return;
        }

        if (enabledBanners.length === 0) return;

        let bannerHTML = '';
        enabledBanners.forEach((banner, index) => {
            const titleHTML = banner.title ? `<h2 class="banner-title" data-editable="banner-title">${banner.title}</h2>` : '';
            const buttonHTML = banner.buttonText ? 
                `<a href="${banner.link || '#'}" class="banner-btn" ${banner.link ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'} data-editable="banner-button">${banner.buttonText}</a>` : '';

            bannerHTML += `
                <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${banner.image || './image/hero-bg.jpg'}" alt="${banner.title || 'Banner'}" class="banner-bg" data-editable="banner-image">
                    <div class="banner-content">
                        ${titleHTML}
                        ${buttonHTML}
                    </div>
                </div>
            `;
        });

        if (enabledBanners.length > 1) {
            bannerHTML += `
                <div class="banner-dots">
                    ${enabledBanners.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                </div>
                <button class="banner-prev">&lt;</button>
                <button class="banner-next">&gt;</button>
            `;
        }

        safeSetHTML(bannerContainer, bannerHTML);

        if (enabledBanners.length > 1) {
            initBannerSlider();
        }
    }

    // Banner轮播初始化
    function initBannerSlider() {
        const slides = document.querySelectorAll('.banner-slide');
        const dots = document.querySelectorAll('.banner-dots .dot');
        const prevBtn = document.querySelector('.banner-prev');
        const nextBtn = document.querySelector('.banner-next');

        if (slides.length <= 1) return;

        let currentIndex = 0;
        let autoPlayInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
            currentIndex = index;
        }

        function nextSlide() { showSlide((currentIndex + 1) % slides.length); }
        function prevSlide() { showSlide((currentIndex - 1 + slides.length) % slides.length); }
        function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
        function stopAutoPlay() { clearInterval(autoPlayInterval); }

        if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => { stopAutoPlay(); showSlide(index); startAutoPlay(); });
        });

        startAutoPlay();
    }

    // 渲染海报区域
    async function renderPosters(pageType) {
        let posterData;
        if (pageType === 'index') {
            posterData = await loadJSON('index-posters');
        } else if (pageType === 'cn') {
            posterData = await loadJSON('cn-posters');
        } else if (pageType === 'events') {
            posterData = await loadJSON('events-posters');
        } else {
            return;
        }

        if (!posterData || !posterData.posters) return;

        const posters = posterData.posters.filter(p => p.enabled);
        const posterContainers = document.querySelectorAll('.poster-item, .poster-card, [class*="poster"], [data-section="poster"]');

        posters.forEach((poster, index) => {
            const container = posterContainers[index];
            if (!container) return;

            const img = container.querySelector('img');
            const title = container.querySelector('.poster-title, h3, h4, [data-editable*="title"]');
            const link = container.querySelector('a');
            const linkText = container.querySelector('.poster-link, .view-details, [data-editable*="link"]');

            if (img) safeSetAttr(img, 'src', poster.image || '');
            if (title) safeSetText(title, poster.title);

            if (link) {
                if (poster.link) {
                    safeSetAttr(link, 'href', poster.link);
                    link.setAttribute('target', '_blank');
                    link.style.pointerEvents = 'auto';
                    link.style.opacity = '1';
                } else {
                    link.style.pointerEvents = 'none';
                    link.style.opacity = '0.5';
                }
            }

            if (linkText) safeSetText(linkText, poster.linkText || 'View Details →');
        });

        // Events页面海报2轮播
        if (pageType === 'events' && posterData.poster2_carousel && posters.length >= 2) {
            initPoster2Carousel(posters);
        }
    }

    // 海报2轮播初始化
    function initPoster2Carousel(posters) {
        const container = document.querySelector('.poster-2-container, [data-poster="2"], [data-carousel="poster2"]');
        if (!container) return;

        let currentIndex = 0;

        function showPoster(index) {
            const poster = posters[index];
            const img = container.querySelector('img');
            const title = container.querySelector('.poster-title');
            const link = container.querySelector('a');

            if (img) {
                img.style.opacity = '0';
                setTimeout(() => {
                    safeSetAttr(img, 'src', poster.image);
                    img.style.opacity = '1';
                }, 300);
            }
            if (title) safeSetText(title, poster.title);
            if (link) {
                if (poster.link) {
                    safeSetAttr(link, 'href', poster.link);
                    link.style.pointerEvents = 'auto';
                } else {
                    link.style.pointerEvents = 'none';
                }
            }
        }

        setInterval(() => {
            currentIndex = (currentIndex + 1) % posters.length;
            showPoster(currentIndex);
        }, 4000);
    }

    // 渲染自主活动
    async function renderEvents() {
        const data = await loadJSON('events-managed');
        if (!data || !data.events) return;

        const events = data.events.filter(e => e.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));

        const container = document.querySelector('.events-grid, .events-container, #events-managed, [data-section="events-managed"]');
        if (!container) return;

        const displayEvents = events.slice(0, 3);
        const hasMore = events.length > 3;

        let eventsHTML = displayEvents.map(event => {
            const statusBadge = event.status ? `<span class="event-status" data-editable="event-status">${event.status}</span>` : '';
            const infoLine = [event.date, event.venue, event.time, event.ticket].filter(Boolean).join(' | ');
            const buttonHTML = event.buttonText ? 
                `<a href="${event.link || '#'}" class="event-btn" ${event.link ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'} data-editable="event-button">${event.buttonText}</a>` : '';

            return `
                <div class="event-card" data-id="${event.id}">
                    <div class="event-image">
                        <img src="${event.image || './image/default-event.jpg'}" alt="${event.title}" data-editable="event-image">
                        ${statusBadge}
                    </div>
                    <div class="event-info">
                        <h3 data-editable="event-title">${event.title || ''}</h3>
                        <p class="event-meta" data-editable="event-meta">${infoLine}</p>
                        ${buttonHTML}
                    </div>
                </div>
            `;
        }).join('');

        if (hasMore) {
            eventsHTML += `
                <div class="load-more-container">
                    <button class="load-more-btn" onclick="loadMoreEvents()">Load More</button>
                </div>
            `;
            window.allEventsData = events;
        }

        safeSetHTML(container, eventsHTML);
    }

    // Load More功能
    window.loadMoreEvents = function() {
        if (!window.allEventsData) return;

        const container = document.querySelector('.events-grid, .events-container, #events-managed, [data-section="events-managed"]');
        const btn = document.querySelector('.load-more-container');

        const remainingEvents = window.allEventsData.slice(3);

        const moreHTML = remainingEvents.map(event => {
            const statusBadge = event.status ? `<span class="event-status">${event.status}</span>` : '';
            const infoLine = [event.date, event.venue, event.time, event.ticket].filter(Boolean).join(' | ');
            const buttonHTML = event.buttonText ? 
                `<a href="${event.link || '#'}" class="event-btn" ${event.link ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'}>${event.buttonText}</a>` : '';

            return `
                <div class="event-card" data-id="${event.id}">
                    <div class="event-image">
                        <img src="${event.image || './image/default-event.jpg'}" alt="${event.title}">
                        ${statusBadge}
                    </div>
                    <div class="event-info">
                        <h3>${event.title || ''}</h3>
                        <p class="event-meta">${infoLine}</p>
                        ${buttonHTML}
                    </div>
                </div>
            `;
        }).join('');

        if (btn) btn.remove();
        container.insertAdjacentHTML('beforeend', moreHTML);
    };

    // 渲染滚播活动
    async function renderCarousel() {
        const data = await loadJSON('events-carousel');
        if (!data || !data.carousel) return;

        const items = data.carousel.filter(c => c.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));
        if (items.length < 3) {
            console.log('Carousel needs at least 3 items');
            return;
        }

        const container = document.querySelector('.carousel-container, .events-carousel, #carousel, [data-section="carousel"]');
        if (!container) return;

        let carouselHTML = items.map((item, index) => {
            const infoLine = [item.date, item.buttonText].filter(Boolean).join(' / ');
            return `
                <div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${item.image || './image/default-carousel.jpg'}" alt="${item.title}">
                    <div class="carousel-overlay">
                        <h3 data-editable="carousel-title">${item.title || ''}</h3>
                        <p class="carousel-info" data-editable="carousel-info">${infoLine}</p>
                        ${item.link ? `<a href="${item.link}" target="_blank" class="carousel-link">View Details</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        carouselHTML += `
            <button class="carousel-prev">&lt;</button>
            <button class="carousel-next">&gt;</button>
            <div class="carousel-dots">
                ${items.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
            </div>
        `;

        safeSetHTML(container, carouselHTML);
        initCarousel();
    }

    // 轮播初始化
    function initCarousel() {
        const items = document.querySelectorAll('.carousel-item');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (items.length <= 1) return;

        let currentIndex = 0;
        let autoPlayInterval;

        function showItem(index) {
            items.forEach((item, i) => item.classList.toggle('active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
            currentIndex = index;
        }

        function next() { showItem((currentIndex + 1) % items.length); }
        function prev() { showItem((currentIndex - 1 + items.length) % items.length); }
        function startAutoPlay() { autoPlayInterval = setInterval(next, 4000); }
        function stopAutoPlay() { clearInterval(autoPlayInterval); }

        if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlay(); prev(); startAutoPlay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlay(); next(); startAutoPlay(); });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => { stopAutoPlay(); showItem(index); startAutoPlay(); });
        });

        startAutoPlay();
    }

    // 渲染底部区域
    async function renderFooter(pageType) {
        let footerData;
        if (pageType === 'cn') {
            footerData = await loadJSON('footer-cn');
        } else {
            footerData = await loadJSON('footer-global');
        }

        if (!footerData) return;

        // 站点名称
        const siteNameEl = document.querySelector('.footer-logo, .site-name, [data-field="siteName"], .footer-brand');
        if (siteNameEl && footerData.siteName) safeSetText(siteNameEl, footerData.siteName);

        // 站点副标（红色）
        const siteAsiaEl = document.querySelector('.footer-asia, .site-asia, [data-field="siteAsia"], .footer-brand span');
        if (siteAsiaEl && footerData.siteNameAsia) safeSetText(siteAsiaEl, footerData.siteNameAsia);

        // 联系文字
        const contactTextEl = document.querySelector('.footer-contact-text, [data-field="contactText"], .contact-info p');
        if (contactTextEl && footerData.contactText) safeSetText(contactTextEl, footerData.contactText);

        // 邮箱地址（可点击）
        const emailEl = document.querySelector('.footer-email, [data-field="email"], .contact-email');
        if (emailEl && footerData.email) {
            emailEl.innerHTML = `<a href="mailto:${footerData.email}" target="_blank">${footerData.email}</a>`;
        }

        // 地址
        const addressEl = document.querySelector('.footer-address, [data-field="address"], .contact-address');
        if (addressEl && footerData.address) safeSetText(addressEl, footerData.address);

        // 版权文字
        const copyrightEl = document.querySelector('.copyright, .footer-copyright, [data-field="copyright"]');
        if (copyrightEl && footerData.copyright) safeSetText(copyrightEl, footerData.copyright);

        // 制作单位Logo
        const producerLogoEl = document.querySelector('.producer-logo img, [data-field="producerLogo"]');
        if (producerLogoEl && footerData.producerLogo) safeSetAttr(producerLogoEl, 'src', footerData.producerLogo);

        // 社交媒体图标
        renderSocialIcons(footerData.socials);
    }

    // 渲染社交媒体图标
    function renderSocialIcons(socials) {
        if (!socials || !Array.isArray(socials)) return;

        const container = document.querySelector('#socialContainer, .footer-social, .social-icons, [data-section="social"]');
        if (!container) return;

        const enabledSocials = socials.filter(s => s.enabled);

        let iconsHTML = enabledSocials.map(social => {
            const iconClass = getSocialIconClass(social.icon, social.customIcon);
            const linkAttr = social.link ? `href="${social.link}" target="_blank"` : '';
            const disabledClass = social.link ? '' : 'disabled';

            return `
                <a ${linkAttr} class="social-icon ${disabledClass}" title="${social.name || ''}">
                    <i class="${iconClass}"></i>
                </a>
            `;
        }).join('');

        safeSetHTML(container, iconsHTML);
    }

    // 获取社交媒体图标类名
    function getSocialIconClass(iconType, customIcon) {
        if (customIcon) return customIcon;

        const iconMap = {
            'facebook': 'fab fa-facebook-f',
            'instagram': 'fab fa-instagram',
            'youtube': 'fab fa-youtube',
            'x': 'fab fa-x-twitter',
            'twitter': 'fab fa-twitter',
            'tiktok': 'fab fa-tiktok',
            'linkedin': 'fab fa-linkedin-in',
            'spotify': 'fab fa-spotify',
            'apple': 'fab fa-apple',
            'soundcloud': 'fab fa-soundcloud',
            'bandcamp': 'fab fa-bandcamp',
            'wechat': 'fab fa-weixin',
            'weibo': 'fab fa-weibo',
            'xiaohongshu': 'icon-xiaohongshu',
            'miniprogram': 'icon-miniprogram',
            'douyin': 'fab fa-tiktok',
            'bilibili': 'icon-bilibili',
            'qq': 'fab fa-qq',
            'zhihu': 'icon-zhihu',
            'netease': 'icon-netease',
            'qqmusic': 'icon-qqmusic'
        };

        return iconMap[iconType] || 'fas fa-link';
    }

    // 渲染Partners页面
    async function renderPartners() {
        // 渲染Banner
        const bannersData = await loadJSON('partners-banners');
        if (bannersData && bannersData.banners) {
            const banners = bannersData.banners.filter(b => b.enabled);
            const bannerContainers = document.querySelectorAll('.partner-banner, [class*="partner-banner"], [data-section="partner-banner"]');

            banners.forEach((banner, index) => {
                const container = bannerContainers[index];
                if (!container) return;

                const bgImg = container.querySelector('.banner-bg, img');
                const logoImg = container.querySelector('.banner-logo');
                const title = container.querySelector('.banner-title, h2, h3');
                const desc = container.querySelector('.banner-desc, .description');
                const btn = container.querySelector('.banner-btn, a');

                if (bgImg) safeSetAttr(bgImg, 'src', banner.mainImage);
                if (logoImg) safeSetAttr(logoImg, 'src', banner.logoImage);
                if (title) safeSetText(title, banner.title);
                if (desc) safeSetText(desc, banner.description);

                if (btn) {
                    if (banner.buttonText) {
                        safeSetText(btn, banner.buttonText);
                        if (banner.link) {
                            safeSetAttr(btn, 'href', banner.link);
                            btn.style.pointerEvents = 'auto';
                        } else {
                            btn.style.pointerEvents = 'none';
                            btn.style.opacity = '0.5';
                        }
                    } else {
                        btn.style.display = 'none';
                    }
                }
            });
        }

        // 渲染Collaborators
        const collaboratorsData = await loadJSON('collaborators');
        if (collaboratorsData && collaboratorsData.logos) {
            const logos = collaboratorsData.logos.filter(l => l.enabled);
            const container = document.querySelector('.collaborators-grid, .partners-logos, #collaborators, [data-section="collaborators"]');

            if (container) {
                let logosHTML = logos.map(logo => {
                    const linkWrapper = logo.link ? 
                        `<a href="${logo.link}" target="_blank" class="collaborator-link">` : 
                        '<span class="collaborator-link disabled">';
                    const closeWrapper = logo.link ? '</a>' : '</span>';

                    return `
                        <div class="collaborator-item" title="${logo.name || ''}">
                            ${linkWrapper}
                                <img src="${logo.image || './image/default-logo.png'}" alt="${logo.name || 'Partner'}">
                            ${closeWrapper}
                        </div>
                    `;
                }).join('');

                safeSetHTML(container, logosHTML);
            }
        }
    }

    // 主初始化函数 - 支持手动传入页面类型
    async function init(manualPageType) {
        const pageType = manualPageType || detectPageType();
        console.log('LiveGigs Data Loader initializing for page:', pageType);

        try {
            // 根据页面类型加载相应数据
            if (pageType === 'index' || pageType === 'cn') {
                await renderBanners();
                await renderPosters(pageType);
            }

            if (pageType === 'events') {
                await renderCarousel();
                await renderEvents();
                await renderPosters(pageType);
            }

            if (pageType === 'partners') {
                await renderPartners();
            }

            // 所有页面都加载底部
            await renderFooter(pageType);

            console.log('LiveGigs Data Loader initialized successfully');
        } catch (error) {
            console.error('Error initializing LiveGigs Data Loader:', error);
        }
    }

    // 检测页面类型
    function detectPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        if (filename.includes('cn')) return 'cn';
        if (filename.includes('events')) return 'events';
        if (filename.includes('partners')) return 'partners';
        if (filename.includes('privacy')) return 'privacy';
        if (filename.includes('accessibility')) return 'accessibility';
        return 'index';
    }

    // DOM加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    // 暴露全局API - 支持手动调用
    window.LiveGigsData = {
        loadAndRender: init,
        refresh: () => init(),
        loadJSON: loadJSON,
        clearCache: () => {
            Object.keys(dataCache).forEach(key => delete dataCache[key]);
        },
        // 单独渲染各个模块
        renderBanners: renderBanners,
        renderPosters: renderPosters,
        renderEvents: renderEvents,
        renderCarousel: renderCarousel,
        renderFooter: renderFooter,
        renderPartners: renderPartners
    };

})();
