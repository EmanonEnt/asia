// LiveGigs Data Loader - 修复版
// 使用相对路径避免CORS问题

(function() {
    'use strict';

    // 配置 - 使用相对路径
    const CONFIG = {
        baseUrl: './content',
        cacheBust: true
    };

    // 页面配置映射
    const PAGE_CONFIG = {
        'index': {
            banners: 'banners.json',
            posters: 'posters-index.json',
            footer: 'footer-global.json'
        },
        'cn': {
            banners: 'banners.json',
            posters: 'posters-cn.json',
            footer: 'footer-cn.json'
        },
        'events': {
            carousel: 'events-carousel.json',
            managed: 'events-managed.json',
            posters: 'posters-events.json',
            footer: 'footer-global.json'
        },
        'partners': {
            banners: 'partners-banners.json',
            collaborators: 'collaborators.json',
            footer: 'footer-global.json'
        },
        'privacy': {
            footer: 'footer-global.json'
        },
        'accessibility': {
            footer: 'footer-global.json'
        }
    };

    // 获取当前页面类型
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('cn')) return 'cn';
        if (path.includes('events')) return 'events';
        if (path.includes('partners')) return 'partners';
        if (path.includes('privacy')) return 'privacy';
        if (path.includes('accessibility')) return 'accessibility';
        return 'index';
    }

    // 带缓存清除的fetch
    async function fetchJSON(filename) {
        try {
            const url = CONFIG.cacheBust ? 
                `${CONFIG.baseUrl}/${filename}?t=${Date.now()}` : 
                `${CONFIG.baseUrl}/${filename}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 安全设置文本内容
    function setText(selector, text, parent = document) {
        const el = parent.querySelector(selector);
        if (el && text) el.textContent = text;
    }

    // 安全设置HTML内容
    function setHTML(selector, html, parent = document) {
        const el = parent.querySelector(selector);
        if (el && html) el.innerHTML = html;
    }

    // 安全设置属性
    function setAttr(selector, attr, value, parent = document) {
        const el = parent.querySelector(selector);
        if (el && value) el.setAttribute(attr, value);
    }

    // 安全设置图片
    function setImage(selector, src, parent = document) {
        const el = parent.querySelector(selector);
        if (el && src) {
            el.src = src;
            el.onerror = function() {
                this.style.display = 'none';
            };
        }
    }

    // 设置链接（新窗口打开）
    function setLink(selector, href, parent = document) {
        const el = parent.querySelector(selector);
        if (el && href) {
            el.href = href;
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    }

    // 渲染Banner区域
    function renderBanners(data) {
        if (!data || !data.banners) return;

        data.banners.forEach((banner, index) => {
            const i = index + 1;

            // 背景图
            setImage(`#banner${i}-bg`, banner.image);
            setImage(`.banner${i}-bg`, banner.image);

            // Logo图（针对特定banner）
            setImage(`#banner${i}-logo`, banner.logo);
            setImage(`.banner${i}-logo`, banner.logo);

            // 手机图（banner1专用）
            setImage(`#banner1-phone`, banner.phoneImage);

            // 标题
            setText(`#banner${i}-title`, banner.title);
            setText(`.banner${i}-title`, banner.title);
            setHTML(`#banner${i}-subtitle`, banner.subtitle);
            setHTML(`.banner${i}-subtitle`, banner.subtitle);

            // 详情文字
            setText(`#banner${i}-desc`, banner.description);
            setText(`.banner${i}-desc`, banner.description);

            // 按钮
            setText(`#banner${i}-btn`, banner.buttonText);
            setText(`.banner${i}-btn`, banner.buttonText);
            setLink(`#banner${i}-link`, banner.buttonLink);
            setLink(`.banner${i}-link`, banner.buttonLink);
        });
    }

    // 渲染海报区域
    function renderPosters(data) {
        if (!data || !data.posters) return;

        data.posters.forEach((poster, index) => {
            const i = index + 1;

            // 海报图片
            setImage(`#poster${i}-img`, poster.image);
            setImage(`.poster${i}-img`, poster.image);

            // 标题
            setText(`#poster${i}-title`, poster.title);
            setText(`.poster${i}-title`, poster.title);

            // 按钮文字
            setText(`#poster${i}-btn`, poster.buttonText);
            setText(`.poster${i}-btn`, poster.buttonText);

            // 链接（新窗口打开）
            setLink(`#poster${i}-link`, poster.link);
            setLink(`.poster${i}-link`, poster.link);
            setLink(`#poster${i}-btn`, poster.link);
            setLink(`.poster${i}-btn`, poster.link);
        });

        // 处理海报2滚播（如果启用）
        if (data.poster2Carousel && data.poster2Carousel.enabled) {
            renderPoster2Carousel(data.poster2Carousel.slides);
        }
    }

    // 渲染海报2滚播
    function renderPoster2Carousel(slides) {
        if (!slides || slides.length === 0) return;

        const container = document.querySelector('#poster2-carousel') || 
                         document.querySelector('.poster2-carousel') ||
                         document.querySelector('.poster-slider');

        if (!container) return;

        // 生成滚播HTML
        let html = '';
        slides.forEach((slide, index) => {
            html += `
                <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${slide.image}" alt="${slide.title}" onerror="this.style.display='none'">
                    <div class="poster-content">
                        <h3>${slide.title || ''}</h3>
                        <a href="${slide.link || '#'}" target="_blank" rel="noopener noreferrer" class="poster-btn">
                            ${slide.buttonText || 'View Details'}
                        </a>
                    </div>
                </div>
            `;
        });

        // 添加导航按钮
        if (slides.length > 1) {
            html += `
                <button class="carousel-prev" onclick="moveCarousel(-1)">❮</button>
                <button class="carousel-next" onclick="moveCarousel(1)">❯</button>
                <div class="carousel-dots">
                    ${slides.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></span>`).join('')}
                </div>
            `;
        }

        container.innerHTML = html;

        // 初始化自动滚播
        initCarousel(slides.length);
    }

    // 滚播控制变量
    let carouselInterval;
    let currentSlide = 0;

    // 初始化滚播
    function initCarousel(totalSlides) {
        if (totalSlides <= 1) return;

        // 自动轮播
        carouselInterval = setInterval(() => {
            moveCarousel(1);
        }, 5000);

        // 暴露全局函数
        window.moveCarousel = function(direction) {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.carousel-dots .dot');

            slides[currentSlide].classList.remove('active');
            if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

            currentSlide = (currentSlide + direction + totalSlides) % totalSlides;

            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        };

        window.goToSlide = function(index) {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.carousel-dots .dot');

            slides[currentSlide].classList.remove('active');
            if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

            currentSlide = index;

            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        };
    }

    // 渲染Events自主活动
    function renderEventsManaged(data) {
        if (!data || !data.events) return;

        const container = document.querySelector('#events-managed') || 
                         document.querySelector('.events-managed') ||
                         document.querySelector('.events-grid');

        if (!container) return;

        const events = data.events;
        const showLoadMore = events.length > 3;
        const displayEvents = events.slice(0, 3); // 先显示3个

        let html = '';
        displayEvents.forEach((event, index) => {
            html += `
                <div class="event-card" data-index="${index}">
                    <div class="event-image">
                        <img src="${event.image || ''}" alt="${event.title}" onerror="this.style.display='none'">
                        ${event.status ? `<span class="event-status ${event.status}">${event.status}</span>` : ''}
                    </div>
                    <div class="event-info">
                        <h3>${event.title || ''}</h3>
                        <p class="event-date">${event.date || ''}</p>
                        <p class="event-location">${event.location || ''}</p>
                        <p class="event-time">${event.time || ''}</p>
                        <p class="event-details">${event.details || ''}</p>
                        <a href="${event.link || '#'}" target="_blank" rel="noopener noreferrer" class="event-btn">
                            ${event.buttonText || 'Get Tickets'}
                        </a>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 添加Load More按钮
        if (showLoadMore) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.onclick = function() {
                // 显示剩余活动
                const remainingEvents = events.slice(3);
                remainingEvents.forEach(event => {
                    const card = document.createElement('div');
                    card.className = 'event-card';
                    card.innerHTML = `
                        <div class="event-image">
                            <img src="${event.image || ''}" alt="${event.title}" onerror="this.style.display='none'">
                            ${event.status ? `<span class="event-status ${event.status}">${event.status}</span>` : ''}
                        </div>
                        <div class="event-info">
                            <h3>${event.title || ''}</h3>
                            <p class="event-date">${event.date || ''}</p>
                            <p class="event-location">${event.location || ''}</p>
                            <p class="event-time">${event.time || ''}</p>
                            <p class="event-details">${event.details || ''}</p>
                            <a href="${event.link || '#'}" target="_blank" rel="noopener noreferrer" class="event-btn">
                                ${event.buttonText || 'Get Tickets'}
                            </a>
                        </div>
                    `;
                    container.appendChild(card);
                });
                this.style.display = 'none';
            };
            container.parentNode.appendChild(loadMoreBtn);
        }
    }

    // 渲染Events滚播海报
    function renderEventsCarousel(data) {
        if (!data || !data.slides) return;

        const container = document.querySelector('#events-carousel') || 
                         document.querySelector('.events-carousel');

        if (!container) return;

        let html = '';
        data.slides.forEach((slide, index) => {
            html += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${slide.image}" alt="${slide.title}" onerror="this.style.display='none'">
                    <div class="carousel-caption">
                        <h3>${slide.title || ''}</h3>
                        <p>${slide.time || ''}</p>
                        <p>${slide.location || ''}</p>
                        <p>${slide.details || ''}</p>
                        <a href="${slide.link || '#'}" target="_blank" rel="noopener noreferrer">Learn More</a>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // 渲染Partners Banner
    function renderPartnersBanners(data) {
        if (!data || !data.banners) return;

        data.banners.forEach((banner, index) => {
            const i = index + 1;

            // 背景图
            setImage(`#partner-banner${i}-bg`, banner.background);
            setImage(`.partner-banner${i}-bg`, banner.background);

            // Logo
            setImage(`#partner-banner${i}-logo`, banner.logo);
            setImage(`.partner-banner${i}-logo`, banner.logo);

            // 标题
            setText(`#partner-banner${i}-title`, banner.title);
            setText(`.partner-banner${i}-title`, banner.title);

            // 详情
            setText(`#partner-banner${i}-desc`, banner.description);
            setText(`.partner-banner${i}-desc`, banner.description);

            // 按钮
            setText(`#partner-banner${i}-btn`, banner.buttonText);
            setText(`.partner-banner${i}-btn`, banner.buttonText);
            setLink(`#partner-banner${i}-link`, banner.buttonLink);
            setLink(`.partner-banner${i}-link`, banner.buttonLink);
        });
    }

    // 渲染Collaborators
    function renderCollaborators(data) {
        if (!data || !data.logos) return;

        const container = document.querySelector('#collaborators') || 
                         document.querySelector('.collaborators-grid');

        if (!container) return;

        let html = '';
        data.logos.forEach(logo => {
            if (logo.link) {
                html += `
                    <a href="${logo.link}" target="_blank" rel="noopener noreferrer" class="collaborator-logo">
                        <img src="${logo.image}" alt="${logo.name}" onerror="this.style.display='none'">
                        <span>${logo.name || ''}</span>
                    </a>
                `;
            } else {
                html += `
                    <div class="collaborator-logo">
                        <img src="${logo.image}" alt="${logo.name}" onerror="this.style.display='none'">
                        <span>${logo.name || ''}</span>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    }

    // 渲染底部区域
    function renderFooter(data) {
        if (!data) return;

        // 标题
        setText('#footer-title', data.title);
        setText('.footer-title', data.title);

        // 联系信息
        setText('#footer-email', data.email);
        setText('.footer-email', data.email);
        setLink('#footer-email-link', `mailto:${data.email}`);

        setText('#footer-phone', data.phone);
        setText('.footer-phone', data.phone);
        setLink('#footer-phone-link', `tel:${data.phone}`);

        setText('#footer-address', data.address);
        setText('.footer-address', data.address);

        // 版权
        setText('#footer-copyright', data.copyright);
        setText('.copyright', data.copyright);

        // 社交媒体
        if (data.social && data.social.length > 0) {
            const socialContainer = document.querySelector('#socialContainer') || 
                                   document.querySelector('#footer-social') ||
                                   document.querySelector('.footer-social');

            if (socialContainer) {
                let html = '';
                data.social.forEach(item => {
                    const iconSvg = getSocialIcon(item.platform);
                    html += `
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" 
                           class="social-icon" title="${item.platform}">
                            ${iconSvg}
                        </a>
                    `;
                });
                socialContainer.innerHTML = html;
            }
        }

        // 制作单位Logo
        setImage('#producer-logo', data.producerLogo);
        setImage('.producer-logo img', data.producerLogo);
    }

    // 获取社交媒体图标SVG
    function getSocialIcon(platform) {
        const icons = {
            'facebook': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            'instagram': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            'youtube': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            'x': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'twitter': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'weibo': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.402-.649.386-1.031.426-1.922.008-2.557-.781-1.19-2.924-1.126-5.354-.034 0 0-.767.334-.571-.271.376-1.217.32-2.234-.266-2.822-1.331-1.335-4.869.047-7.91 3.087C1.167 10.845 0 13.071 0 15.012 0 18.618 4.387 21 8.677 21c5.631 0 9.381-3.264 9.381-5.856 0-1.571-1.326-2.462-1.999-2.495z"/></svg>',
            'xiaohongshu': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.615h-2.77v-4.615h-2.77v4.615H8.308V7.385h2.77v4.615h2.77V7.385h2.77v9.23z"/></svg>',
            'wechat': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            'miniprogram': '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        };

        return icons[platform.toLowerCase()] || icons['facebook'];
    }

    // 主加载函数
    async function loadAndRender(pageType) {
        const config = PAGE_CONFIG[pageType];
        if (!config) return;

        console.log(`Loading data for ${pageType}...`);

        // 加载所有需要的数据
        const promises = [];
        const data = {};

        if (config.banners) {
            promises.push(fetchJSON(config.banners).then(d => { data.banners = d; }));
        }
        if (config.posters) {
            promises.push(fetchJSON(config.posters).then(d => { data.posters = d; }));
        }
        if (config.carousel) {
            promises.push(fetchJSON(config.carousel).then(d => { data.carousel = d; }));
        }
        if (config.managed) {
            promises.push(fetchJSON(config.managed).then(d => { data.managed = d; }));
        }
        if (config.footer) {
            promises.push(fetchJSON(config.footer).then(d => { data.footer = d; }));
        }
        if (config.collaborators) {
            promises.push(fetchJSON(config.collaborators).then(d => { data.collaborators = d; }));
        }

        await Promise.all(promises);

        // 渲染各个区域
        if (data.banners) renderBanners(data.banners);
        if (data.posters) renderPosters(data.posters);
        if (data.carousel) renderEventsCarousel(data.carousel);
        if (data.managed) renderEventsManaged(data.managed);
        if (data.collaborators) renderCollaborators(data.collaborators);
        if (data.footer) renderFooter(data.footer);

        console.log(`Data loaded for ${pageType}`);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadAndRender(getCurrentPage());
        });
    } else {
        loadAndRender(getCurrentPage());
    }

    // 暴露全局函数供手动刷新
    window.LiveGigsData = {
        refresh: () => loadAndRender(getCurrentPage()),
        loadPage: loadAndRender
    };

})();
