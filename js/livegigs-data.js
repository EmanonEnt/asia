// LiveGigs Asia - Data Loader
// 修复版：确保每个页面加载正确的数据源

(function() {
    'use strict';

    // 配置
    const config = {
        baseUrl: 'https://emanonent.github.io/asia/content',
        version: Date.now() // 防止缓存
    };

    // 页面配置映射
    const pageConfig = {
        'index': {
            banners: true,
            posters: 'index-posters',
            footer: 'footer-global'
        },
        'cn': {
            banners: true,
            posters: 'cn-posters',
            footer: 'footer-cn'
        },
        'events': {
            carousel: true,
            managed: true,
            posters: 'events-posters',
            footer: 'footer-global'
        },
        'partners': {
            banners: 'partners-banners',
            collaborators: true,
            footer: 'footer-global'
        },
        'privacy': {
            footer: 'footer-global'
        },
        'accessibility': {
            footer: 'footer-global'
        }
    };

    // 工具函数：加载JSON
    async function loadJSON(filename) {
        try {
            const url = `${config.baseUrl}/${filename}.json?v=${config.version}`;
            console.log('Loading:', url);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 渲染Banner
    function renderBanners(data) {
        const container = document.getElementById('banner-container');
        if (!container || !data || !data.banners) return;

        container.innerHTML = data.banners.map((banner, index) => {
            if (!banner.image) return '';
            return `
                <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${banner.image}" alt="${banner.title || ''}">
                    <div class="banner-content">
                        ${banner.title ? `<h2 data-editable="banners[${index}].title">${banner.title}</h2>` : ''}
                        ${banner.subtitle ? `<p data-editable="banners[${index}].subtitle">${banner.subtitle}</p>` : ''}
                        ${banner.buttonText && banner.buttonLink ? 
                            `<a href="${banner.buttonLink}" class="banner-btn" data-editable="banners[${index}].buttonText">${banner.buttonText}</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // 重新初始化轮播
        if (typeof initBannerSlider === 'function') {
            setTimeout(initBannerSlider, 100);
        }
    }

    // 渲染海报区域 - 修复版
    function renderPosters(data, pageType) {
        // 海报1
        const poster1 = document.getElementById('poster1-container');
        if (poster1 && data.poster1) {
            poster1.innerHTML = `
                <div class="poster-item">
                    <img src="${data.poster1.image || './image/1-b-1.jpg'}" alt="${data.poster1.title || 'Poster 1'}">
                    <div class="poster-overlay">
                        ${data.poster1.title ? `<h3 data-editable="poster1.title">${data.poster1.title}</h3>` : ''}
                        ${data.poster1.linkText && data.poster1.link ? 
                            `<a href="${data.poster1.link}" class="poster-link" data-editable="poster1.linkText">${data.poster1.linkText}</a>` : ''}
                    </div>
                </div>
            `;
        }

        // 海报2 - 支持轮播
        const poster2 = document.getElementById('poster2-container');
        if (poster2 && data.poster2) {
            if (data.poster2.slides && data.poster2.slides.length > 1) {
                // 轮播模式
                poster2.innerHTML = `
                    <div class="poster-carousel">
                        ${data.poster2.slides.map((slide, idx) => `
                            <div class="carousel-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                                <img src="${slide.image}" alt="${slide.title || ''}">
                                <div class="poster-overlay">
                                    ${slide.title ? `<h3 data-editable="poster2.slides[${idx}].title">${slide.title}</h3>` : ''}
                                    ${slide.linkText && slide.link ? 
                                        `<a href="${slide.link}" class="poster-link" data-editable="poster2.slides[${idx}].linkText">${slide.linkText}</a>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                setTimeout(() => initPoster2Carousel(data.poster2.slides.length), 100);
            } else {
                // 单图模式
                const slide = data.poster2.slides ? data.poster2.slides[0] : data.poster2;
                poster2.innerHTML = `
                    <div class="poster-item">
                        <img src="${slide.image || './image/1-b-2.jpg'}" alt="${slide.title || 'Poster 2'}">
                        <div class="poster-overlay">
                            ${slide.title ? `<h3 data-editable="poster2.title">${slide.title}</h3>` : ''}
                            ${slide.linkText && slide.link ? 
                                `<a href="${slide.link}" class="poster-link" data-editable="poster2.linkText">${slide.linkText}</a>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        // 海报3
        const poster3 = document.getElementById('poster3-container');
        if (poster3 && data.poster3) {
            poster3.innerHTML = `
                <div class="poster-item">
                    <img src="${data.poster3.image || './image/1-b-3.jpg'}" alt="${data.poster3.title || 'Poster 3'}">
                    <div class="poster-overlay">
                        ${data.poster3.title ? `<h3 data-editable="poster3.title">${data.poster3.title}</h3>` : ''}
                        ${data.poster3.linkText && data.poster3.link ? 
                            `<a href="${data.poster3.link}" class="poster-link" data-editable="poster3.linkText">${data.poster3.linkText}</a>` : ''}
                    </div>
                </div>
            `;
        }
    }

    // 渲染Events滚播海报 - 修复版
    function renderCarousel(data) {
        const container = document.getElementById('carousel-container');
        if (!container || !data || !data.slides) return;

        container.innerHTML = data.slides.map((slide, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${slide.image || ''}" alt="${slide.title || ''}">
                <div class="carousel-caption">
                    ${slide.title ? `<h3 data-editable="carousel[${index}].title">${slide.title}</h3>` : ''}
                    ${slide.date ? `<p class="event-date" data-editable="carousel[${index}].date">${slide.date}</p>` : ''}
                    ${slide.location ? `<p class="event-location" data-editable="carousel[${index}].location">${slide.location}</p>` : ''}
                    ${slide.description ? `<p class="event-desc" data-editable="carousel[${index}].description">${slide.description}</p>` : ''}
                    ${slide.buttonText && slide.link ? 
                        `<a href="${slide.link}" class="carousel-btn" data-editable="carousel[${index}].buttonText">${slide.buttonText}</a>` : ''}
                </div>
            </div>
        `).join('');

        if (typeof initEventCarousel === 'function') {
            setTimeout(initEventCarousel, 100);
        }
    }

    // 渲染自主活动 - 修复版
    function renderManagedEvents(data) {
        const container = document.getElementById('managed-events-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (!container || !data || !data.events) return;

        const events = data.events;
        const initialCount = 3;
        const hasMore = events.length > initialCount;

        // 只显示前3个，如果有更多显示load more按钮
        const displayEvents = events.slice(0, initialCount);

        container.innerHTML = displayEvents.map((event, index) => `
            <div class="event-card" data-index="${index}" style="display: block;">
                <div class="event-poster">
                    <img src="${event.poster || './image/default-event.jpg'}" alt="${event.title || ''}">
                    ${event.ontour ? '<span class="badge ontour">ON TOUR</span>' : ''}
                    ${event.soldout ? '<span class="badge soldout">SOLD OUT</span>' : ''}
                    ${event.countdown ? `<div class="countdown" data-target="${event.countdown}"></div>` : ''}
                </div>
                <div class="event-info">
                    ${event.title ? `<h3 data-editable="events[${index}].title">${event.title}</h3>` : ''}
                    ${event.date ? `<p class="event-date"><i class="icon-calendar"></i> <span data-editable="events[${index}].date">${event.date}</span></p>` : ''}
                    ${event.time ? `<p class="event-time"><i class="icon-time"></i> <span data-editable="events[${index}].time">${event.time}</span></p>` : ''}
                    ${event.location ? `<p class="event-location"><i class="icon-location"></i> <span data-editable="events[${index}].location">${event.location}</span></p>` : ''}
                    ${event.ticket ? `<p class="event-ticket"><i class="icon-ticket"></i> <span data-editable="events[${index}].ticket">${event.ticket}</span></p>` : ''}
                    ${event.description ? `<p class="event-desc" data-editable="events[${index}].description">${event.description}</p>` : ''}
                    ${event.buttonText && event.link ? 
                        `<a href="${event.link}" class="event-btn" data-editable="events[${index}].buttonText">${event.buttonText}</a>` : ''}
                </div>
            </div>
        `).join('');

        // 存储所有事件数据供load more使用
        container.dataset.allEvents = JSON.stringify(events);
        container.dataset.showing = initialCount;

        // 显示/隐藏load more按钮
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
            loadMoreBtn.onclick = function() {
                const currentShowing = parseInt(container.dataset.showing);
                const allEvents = JSON.parse(container.dataset.allEvents);
                const nextBatch = allEvents.slice(currentShowing, currentShowing + 3);

                nextBatch.forEach((event, idx) => {
                    const realIndex = currentShowing + idx;
                    const card = document.createElement('div');
                    card.className = 'event-card';
                    card.innerHTML = `
                        <div class="event-poster">
                            <img src="${event.poster || './image/default-event.jpg'}" alt="${event.title || ''}">
                            ${event.ontour ? '<span class="badge ontour">ON TOUR</span>' : ''}
                            ${event.soldout ? '<span class="badge soldout">SOLD OUT</span>' : ''}
                        </div>
                        <div class="event-info">
                            ${event.title ? `<h3>${event.title}</h3>` : ''}
                            ${event.date ? `<p class="event-date"><i class="icon-calendar"></i> ${event.date}</p>` : ''}
                            ${event.time ? `<p class="event-time"><i class="icon-time"></i> ${event.time}</p>` : ''}
                            ${event.location ? `<p class="event-location"><i class="icon-location"></i> ${event.location}</p>` : ''}
                            ${event.ticket ? `<p class="event-ticket"><i class="icon-ticket"></i> ${event.ticket}</p>` : ''}
                            ${event.description ? `<p class="event-desc">${event.description}</p>` : ''}
                            ${event.buttonText && event.link ? `<a href="${event.link}" class="event-btn">${event.buttonText}</a>` : ''}
                        </div>
                    `;
                    container.appendChild(card);
                });

                container.dataset.showing = currentShowing + nextBatch.length;
                if (container.dataset.showing >= allEvents.length) {
                    loadMoreBtn.style.display = 'none';
                }
            };
        }
    }

    // 渲染Partners Banners
    function renderPartnersBanners(data) {
        if (!data || !data.banners) return;

        data.banners.forEach((banner, index) => {
            const container = document.getElementById(`partner-banner-${index + 1}`);
            if (!container) return;

            // 根据banner类型渲染
            if (index === 0) {
                // Banner 1: 手机+文字布局
                container.innerHTML = `
                    <div class="banner1-content">
                        ${banner.phoneImage ? `<img src="${banner.phoneImage}" class="phone-mockup" alt="Phone">` : ''}
                        <div class="banner1-text">
                            ${banner.logo ? `<img src="${banner.logo}" class="banner-logo" alt="Logo">` : ''}
                            ${banner.title ? `<h2 data-editable="banners[${index}].title">${banner.title}</h2>` : ''}
                            ${banner.description ? `<p data-editable="banners[${index}].description">${banner.description}</p>` : ''}
                            ${banner.buttonText && banner.buttonLink ? 
                                `<a href="${banner.buttonLink}" class="banner-btn" data-editable="banners[${index}].buttonText">${banner.buttonText}</a>` : ''}
                        </div>
                    </div>
                `;
            } else {
                // Banner 2-4: 背景图+Logo+文字
                container.style.backgroundImage = banner.background ? `url(${banner.background})` : '';
                container.innerHTML = `
                    <div class="banner-content-wrapper">
                        ${banner.logo ? `<img src="${banner.logo}" class="partner-logo" alt="Partner Logo">` : ''}
                        ${banner.title ? `<h2 data-editable="banners[${index}].title">${banner.title}</h2>` : ''}
                        ${banner.description ? `<p data-editable="banners[${index}].description">${banner.description}</p>` : ''}
                        ${banner.buttonText && banner.buttonLink ? 
                            `<a href="${banner.buttonLink}" class="banner-btn" data-editable="banners[${index}].buttonText">${banner.buttonText}</a>` : ''}
                    </div>
                `;
            }
        });
    }

    // 渲染Collaborators
    function renderCollaborators(data) {
        const container = document.getElementById('collaborators-container');
        if (!container || !data || !data.logos) return;

        container.innerHTML = data.logos.map((logo, index) => `
            <div class="collaborator-item">
                ${logo.link ? `<a href="${logo.link}" target="_blank">` : ''}
                    <img src="${logo.image || ''}" alt="${logo.name || 'Partner'}" data-editable="logos[${index}].image">
                ${logo.link ? '</a>' : ''}
            </div>
        `).join('');
    }

    // 渲染底部
    function renderFooter(data) {
        if (!data) return;

        // Copyright
        const copyright = document.getElementById('footer-copyright');
        if (copyright && data.copyright) {
            copyright.innerHTML = data.copyright;
        }

        // 社交链接
        const socialContainer = document.getElementById('footer-social');
        if (socialContainer && data.social) {
            socialContainer.innerHTML = data.social.map((item, index) => `
                <a href="${item.link || '#'}" class="social-link" target="_blank" data-editable="social[${index}].link">
                    <img src="${item.icon || ''}" alt="${item.name || ''}" data-editable="social[${index}].icon">
                </a>
            `).join('');
        }

        // Producer logo
        const producer = document.getElementById('footer-producer');
        if (producer && data.producer) {
            producer.innerHTML = `<img src="${data.producer}" alt="EMANON ENTERTAINMENT">`;
        }
    }

    // 主加载函数
    window.loadAndRender = async function(pageType) {
        console.log('Loading data for page:', pageType);
        const config = pageConfig[pageType];
        if (!config) return;

        // 加载并渲染各个部分
        if (config.banners === true) {
            const data = await loadJSON('banners');
            if (data) renderBanners(data);
        } else if (config.banners) {
            const data = await loadJSON(config.banners);
            if (data) renderPartnersBanners(data);
        }

        if (config.posters) {
            const data = await loadJSON(config.posters);
            if (data) renderPosters(data, pageType);
        }

        if (config.carousel) {
            const data = await loadJSON('events-carousel');
            if (data) renderCarousel(data);
        }

        if (config.managed) {
            const data = await loadJSON('events-managed');
            if (data) renderManagedEvents(data);
        }

        if (config.collaborators) {
            const data = await loadJSON('collaborators');
            if (data) renderCollaborators(data);
        }

        if (config.footer) {
            const data = await loadJSON(config.footer);
            if (data) renderFooter(data);
        }
    };

    // 海报2轮播初始化
    function initPoster2Carousel(slideCount) {
        let current = 0;
        const slides = document.querySelectorAll('#poster2-container .carousel-slide');
        if (slides.length <= 1) return;

        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slideCount;
            slides[current].classList.add('active');
        }, 5000);
    }

    console.log('LiveGigs Data Loader loaded successfully');
})();
