/**
 * LiveGigs Asia - Data Loader (Enhanced Auto-Sync Version)
 * 增强功能：
 * 1. 自动检测数据更新（每30秒检查一次）
 * 2. 防缓存机制（时间戳）
 * 3. 后台更新后前端自动刷新
 * 4. 页面可见性检测（切换回页面时刷新）
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        dataPath: './content/',
        // 防缓存时间戳
        cacheBuster: '?v=' + Date.now(),
        // 自动检查更新间隔（毫秒）
        checkInterval: 30000, // 30秒
        // 请求超时
        timeout: 10000,
        // 调试模式
        debug: true
    };

    // 存储上次数据哈希（用于检测变化）
    let lastDataHash = '';
    let checkIntervalId = null;

    // 页面配置映射
    const PAGE_CONFIG = {
        'index': {
            files: ['banners.json', 'index-posters.json', 'footer-global.json'],
            init: initIndexPage
        },
        'cn': {
            files: ['banners.json', 'cn-posters.json', 'footer-cn.json'],
            init: initCnPage
        },
        'events': {
            files: ['events-carousel.json', 'events-managed.json', 'events-posters.json', 'footer-global.json'],
            init: initEventsPage
        },
        'partners': {
            files: ['partners-banners.json', 'collaborators.json', 'footer-global.json'],
            init: initPartnersPage
        },
        'privacy': {
            files: ['footer-global.json'],
            init: initFooterOnly
        },
        'accessibility': {
            files: ['footer-global.json'],
            init: initFooterOnly
        }
    };

    // 日志函数
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[LiveGigs]', ...args);
        }
    }

    // 工具函数：加载JSON（带防缓存）
    async function loadJSON(filename, useCacheBuster = true) {
        try {
            const cacheParam = useCacheBuster ? ('?v=' + Date.now()) : '';
            const url = CONFIG.dataPath + filename + cacheParam;

            log('Loading:', url);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[LiveGigs] Error loading', filename, error);
            return null;
        }
    }

    // 计算数据哈希（用于检测变化）
    function getDataHash(data) {
        return JSON.stringify(data).length + '-' + JSON.stringify(data).split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    }

    // 工具函数：安全设置文本内容
    function setText(element, value, defaultValue = '') {
        if (element && value !== undefined && value !== null && value !== '') {
            element.textContent = value;
            element.style.display = '';
        } else if (element && defaultValue) {
            element.textContent = defaultValue;
        } else if (element) {
            element.style.display = 'none';
        }
    }

    // 工具函数：安全设置链接
    function setLink(element, url, openNewWindow = true) {
        if (element && url) {
            element.href = url;
            if (openNewWindow) {
                element.target = '_blank';
                element.rel = 'noopener noreferrer';
            }
            element.style.display = '';
        } else if (element) {
            element.style.display = 'none';
        }
    }

    // 工具函数：安全设置图片
    function setImage(element, src, alt = '') {
        if (element && src) {
            element.src = src;
            element.alt = alt;
            element.style.display = '';
            element.onerror = function() {
                this.style.display = 'none';
            };
        } else if (element) {
            element.style.display = 'none';
        }
    }

    // ========== 页面初始化函数 ==========

    function initIndexPage(data) {
        log('Initializing Index page');

        const banners = data['banners.json'];
        const posters = data['index-posters.json'];
        const footer = data['footer-global.json'];

        if (banners && banners.banners) {
            initBannerCarousel(banners.banners, 'index');
        }

        if (posters && posters.posters) {
            initPosters(posters.posters, 'index');
        }

        if (footer) {
            initFooter(footer, 'global');
        }
    }

    function initCnPage(data) {
        log('Initializing CN page');

        const banners = data['banners.json'];
        const posters = data['cn-posters.json'];
        const footer = data['footer-cn.json'];

        if (banners && banners.banners) {
            initBannerCarousel(banners.banners, 'cn');
        }

        if (posters && posters.posters) {
            initPosters(posters.posters, 'cn');
        }

        if (footer) {
            initFooter(footer, 'cn');
        }
    }

    function initEventsPage(data) {
        log('Initializing Events page');

        const carousel = data['events-carousel.json'];
        const managed = data['events-managed.json'];
        const posters = data['events-posters.json'];
        const footer = data['footer-global.json'];

        if (carousel && carousel.items) {
            initEventsCarousel(carousel.items);
        }

        if (managed && managed.events) {
            initManagedEvents(managed.events);
        }

        if (posters && posters.posters) {
            initEventsPosters(posters.posters);
        }

        if (footer) {
            initFooter(footer, 'global');
        }
    }

    function initPartnersPage(data) {
        log('Initializing Partners page');

        const banners = data['partners-banners.json'];
        const collaborators = data['collaborators.json'];
        const footer = data['footer-global.json'];

        if (banners && banners.banners) {
            initPartnersBanners(banners.banners);
        }

        if (collaborators && collaborators.logos) {
            initCollaborators(collaborators.logos);
        }

        if (footer) {
            initFooter(footer, 'global');
        }
    }

    function initFooterOnly(data) {
        log('Initializing Footer only');
        const footer = data['footer-global.json'];
        if (footer) {
            initFooter(footer, 'global');
        }
    }

    // ========== 组件初始化函数 ==========

    function initBannerCarousel(banners, pageType) {
        log('Init Banner Carousel:', banners.length, 'items');

        const container = document.querySelector('#hero-banner, .hero-banner, .banner-container, #banner-container');
        if (!container) {
            log('Banner container not found');
            return;
        }

        // 保存当前轮播索引（如果存在）
        let currentIndex = 0;
        const existingSlides = container.querySelectorAll('.banner-slide');
        existingSlides.forEach((slide, idx) => {
            if (slide.classList.contains('active')) currentIndex = idx;
        });

        container.innerHTML = '';

        banners.forEach((banner, index) => {
            const slide = document.createElement('div');
            slide.className = 'banner-slide';
            slide.dataset.index = index;
            if (index === currentIndex || (currentIndex === 0 && index === 0)) {
                slide.classList.add('active');
            }

            if (banner.image) {
                slide.style.backgroundImage = `url(${banner.image})`;
            }

            const content = document.createElement('div');
            content.className = 'banner-content';

            if (banner.title) {
                const title = document.createElement('h2');
                title.className = 'banner-title';
                title.textContent = banner.title;
                content.appendChild(title);
            }

            if (banner.buttonText && banner.link) {
                const btn = document.createElement('a');
                btn.className = 'banner-btn';
                btn.textContent = banner.buttonText;
                btn.href = banner.link;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer';
                content.appendChild(btn);
            }

            slide.appendChild(content);
            container.appendChild(slide);
        });

        // 启动轮播
        if (banners.length > 1 && !container.dataset.carouselInitialized) {
            container.dataset.carouselInitialized = 'true';
            startBannerCarousel(container, banners.length);
        }
    }

    function startBannerCarousel(container, totalSlides) {
        let current = 0;
        setInterval(() => {
            const slides = container.querySelectorAll('.banner-slide');
            if (slides.length === 0) return;

            slides[current].classList.remove('active');
            current = (current + 1) % totalSlides;
            slides[current].classList.add('active');
        }, 5000);
    }

    function initPosters(posters, pageType) {
        log('Init Posters:', posters.length, 'items');

        posters.forEach((poster, index) => {
            const container = document.querySelector(`#poster-${index + 1}, .poster-${index + 1}, [data-poster="${index + 1}"]`);
            if (!container) return;

            const img = container.querySelector('img, .poster-image');
            setImage(img, poster.image, poster.title || '');

            const title = container.querySelector('.poster-title, h3, h4');
            setText(title, poster.title);

            const btn = container.querySelector('a, .poster-btn, .btn');
            if (btn && poster.buttonText && poster.link) {
                btn.textContent = poster.buttonText;
                setLink(btn, poster.link, true);
            } else if (btn && (!poster.buttonText || !poster.link)) {
                btn.style.display = 'none';
            }
        });
    }

    function initEventsPosters(posters) {
        log('Init Events Posters:', posters.length, 'items');

        posters.forEach((poster, index) => {
            const posterNum = index + 1;
            const container = document.querySelector(`#poster-${posterNum}, .poster-${posterNum}, [data-poster="${posterNum}"]`);
            if (!container) return;

            if (posterNum === 2 && poster.slides && poster.slides.length > 1) {
                initPoster2Carousel(container, poster.slides);
            } else {
                const img = container.querySelector('img, .poster-image');
                setImage(img, poster.image || (poster.slides && poster.slides[0] && poster.slides[0].image), poster.title || '');

                const title = container.querySelector('.poster-title, h3, h4');
                setText(title, poster.title);

                const btn = container.querySelector('a, .poster-btn, .btn');
                if (btn && poster.buttonText && poster.link) {
                    btn.textContent = poster.buttonText;
                    setLink(btn, poster.link, true);
                }
            }
        });
    }

    function initPoster2Carousel(container, slides) {
        log('Init Poster2 Carousel:', slides.length, 'slides');

        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'poster-carousel';

        slides.forEach((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'poster-carousel-slide';
            if (index === 0) slideDiv.classList.add('active');

            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.title || '';
            slideDiv.appendChild(img);

            if (slide.title) {
                const title = document.createElement('h4');
                title.className = 'poster-slide-title';
                title.textContent = slide.title;
                slideDiv.appendChild(title);
            }

            if (slide.buttonText && slide.link) {
                const btn = document.createElement('a');
                btn.className = 'poster-slide-btn';
                btn.textContent = slide.buttonText;
                btn.href = slide.link;
                btn.target = '_blank';
                slideDiv.appendChild(btn);
            }

            carouselContainer.appendChild(slideDiv);
        });

        container.innerHTML = '';
        container.appendChild(carouselContainer);

        if (slides.length > 1 && !container.dataset.carouselInitialized) {
            container.dataset.carouselInitialized = 'true';
            let current = 0;
            setInterval(() => {
                const slideEls = carouselContainer.querySelectorAll('.poster-carousel-slide');
                if (slideEls.length === 0) return;
                slideEls[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slideEls[current].classList.add('active');
            }, 4000);
        }
    }

    function initEventsCarousel(items) {
        log('Init Events Carousel:', items.length, 'items');

        const container = document.querySelector('#events-carousel, .events-carousel, .carousel-container');
        if (!container) return;

        container.innerHTML = '';

        items.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            if (index === 0) slide.classList.add('active');

            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.title || '';
                slide.appendChild(img);
            }

            const content = document.createElement('div');
            content.className = 'carousel-content';

            if (item.title) {
                const title = document.createElement('h3');
                title.textContent = item.title;
                content.appendChild(title);
            }

            if (item.date || item.time || item.location) {
                const meta = document.createElement('p');
                meta.className = 'carousel-meta';
                meta.textContent = [item.date, item.time, item.location].filter(Boolean).join(' | ');
                content.appendChild(meta);
            }

            if (item.details) {
                const details = document.createElement('p');
                details.className = 'carousel-details';
                details.textContent = item.details;
                content.appendChild(details);
            }

            if (item.link) {
                const link = document.createElement('a');
                link.href = item.link;
                link.target = '_blank';
                link.textContent = item.buttonText || 'View Details →';
                content.appendChild(link);
            }

            slide.appendChild(content);
            container.appendChild(slide);
        });

        if (items.length > 1 && !container.dataset.carouselInitialized) {
            container.dataset.carouselInitialized = 'true';
            let current = 0;
            setInterval(() => {
                const slides = container.querySelectorAll('.carousel-slide');
                if (slides.length === 0) return;
                slides[current].classList.remove('active');
                current = (current + 1) % items.length;
                slides[current].classList.add('active');
            }, 5000);
        }
    }

    function initManagedEvents(events) {
        log('Init Managed Events:', events.length, 'events');

        const container = document.querySelector('#managed-events, .managed-events, .events-grid');
        if (!container) return;

        container.innerHTML = '';

        const displayCount = Math.min(events.length, 3);
        const hasMore = events.length > 3;

        events.slice(0, displayCount).forEach(event => {
            const card = createEventCard(event);
            container.appendChild(card);
        });

        // 移除旧的Load More按钮
        const oldBtn = container.parentNode.querySelector('.load-more-btn');
        if (oldBtn) oldBtn.remove();

        if (hasMore) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.onclick = () => {
                events.slice(3).forEach(event => {
                    const card = createEventCard(event);
                    card.style.animation = 'fadeIn 0.5s ease';
                    container.appendChild(card);
                });
                loadMoreBtn.style.display = 'none';
            };
            container.parentNode.appendChild(loadMoreBtn);
        }
    }

    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        if (event.poster) {
            const img = document.createElement('img');
            img.src = event.poster;
            img.alt = event.title || '';
            img.className = 'event-poster';
            card.appendChild(img);
        }

        if (event.ontour || event.soldout) {
            const badge = document.createElement('span');
            badge.className = 'event-badge';
            badge.textContent = event.soldout ? 'SOLD OUT' : 'ON TOUR';
            card.appendChild(badge);
        }

        if (event.title) {
            const title = document.createElement('h3');
            title.className = 'event-title';
            title.textContent = event.title;
            card.appendChild(title);
        }

        const details = document.createElement('div');
        details.className = 'event-details';

        if (event.date) {
            const date = document.createElement('p');
            date.innerHTML = `<strong>Date:</strong> ${event.date}`;
            details.appendChild(date);
        }

        if (event.time) {
            const time = document.createElement('p');
            time.innerHTML = `<strong>Time:</strong> ${event.time}`;
            details.appendChild(time);
        }

        if (event.location) {
            const loc = document.createElement('p');
            loc.innerHTML = `<strong>Location:</strong> ${event.location}`;
            details.appendChild(loc);
        }

        if (event.ticket) {
            const ticket = document.createElement('p');
            ticket.innerHTML = `<strong>Ticket:</strong> ${event.ticket}`;
            details.appendChild(ticket);
        }

        card.appendChild(details);

        if (event.buttonText && event.link) {
            const btn = document.createElement('a');
            btn.className = 'event-btn';
            btn.textContent = event.buttonText;
            btn.href = event.link;
            btn.target = '_blank';
            card.appendChild(btn);
        }

        return card;
    }

    function initPartnersBanners(banners) {
        log('Init Partners Banners:', banners.length, 'banners');

        banners.forEach((banner, index) => {
            const bannerNum = index + 1;
            const container = document.querySelector(`#partner-banner-${bannerNum}, .partner-banner-${bannerNum}, [data-partner-banner="${bannerNum}"]`);
            if (!container) return;

            if (banner.backgroundImage) {
                container.style.backgroundImage = `url(${banner.backgroundImage})`;
            }

            const logo = container.querySelector('.banner-logo, .partner-logo, img');
            setImage(logo, banner.logo, banner.title || '');

            const title = container.querySelector('.banner-title, h2, h3');
            setText(title, banner.title);

            const details = container.querySelector('.banner-details, .details, p');
            setText(details, banner.details);

            const btn = container.querySelector('a, .banner-btn, .btn');
            if (btn && banner.buttonText && banner.link) {
                btn.textContent = banner.buttonText;
                setLink(btn, banner.link, true);
            } else if (btn && (!banner.buttonText || !banner.link)) {
                btn.style.display = 'none';
            }
        });
    }

    function initCollaborators(logos) {
        log('Init Collaborators:', logos.length, 'logos');

        const container = document.querySelector('#collaborators, .collaborators, .partners-logos');
        if (!container) return;

        container.innerHTML = '';

        logos.forEach(logo => {
            const item = document.createElement('div');
            item.className = 'collaborator-item';

            const img = document.createElement('img');
            img.src = logo.image;
            img.alt = logo.name || '';
            img.className = 'collaborator-logo';

            if (logo.link) {
                const link = document.createElement('a');
                link.href = logo.link;
                link.target = '_blank';
                link.appendChild(img);
                item.appendChild(link);
            } else {
                item.appendChild(img);
            }

            if (logo.name) {
                const name = document.createElement('p');
                name.className = 'collaborator-name';
                name.textContent = logo.name;
                item.appendChild(name);
            }

            container.appendChild(item);
        });
    }

    function initFooter(footer, type) {
        log('Init Footer:', type);

        const logo = document.querySelector('#footer-logo, .footer-logo');
        if (logo && footer.logoText) {
            logo.textContent = footer.logoText;
        }

        const socialContainer = document.querySelector('#footer-social, .footer-social, #socialContainer');
        if (socialContainer && footer.socialMedia) {
            socialContainer.innerHTML = '';

            footer.socialMedia.forEach(social => {
                if (!social.icon && !social.name) return;

                const link = document.createElement('a');
                link.className = 'social-icon';
                link.href = social.link || '#';
                link.target = '_blank';
                link.title = social.name || '';

                const img = document.createElement('img');
                if (social.icon) {
                    img.src = social.icon;
                } else {
                    img.src = getDefaultSocialIcon(social.name);
                }
                img.alt = social.name || '';
                img.onerror = function() {
                    this.style.display = 'none';
                    link.textContent = social.name ? social.name.charAt(0).toUpperCase() : '?';
                    link.style.display = 'flex';
                    link.style.alignItems = 'center';
                    link.style.justifyContent = 'center';
                    link.style.background = '#8b0000';
                    link.style.color = '#fff';
                    link.style.borderRadius = '50%';
                    link.style.width = '44px';
                    link.style.height = '44px';
                    link.style.textDecoration = 'none';
                    link.style.fontWeight = 'bold';
                };

                link.appendChild(img);
                socialContainer.appendChild(link);
            });
        }

        const copyright = document.querySelector('#footer-copyright, .footer-copyright, .copyright');
        setText(copyright, footer.copyright);

        const producer = document.querySelector('#footer-producer, .footer-producer, .producer-logo');
        if (producer && footer.producerLogo) {
            const img = producer.querySelector('img') || document.createElement('img');
            img.src = footer.producerLogo;
            img.alt = 'Producer';
            if (!producer.querySelector('img')) {
                producer.appendChild(img);
            }
        }
    }

    function getDefaultSocialIcon(name) {
        const icons = {
            'facebook': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            'instagram': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            'youtube': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            'twitter': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'x': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'weibo': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.389-1.061.428-1.979.003-2.634-.793-1.273-2.944-1.206-5.417-.034 0 0-.777.34-.578-.274.383-1.217.324-2.229-.27-2.817-1.344-1.332-4.918.045-7.99 3.073C1.87 10.963.917 13.511.917 15.614c0 4.042 5.172 6.505 10.229 6.505 6.61 0 11.007-3.86 11.007-6.912 0-1.848-1.566-2.898-2.94-3.558z"/></svg>',
            'xiaohongshu': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5h-9a1.5 1.5 0 0 1-1.5-1.5V9a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 9v6a1.5 1.5 0 0 1-1.5 1.5z"/></svg>',
            'wechat': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            'miniprogram': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-1 5v4H7v2h4v4h2v-4h4v-2h-4V7h-2z"/></svg>'
        };

        return icons[name.toLowerCase()] || icons['facebook'];
    }

    // ========== 自动刷新机制 ==========

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

    // 加载并初始化
    async function loadAndRender() {
        const pageType = detectPageType();
        log('Page type detected:', pageType);

        const config = PAGE_CONFIG[pageType];
        if (!config) {
            console.error('[LiveGigs] Unknown page type:', pageType);
            return;
        }

        const data = {};
        for (const file of config.files) {
            data[file] = await loadJSON(file);
        }

        // 计算数据哈希
        const currentHash = getDataHash(data);

        // 如果数据变化了，重新渲染
        if (currentHash !== lastDataHash) {
            log('Data changed, re-rendering...');
            lastDataHash = currentHash;
            config.init(data);

            // 显示更新提示（可选）
            if (document.visibilityState === 'visible') {
                showUpdateNotification();
            }
        } else {
            log('Data unchanged');
        }
    }

    // 显示更新提示
    function showUpdateNotification() {
        // 检查是否已经有提示
        if (document.getElementById('livegigs-update-notice')) return;

        const notice = document.createElement('div');
        notice.id = 'livegigs-update-notice';
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #8b0000;
            color: #c0c0c0;
            padding: 15px 25px;
            border-radius: 5px;
            font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;
        notice.textContent = '内容已更新';

        // 添加动画样式
        if (!document.getElementById('livegigs-animations')) {
            const style = document.createElement('style');
            style.id = 'livegigs-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notice);

        // 3秒后自动消失
        setTimeout(() => {
            notice.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => notice.remove(), 500);
        }, 3000);
    }

    // 启动自动检查
    function startAutoCheck() {
        // 立即执行一次
        loadAndRender();

        // 定期检查结果
        checkIntervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadAndRender();
            }
        }, CONFIG.checkInterval);

        log('Auto-check started, interval:', CONFIG.checkInterval, 'ms');
    }

    // 页面可见性变化时刷新
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            log('Page visible, checking for updates...');
            loadAndRender();
        }
    });

    // 页面加载完成后启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAutoCheck);
    } else {
        startAutoCheck();
    }

    // 暴露全局接口
    window.LiveGigsData = {
        reload: loadAndRender,
        config: CONFIG,
        getData: async (filename) => await loadJSON(filename),
        stopAutoCheck: () => {
            if (checkIntervalId) {
                clearInterval(checkIntervalId);
                log('Auto-check stopped');
            }
        },
        startAutoCheck: startAutoCheck
    };

})();
