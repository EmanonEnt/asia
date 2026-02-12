// LiveGigs Asia - 数据加载脚本
// 自动从GitHub Pages加载JSON数据并渲染到页面

(function() {
    'use strict';

    const CONFIG = {
        baseUrl: 'https://emanonent.github.io/asia/content',
        cacheBuster: true
    };

    // 页面类型检测
    function detectPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        if (filename === 'index.html' || filename === '' || filename === 'asia' || path.endsWith('/asia/')) {
            return 'index';
        } else if (filename === 'cn.html') {
            return 'cn';
        } else if (filename === 'events.html') {
            return 'events';
        } else if (filename === 'partners.html') {
            return 'partners';
        } else if (filename === 'privacypolicy.html') {
            return 'privacy';
        } else if (filename === 'accessibilitystatement.html') {
            return 'accessibility';
        }
        return 'index';
    }

    // 获取JSON数据
    async function fetchJSON(filename) {
        try {
            const url = CONFIG.cacheBuster 
                ? `${CONFIG.baseUrl}/${filename}?t=${Date.now()}` 
                : `${CONFIG.baseUrl}/${filename}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 渲染Banner
    function renderBanners(banners, pageType) {
        if (!banners || !Array.isArray(banners) || banners.length === 0) return;

        // 查找banner容器
        const bannerSection = document.querySelector('.hero-slides, .banner-section, #hero');
        if (!bannerSection) return;

        // 清空现有内容
        bannerSection.innerHTML = '';

        banners.forEach((banner, index) => {
            if (!banner.image) return;

            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            if (index === 0) slide.classList.add('active');

            const hasLink = banner.link && banner.link.trim() !== '';
            const linkStart = hasLink ? `<a href="${banner.link}" class="banner-link">` : '';
            const linkEnd = hasLink ? '</a>' : '';

            slide.innerHTML = `
                ${linkStart}
                <div class="slide-bg" style="background-image: url('${banner.image}')"></div>
                <div class="slide-content">
                    ${banner.title ? `<h2 class="slide-title">${banner.title}</h2>` : ''}
                    ${banner.button_text ? `<span class="slide-button">${banner.button_text}</span>` : ''}
                </div>
                ${linkEnd}
            `;

            bannerSection.appendChild(slide);
        });

        // 重新初始化轮播
        initCarousel();
    }

    // 渲染海报
    function renderPosters(posters, pageType) {
        if (!posters || !Array.isArray(posters)) return;

        posters.forEach((poster, index) => {
            // 查找海报元素
            const posterEl = document.querySelector(`[data-poster="${index + 1}"], .poster-${index + 1}, #poster-${index + 1}`);
            if (!posterEl) return;

            // 更新图片
            const img = posterEl.querySelector('img');
            if (img && poster.image) {
                img.src = poster.image;
                img.onerror = () => { img.style.display = 'none'; };
            }

            // 更新标题
            const title = posterEl.querySelector('.poster-title, h3, h4');
            if (title) {
                if (poster.title) {
                    title.textContent = poster.title;
                    title.style.display = '';
                } else {
                    title.style.display = 'none';
                }
            }

            // 更新链接
            const link = posterEl.querySelector('a');
            if (link) {
                if (poster.link) {
                    link.href = poster.link;
                    link.style.display = '';
                } else {
                    link.style.display = 'none';
                }

                // 更新链接文字
                const linkText = link.querySelector('.link-text, span');
                if (linkText && poster.link_text) {
                    linkText.textContent = poster.link_text;
                }
            }

            // 处理海报2滚播 (仅events页面)
            if (index === 1 && pageType === 'events' && poster.carousel && poster.carouselImages) {
                initPosterCarousel(posterEl, poster.carouselImages);
            }
        });
    }

    // 海报滚播初始化
    function initPosterCarousel(container, images) {
        if (!images || images.length < 2) return;

        let current = 0;
        const img = container.querySelector('img');
        if (!img) return;

        setInterval(() => {
            current = (current + 1) % images.length;
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = images[current];
                img.style.opacity = '1';
            }, 300);
        }, 3000);
    }

    // 渲染自主活动
    function renderEvents(events) {
        const container = document.querySelector('.events-grid, .events-list, #events-managed');
        if (!container) return;

        // 保存原始模板
        const template = container.querySelector('.event-card, .event-item');
        if (!template) return;

        const templateHTML = template.outerHTML;
        container.innerHTML = '';

        events.forEach((event, index) => {
            if (!event.image) return;

            const div = document.createElement('div');
            div.className = template.className;
            if (index >= 3) div.classList.add('hidden-event');

            const hasLink = event.link && event.link.trim() !== '';
            const statusBadge = event.status 
                ? `<span class="event-status ${event.status}">${event.status.toUpperCase()}</span>` 
                : '';

            div.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title || ''}" onerror="this.style.display='none'">
                    ${statusBadge}
                </div>
                <div class="event-info">
                    ${event.title ? `<h3>${event.title}</h3>` : ''}
                    ${event.date ? `<p class="event-date">${event.date}</p>` : ''}
                    ${event.location ? `<p class="event-location">${event.location}</p>` : ''}
                    ${event.time ? `<p class="event-time">${event.time}</p>` : ''}
                    ${event.ticket ? `<p class="event-ticket">${event.ticket}</p>` : ''}
                    ${event.description ? `<p class="event-desc">${event.description}</p>` : ''}
                    ${hasLink ? `<a href="${event.link}" class="event-button">${event.button_text || 'Get Tickets →'}</a>` : ''}
                </div>
            `;

            container.appendChild(div);
        });

        // 处理Load More按钮
        const loadMoreBtn = document.querySelector('.load-more-btn, #load-more');
        if (loadMoreBtn) {
            if (events.length <= 3) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = '';
                loadMoreBtn.onclick = () => {
                    document.querySelectorAll('.hidden-event').forEach(el => {
                        el.classList.remove('hidden-event');
                    });
                    loadMoreBtn.style.display = 'none';
                };
            }
        }
    }

    // 渲染滚播活动
    function renderCarousel(items) {
        const container = document.querySelector('.carousel-track, .carousel-slides');
        if (!container || !items || items.length === 0) return;

        container.innerHTML = '';

        items.forEach(item => {
            if (!item.image) return;

            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            const hasLink = item.link && item.link.trim() !== '';
            const linkStart = hasLink ? `<a href="${item.link}">` : '';
            const linkEnd = hasLink ? '</a>' : '';

            slide.innerHTML = `
                ${linkStart}
                <div class="carousel-image" style="background-image: url('${item.image}')"></div>
                <div class="carousel-content">
                    ${item.title ? `<h3>${item.title}</h3>` : ''}
                    ${item.time ? `<p>${item.time}</p>` : ''}
                    ${item.location ? `<p>${item.location}</p>` : ''}
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
                ${linkEnd}
            `;

            container.appendChild(slide);
        });

        initCarousel();
    }

    // 渲染合作伙伴Banner
    function renderPartnerBanners(banners) {
        banners.forEach((banner, index) => {
            const section = document.querySelector(`[data-partner-banner="${index + 1}"], .partner-banner-${index + 1}`);
            if (!section) return;

            // 背景图
            if (banner.image) {
                section.style.backgroundImage = `url('${banner.image}')`;
            }

            // Logo
            const logo = section.querySelector('.partner-logo, .banner-logo');
            if (logo && banner.logo) {
                logo.src = banner.logo;
                logo.style.display = '';
            } else if (logo && !banner.logo) {
                logo.style.display = 'none';
            }

            // 标题
            const title = section.querySelector('.partner-title, h2, h3');
            if (title) {
                if (banner.title) {
                    title.textContent = banner.title;
                    title.style.display = '';
                } else {
                    title.style.display = 'none';
                }
            }

            // 详情
            const desc = section.querySelector('.partner-desc, .description');
            if (desc) {
                if (banner.description) {
                    desc.textContent = banner.description;
                    desc.style.display = '';
                } else {
                    desc.style.display = 'none';
                }
            }

            // 按钮
            const btn = section.querySelector('.partner-btn, .banner-button');
            if (btn) {
                if (banner.link && banner.button_text) {
                    btn.href = banner.link;
                    btn.textContent = banner.button_text;
                    btn.style.display = '';
                } else {
                    btn.style.display = 'none';
                }
            }
        });
    }

    // 渲染合作Logo
    function renderCollabLogos(logos) {
        const container = document.querySelector('.collaborators-grid, .partners-logos');
        if (!container) return;

        container.innerHTML = '';

        logos.forEach(logo => {
            if (!logo.image) return;

            const div = document.createElement('div');
            div.className = 'collab-logo-item';

            const hasLink = logo.link && logo.link.trim() !== '';
            const linkStart = hasLink ? `<a href="${logo.link}" target="_blank">` : '';
            const linkEnd = hasLink ? '</a>' : '';

            div.innerHTML = `
                ${linkStart}
                <img src="${logo.image}" alt="${logo.name || ''}" onerror="this.style.display='none'">
                ${logo.name ? `<span>${logo.name}</span>` : ''}
                ${linkEnd}
            `;

            container.appendChild(div);
        });
    }

    // 渲染底部
    function renderFooter(footerData, pageType) {
        if (!footerData) return;

        // 标题
        const title = document.querySelector('.footer-title, .footer-logo');
        if (title && footerData.title) {
            title.innerHTML = footerData.title.replace('ASIA', '<span style="color: #8b0000;">ASIA</span>');
        }

        // 联系文字
        const contact = document.querySelector('.footer-contact');
        if (contact && footerData.contact) {
            contact.textContent = footerData.contact;
        }

        // 地址
        const address = document.querySelector('.footer-address');
        if (address && footerData.address) {
            address.textContent = footerData.address;
        }

        // 版权
        const copyright = document.querySelector('.copyright, .footer-copyright');
        if (copyright && footerData.copyright) {
            copyright.textContent = footerData.copyright;
        }

        // 制作单位Logo
        const producer = document.querySelector('.producer-logo img, .footer-producer img');
        if (producer && footerData.producer) {
            producer.src = footerData.producer;
        }

        // 社交图标
        const socialContainer = document.querySelector('#socialContainer, .social-icons, .footer-social');
        if (socialContainer && footerData.social) {
            socialContainer.innerHTML = '';

            footerData.social.forEach(social => {
                if (!social.name) return;

                const hasUrl = social.url && social.url.trim() !== '' && social.url !== '#';
                const tag = hasUrl ? 'a' : 'span';
                const href = hasUrl ? `href="${social.url}" target="_blank"` : '';

                const icon = getSocialIcon(social.icon || social.name.toLowerCase());

                const el = document.createElement(tag);
                if (hasUrl) el.href = social.url;
                el.target = '_blank';
                el.className = 'social-icon';
                el.innerHTML = icon;
                el.title = social.name;

                socialContainer.appendChild(el);
            });
        }
    }

    // 获取社交图标SVG
    function getSocialIcon(type) {
        const icons = {
            facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            weibo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.375-1.018.412-1.896.002-2.521-.771-1.166-2.883-1.104-5.29-.033 0 0-.757.332-.564-.271.369-1.19.313-2.187-.26-2.762-1.299-1.306-4.779.047-7.771 3.023C1.004 10.469 0 12.603 0 14.459c0 3.559 4.566 5.723 9.031 5.723 5.847 0 9.736-3.397 9.736-6.092 0-1.63-1.376-2.553-2.708-2.441zm.794-5.461c-.938-.956-2.322-1.319-3.641-1.124-.399.059-.678.418-.619.818.06.4.419.678.819.619.856-.126 1.732.104 2.33.715.599.612.819 1.492.585 2.33-.097.351.109.714.461.811.352.097.715-.109.811-.461.359-1.318.012-2.756-.746-3.708zm2.538-2.575C19.193.756 17.032.04 14.89.39c-.399.063-.669.427-.606.826.063.4.427.67.827.606 1.638-.26 3.357.28 4.525 1.471 1.168 1.19 1.669 2.833 1.367 4.454-.074.392.184.77.576.844.392.074.77-.184.844-.576.386-2.111-.252-4.291-1.829-5.898z"/></svg>',
            xiaohongshu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.615h-2.77v-4.615h-2.77v4.615H8.308V7.385h2.77v4.615h2.77V7.385h2.77v9.23z"/></svg>',
            wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            miniprogram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        };

        return icons[type] || icons.facebook;
    }

    // 初始化轮播
    function initCarousel() {
        // 查找所有轮播容器并初始化
        const carousels = document.querySelectorAll('.hero-slides, .carousel');
        carousels.forEach(carousel => {
            const slides = carousel.querySelectorAll('.hero-slide, .carousel-slide');
            if (slides.length <= 1) return;

            let current = 0;
            setInterval(() => {
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
            }, 5000);
        });
    }

    // 主加载函数
    async function loadAndRender() {
        const pageType = detectPageType();

        // 加载通用数据
        const banners = await fetchJSON('banners.json');
        const footerGlobal = await fetchJSON('footer-global.json');
        const footerCN = await fetchJSON('footer-cn.json');

        // 根据页面类型加载特定数据
        let posters, events, carousel, partnerBanners, collabLogos;

        if (pageType === 'index') {
            posters = await fetchJSON('posters-index.json');
            renderBanners(banners, pageType);
            renderPosters(posters, pageType);
            renderFooter(footerGlobal, pageType);
        } else if (pageType === 'cn') {
            posters = await fetchJSON('posters-cn.json');
            renderBanners(banners, pageType);
            renderPosters(posters, pageType);
            renderFooter(footerCN, pageType);
        } else if (pageType === 'events') {
            posters = await fetchJSON('posters-events.json');
            events = await fetchJSON('events-managed.json');
            carousel = await fetchJSON('carousel.json');
            renderPosters(posters, pageType);
            renderEvents(events);
            renderCarousel(carousel);
            renderFooter(footerGlobal, pageType);
        } else if (pageType === 'partners') {
            partnerBanners = await fetchJSON('partners-banners.json');
            collabLogos = await fetchJSON('collaborators.json');
            renderPartnerBanners(partnerBanners);
            renderCollabLogos(collabLogos);
            renderFooter(footerGlobal, pageType);
        } else if (pageType === 'privacy' || pageType === 'accessibility') {
            renderFooter(footerGlobal, pageType);
        }
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndRender);
    } else {
        loadAndRender();
    }

    // 暴露全局函数供手动刷新
    window.LiveGigsData = {
        refresh: loadAndRender,
        config: CONFIG
    };
})();