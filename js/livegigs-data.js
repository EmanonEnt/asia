/**
 * LiveGigs Data Loader
 * 自动从GitHub Pages加载JSON数据并渲染到页面
 * 使用相对路径避免CORS问题
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        baseUrl: './content',
        version: Date.now(), // 防止缓存
        debug: false
    };

    // 图标SVG映射
    const ICONS = {
        facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
        weibo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.389-1.061.428-1.979.002-2.634-.801-1.253-2.99-1.187-5.518-.034 0 0-.791.345-.589-.281.388-1.236.33-2.271-.275-2.868-1.371-1.354-5.025.052-8.163 3.14C1.102 10.542 0 12.652 0 14.51c0 3.558 4.584 5.72 9.065 5.72 5.871 0 9.779-3.406 9.779-6.115 0-1.634-1.379-2.561-2.785-2.466zm.846-4.304c-.729-.822-1.806-1.156-2.804-1.03-.397.051-.658.406-.606.795.052.39.407.657.795.606.564-.072 1.155.121 1.558.575.403.455.54 1.066.378 1.637-.097.343.101.697.444.795.343.099.698-.1.796-.443.259-.912.04-1.937-.561-2.935zm2.271-2.303c-1.564-1.766-3.889-2.479-6.035-2.205-.397.051-.658.406-.606.795.052.39.407.657.795.606 1.652-.211 3.419.354 4.604 1.693 1.184 1.339 1.523 3.149.979 4.782-.114.356.076.737.432.852.355.115.737-.075.852-.431.69-2.153.237-4.566-1.021-6.092z"/></svg>',
        xiaohongshu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.923h-2.769v-3.077h-3.692v3.077H7.385V7.077h2.769v3.077h3.692V7.077h2.769v9.846z"/></svg>',
        miniprogram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
    };

    // 工具函数：加载JSON
    async function loadJSON(filename) {
        try {
            const response = await fetch(`${CONFIG.baseUrl}/${filename}.json?v=${CONFIG.version}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`[LiveGigs] Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 工具函数：获取图标SVG
    function getIconSVG(iconName) {
        return ICONS[iconName] || ICONS.facebook;
    }

    // 渲染底部区域
    function renderFooter(data, containerId) {
        const container = document.getElementById(containerId) || document.getElementById('socialContainer');
        if (!container || !data) return;

        // 查找底部区域容器
        const footer = container.closest('.footer') || container.closest('footer') || document.querySelector('.footer');
        if (!footer) return;

        // 更新社交媒体图标
        const socialContainer = footer.querySelector('#socialContainer') || footer.querySelector('.footer-social');
        if (socialContainer && data.socials) {
            const enabledSocials = data.socials.filter(s => s.enabled && s.link);
            socialContainer.innerHTML = enabledSocials.map(social => `
                <a href="${social.link}" target="_blank" rel="noopener noreferrer" class="social-icon" title="${social.name}">
                    ${getIconSVG(social.icon)}
                </a>
            `).join('');
        }

        // 更新版权信息
        const copyrightEl = footer.querySelector('.copyright') || footer.querySelector('#footer-copyright');
        if (copyrightEl && data.copyright) {
            copyrightEl.textContent = data.copyright;
        }

        // 更新制作单位Logo
        const producerEl = footer.querySelector('.producer-logo') || footer.querySelector('#footer-producer');
        if (producerEl && data.producerLogo) {
            const img = producerEl.querySelector('img');
            if (img) img.src = data.producerLogo;
        }
    }

    // 渲染Banner
    function renderBanners(data) {
        if (!data || !data.banners) return;
        const enabledBanners = data.banners.filter(b => b.enabled && b.image);

        // 查找banner容器
        const bannerContainer = document.querySelector('.banner-slider') || document.querySelector('.hero-slider');
        if (!bannerContainer) return;

        bannerContainer.innerHTML = enabledBanners.map((banner, index) => `
            <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${banner.image}" alt="${banner.title}">
                <div class="banner-content">
                    <h2>${banner.title}</h2>
                    <a href="${banner.link}" target="_blank" class="banner-btn">${banner.buttonText}</a>
                </div>
            </div>
        `).join('') + `
            <div class="banner-dots">
                ${enabledBanners.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
            </div>
        `;

        // 重新初始化轮播
        initBannerSlider();
    }

    // 渲染海报
    function renderPosters(data, containerSelector) {
        if (!data || !data.posters) return;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        const enabledPosters = data.posters.filter(p => p.enabled && p.image);

        container.innerHTML = enabledPosters.map(poster => `
            <div class="poster-item">
                <img src="${poster.image}" alt="${poster.title}">
                <div class="poster-overlay">
                    <h3>${poster.title}</h3>
                    <a href="${poster.link}" target="_blank" class="poster-link">${poster.linkText}</a>
                </div>
            </div>
        `).join('');
    }

    // 渲染Events海报2（轮播）
    function renderEventsPoster2(data) {
        if (!data || !data.posters) return;

        const container = document.querySelector('.poster2-carousel') || document.querySelector('.flyers-section .poster:nth-child(2)');
        if (!container) return;

        const enabledPosters = data.posters.filter(p => p.enabled && p.image);

        if (enabledPosters.length === 0) return;

        if (enabledPosters.length === 1 || !data.poster2_carousel) {
            // 单图模式
            const poster = enabledPosters[0];
            container.innerHTML = `
                <div class="poster-single">
                    <img src="${poster.image}" alt="${poster.title}">
                    <div class="poster-overlay">
                        <h3>${poster.title}</h3>
                        <a href="${poster.link}" target="_blank" class="poster-link">${poster.linkText}</a>
                    </div>
                </div>
            `;
        } else {
            // 轮播模式
            container.innerHTML = `
                <div class="carousel-slider">
                    ${enabledPosters.map((poster, index) => `
                        <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${poster.image}" alt="${poster.title}">
                            <div class="carousel-content">
                                <h3>${poster.title}</h3>
                                <a href="${poster.link}" target="_blank" class="carousel-btn">${poster.linkText}</a>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="carousel-dots">
                    ${enabledPosters.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
                </div>
            `;

            // 初始化轮播
            initCarouselSlider(container);
        }
    }

    // 渲染自主活动
    function renderManagedEvents(data) {
        if (!data || !data.events) return;

        const container = document.querySelector('.events-grid') || document.querySelector('.managed-events');
        if (!container) return;

        const enabledEvents = data.events.filter(e => e.enabled && e.title);
        const displayEvents = enabledEvents.slice(0, 3); // 先显示3个
        const hasMore = enabledEvents.length > 3;

        container.innerHTML = displayEvents.map(event => `
            <div class="event-card">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                    ${event.status ? `<span class="event-status">${event.status}</span>` : `<span class="event-countdown" data-date="${event.date}"></span>`}
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p class="event-date">${event.date}</p>
                    <p class="event-venue">${event.venue}</p>
                    <p class="event-time">${event.time}</p>
                    <p class="event-ticket">${event.ticket}</p>
                    <a href="${event.link}" target="_blank" class="event-btn">${event.buttonText}</a>
                </div>
            </div>
        `).join('') + (hasMore ? `
            <div class="load-more-container">
                <button class="load-more-btn" onclick="loadMoreEvents()">Load More</button>
            </div>
        ` : '');

        // 保存所有事件到全局变量供load more使用
        window.allEvents = enabledEvents;
        window.displayedEvents = 3;
    }

    // Load More功能
    window.loadMoreEvents = function() {
        const container = document.querySelector('.events-grid') || document.querySelector('.managed-events');
        if (!container || !window.allEvents) return;

        const nextEvents = window.allEvents.slice(window.displayedEvents, window.displayedEvents + 3);
        window.displayedEvents += nextEvents.length;

        const loadMoreBtn = container.querySelector('.load-more-container');

        nextEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                    ${event.status ? `<span class="event-status">${event.status}</span>` : `<span class="event-countdown" data-date="${event.date}"></span>`}
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p class="event-date">${event.date}</p>
                    <p class="event-venue">${event.venue}</p>
                    <p class="event-time">${event.time}</p>
                    <p class="event-ticket">${event.ticket}</p>
                    <a href="${event.link}" target="_blank" class="event-btn">${event.buttonText}</a>
                </div>
            `;
            container.insertBefore(eventCard, loadMoreBtn);
        });

        if (window.displayedEvents >= window.allEvents.length) {
            loadMoreBtn.style.display = 'none';
        }
    };

    // 渲染滚播活动
    function renderCarousel(data) {
        if (!data || !data.carousel) return;

        const container = document.querySelector('.carousel-track') || document.querySelector('.events-carousel');
        if (!container) return;

        const enabledItems = data.carousel.filter(c => c.enabled && c.image).sort((a, b) => a.order - b.order);

        container.innerHTML = enabledItems.map(item => `
            <div class="carousel-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="carousel-info">
                    <h4>${item.title}</h4>
                    <p>${item.date}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank">${item.buttonText || 'View Details'}</a>` : `<span>${item.buttonText || ''}</span>`}
                </div>
            </div>
        `).join('');
    }

    // 渲染Partners Banner
    function renderPartnersBanners(data) {
        if (!data || !data.banners) return;

        const enabledBanners = data.banners.filter(b => b.enabled && b.mainImage);

        enabledBanners.forEach((banner, index) => {
            const bannerEl = document.querySelector(`#partner-banner-${index + 1}`) || document.querySelector(`.partner-banner-${index + 1}`);
            if (!bannerEl) return;

            bannerEl.style.backgroundImage = `url(${banner.mainImage})`;

            const logoEl = bannerEl.querySelector('.banner-logo');
            if (logoEl && banner.logoImage) {
                logoEl.src = banner.logoImage;
                logoEl.style.display = 'block';
            } else if (logoEl) {
                logoEl.style.display = 'none';
            }

            const titleEl = bannerEl.querySelector('.banner-title');
            if (titleEl) titleEl.textContent = banner.title;

            const descEl = bannerEl.querySelector('.banner-description');
            if (descEl) descEl.textContent = banner.description;

            const btnEl = bannerEl.querySelector('.banner-btn');
            if (btnEl) {
                btnEl.textContent = banner.buttonText;
                btnEl.href = banner.link || 'javascript:void(0)';
                btnEl.target = banner.link ? '_blank' : '';
            }
        });
    }

    // 渲染Collaborators
    function renderCollaborators(data) {
        if (!data || !data.logos) return;

        const container = document.querySelector('.collaborators-grid') || document.querySelector('.partners-logos');
        if (!container) return;

        const enabledLogos = data.logos.filter(l => l.enabled && l.image);

        container.innerHTML = enabledLogos.map(logo => `
            ${logo.link ? `<a href="${logo.link}" target="_blank" class="collaborator-logo">` : '<div class="collaborator-logo">'}
                <img src="${logo.image}" alt="${logo.name}">
                ${logo.name ? `<span>${logo.name}</span>` : ''}
            ${logo.link ? '</a>' : '</div>'}
        `).join('');
    }

    // 初始化Banner轮播
    function initBannerSlider() {
        const slider = document.querySelector('.banner-slider');
        if (!slider) return;

        const slides = slider.querySelectorAll('.banner-slide');
        const dots = slider.querySelectorAll('.dot');
        let current = 0;

        function showSlide(index) {
            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }

        function nextSlide() {
            current = (current + 1) % slides.length;
            showSlide(current);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                current = index;
                showSlide(current);
            });
        });

        if (slides.length > 1) {
            setInterval(nextSlide, 5000);
        }
    }

    // 初始化Carousel轮播
    function initCarouselSlider(container) {
        const slides = container.querySelectorAll('.carousel-slide');
        const dots = container.querySelectorAll('.dot');
        let current = 0;

        function showSlide(index) {
            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }

        function nextSlide() {
            current = (current + 1) % slides.length;
            showSlide(current);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                current = index;
                showSlide(current);
            });
        });

        if (slides.length > 1) {
            setInterval(nextSlide, 4000);
        }
    }

    // 主加载函数
    async function loadAndRender(pageType) {
        console.log(`[LiveGigs] Loading data for page: ${pageType}`);

        // 加载底部数据（所有页面）
        const isCN = pageType === 'cn';
        const footerData = await loadJSON(isCN ? 'footer-cn' : 'footer-global');
        renderFooter(footerData, 'socialContainer');

        // 根据页面类型加载特定数据
        switch(pageType) {
            case 'index':
                const indexBanners = await loadJSON('banners');
                renderBanners(indexBanners);
                const indexPosters = await loadJSON('index-posters');
                renderPosters(indexPosters, '.flyers-grid, .posters-section');
                break;

            case 'cn':
                const cnBanners = await loadJSON('banners');
                renderBanners(cnBanners);
                const cnPosters = await loadJSON('cn-posters');
                renderPosters(cnPosters, '.flyers-grid, .posters-section');
                break;

            case 'events':
                const eventsPosters = await loadJSON('events-posters');
                renderEventsPoster2(eventsPosters);
                const eventsPagePosters = await loadJSON('events-page-posters');
                if (eventsPagePosters) {
                    renderPosters({posters: [eventsPagePosters.poster1]}, '.poster1-container');
                    renderPosters({posters: [eventsPagePosters.poster3]}, '.poster3-container');
                }
                const managedEvents = await loadJSON('events-managed');
                renderManagedEvents(managedEvents);
                const carousel = await loadJSON('events-carousel');
                renderCarousel(carousel);
                break;

            case 'partners':
                const partnersBanners = await loadJSON('partners-banners');
                renderPartnersBanners(partnersBanners);
                const collaborators = await loadJSON('collaborators');
                renderCollaborators(collaborators);
                break;

            case 'privacy':
            case 'accessibility':
                // 这些页面只需要底部数据
                break;
        }
    }

    // 自动检测页面类型并加载
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

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadAndRender(detectPageType()));
    } else {
        loadAndRender(detectPageType());
    }

    // 暴露全局接口
    window.LiveGigsData = {
        reload: () => loadAndRender(detectPageType()),
        loadPage: (pageType) => loadAndRender(pageType)
    };

})();
