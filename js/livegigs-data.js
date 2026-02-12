// LiveGigs Asia - 前端数据加载脚本 (完全修复版)
// 修复所有数据显示问题
(function() {
    'use strict';

    console.log('=== LiveGigs Data Loader Starting ===');

    const CONFIG = {
        baseUrl: 'https://emanonent.github.io/asia/content',
        cacheBuster: true
    };

    // 检测页面类型
    function detectPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const hostname = window.location.hostname;

        console.log('Detecting page:', filename, 'hostname:', hostname);

        if (filename === 'cn.html' || path.includes('/cn')) return 'cn';
        if (filename === 'events.html' || path.includes('/events')) return 'events';
        if (filename === 'partners.html' || path.includes('/partners')) return 'partners';
        if (filename === 'privacypolicy.html' || path.includes('/privacy')) return 'privacy';
        if (filename === 'accessibilitystatement.html' || path.includes('/accessibility')) return 'accessibility';
        if (filename === 'index.html' || filename === '' || path.endsWith('/asia/') || path.endsWith('/asia')) return 'index';

        return 'index';
    }

    // 获取JSON数据
    async function fetchJSON(filename) {
        try {
            const url = CONFIG.cacheBuster ? `${CONFIG.baseUrl}/${filename}?t=${Date.now()}` : `${CONFIG.baseUrl}/${filename}`;
            console.log('Fetching:', url);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log(`Loaded ${filename}:`, data);
            return data;
        } catch (e) { 
            console.error(`Failed to load ${filename}:`, e);
            return null; 
        }
    }

    // ==================== BANNER 渲染 (修复版) ====================
    function renderBanners(banners) {
        console.log('Rendering banners:', banners);
        if (!banners || !banners.length) {
            console.log('No banners to render');
            return;
        }

        // 查找所有可能的banner容器
        const containers = document.querySelectorAll('.hero-slides, .banner-section, .banner-container, .hero-banner, [class*="banner"]');
        console.log('Found banner containers:', containers.length);

        if (!containers.length) {
            console.error('No banner container found!');
            return;
        }

        const container = containers[0];

        // 清空现有内容
        container.innerHTML = '';

        banners.forEach((b, i) => {
            if (!b.image) {
                console.log(`Banner ${i} has no image, skipping`);
                return;
            }

            const slide = document.createElement('div');
            slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
            slide.style.cssText = 'position: relative; width: 100%; height: 100%;';

            const hasLink = b.link && b.link.trim();
            const title = b.title || '';
            const buttonText = b.button_text || b.buttonText || b.btnText || 'View Details →';

            console.log(`Banner ${i}:`, { title, buttonText, link: b.link, image: b.image });

            slide.innerHTML = `
                ${hasLink ? `<a href="${b.link}" class="slide-link" style="display: block; width: 100%; height: 100%; text-decoration: none;">` : ''}
                <div class="slide-bg" style="background-image: url('${b.image}'); background-size: cover; background-position: center; width: 100%; height: 100%;"></div>
                <div class="slide-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; z-index: 10;">
                    ${title ? `<h2 class="slide-title" style="font-size: 3em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${title}</h2>` : ''}
                    <span class="slide-button" style="display: inline-block; padding: 12px 30px; background: #8b0000; color: white; text-transform: uppercase; font-family: Impact, sans-serif; cursor: pointer;">${buttonText}</span>
                </div>
                ${hasLink ? '</a>' : ''}
            `;

            container.appendChild(slide);
        });

        // 初始化轮播
        initBannerCarousel(container);
    }

    function initBannerCarousel(container) {
        const slides = container.querySelectorAll('.hero-slide');
        if (slides.length <= 1) return;

        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            slides[current].style.opacity = '0';

            current = (current + 1) % slides.length;

            slides[current].classList.add('active');
            slides[current].style.opacity = '1';
        }, 5000);
    }

    // ==================== 海报区域渲染 (完全修复版) ====================
    function renderPosters(posters, pageType) {
        console.log(`Rendering posters for ${pageType}:`, posters);

        if (!posters || !Array.isArray(posters)) {
            console.error('Invalid posters data:', posters);
            return;
        }

        // 确保有3个海报
        while (posters.length < 3) {
            posters.push({});
        }

        posters.forEach((poster, idx) => {
            const num = idx + 1;
            console.log(`Processing poster ${num}:`, poster);

            // 多种选择器尝试
            const selectors = [
                `[data-poster="${num}"]`,
                `.poster-${num}`,
                `#poster-${num}`,
                `.flyer-${num}`,
                `#flyer-${num}`,
                `.poster:nth-child(${num})`,
                `.flyer:nth-child(${num})`,
                `.posters-grid > div:nth-child(${num})`,
                `.flyers-grid > div:nth-child(${num})`
            ];

            let container = null;
            for (let selector of selectors) {
                container = document.querySelector(selector);
                if (container) {
                    console.log(`Found poster ${num} with selector: ${selector}`);
                    break;
                }
            }

            if (!container) {
                console.error(`Could not find poster ${num} container!`);
                return;
            }

            // 更新图片
            const img = container.querySelector('img');
            if (img && poster.image) {
                console.log(`Setting poster ${num} image:`, poster.image);
                img.src = poster.image;
                img.style.display = '';
                img.onerror = () => {
                    console.error(`Failed to load image: ${poster.image}`);
                    img.style.display = 'none';
                };
            }

            // 更新标题
            const titleSelectors = ['.poster-title', '.flyer-title', 'h3', 'h4', '.title', '.poster-name'];
            for (let selector of titleSelectors) {
                const titleEl = container.querySelector(selector);
                if (titleEl) {
                    if (poster.title) {
                        console.log(`Setting poster ${num} title:`, poster.title);
                        titleEl.textContent = poster.title;
                        titleEl.style.display = '';
                    } else {
                        titleEl.style.display = 'none';
                    }
                    break;
                }
            }

            // 更新链接和按钮文字
            const linkSelectors = ['a', '.poster-link', '.flyer-link', '.link'];
            for (let selector of linkSelectors) {
                const link = container.querySelector(selector);
                if (link) {
                    const linkUrl = poster.link || '';
                    const linkText = poster.link_text || poster.linkText || poster.button_text || 'View Details →';

                    console.log(`Setting poster ${num} link:`, { url: linkUrl, text: linkText });

                    if (linkUrl) {
                        link.href = linkUrl;
                        link.style.display = '';
                        link.target = '_blank'; // 新窗口打开
                    } else {
                        link.style.display = 'none';
                    }

                    // 设置按钮文字
                    const textSelectors = ['.link-text', '.button-text', 'span', '.text', '.btn-text'];
                    let textSet = false;

                    for (let ts of textSelectors) {
                        const textEl = link.querySelector(ts);
                        if (textEl) {
                            textEl.textContent = linkText;
                            textSet = true;
                            break;
                        }
                    }

                    if (!textSet) {
                        // 如果找不到子元素，直接设置链接文字
                        const icon = link.querySelector('i, svg, .icon');
                        if (icon) {
                            link.innerHTML = '';
                            link.appendChild(icon);
                            link.appendChild(document.createTextNode(' ' + linkText));
                        } else {
                            link.textContent = linkText;
                        }
                    }

                    break;
                }
            }

            // 海报2滚播 (仅events页面)
            if (num === 2 && pageType === 'events' && poster.carousel && poster.carouselImages && poster.carouselImages.length >= 2) {
                console.log('Initializing poster 2 carousel:', poster.carouselImages);
                initPoster2Carousel(container, poster.carouselImages, poster);
            }
        });
    }

    function initPoster2Carousel(container, images, posterData) {
        const img = container.querySelector('img');
        if (!img) return;

        let current = 0;
        const titles = posterData.carouselTitles || [];
        const links = posterData.carouselLinks || [];
        const linkTexts = posterData.carouselLinkTexts || [];

        setInterval(() => {
            current = (current + 1) % images.length;

            // 淡出
            img.style.transition = 'opacity 0.3s';
            img.style.opacity = '0';

            setTimeout(() => {
                // 更换图片
                img.src = images[current];

                // 更新标题（如果有）
                const titleEl = container.querySelector('.poster-title, .flyer-title, h3, h4');
                if (titleEl && titles[current]) {
                    titleEl.textContent = titles[current];
                }

                // 更新链接（如果有）
                const link = container.querySelector('a');
                if (link && links[current]) {
                    link.href = links[current];
                    const textEl = link.querySelector('span, .link-text');
                    if (textEl && linkTexts[current]) {
                        textEl.textContent = linkTexts[current];
                    }
                }

                // 淡入
                img.onload = () => {
                    img.style.opacity = '1';
                };
            }, 300);
        }, 3000);
    }

    // ==================== 自主活动渲染 (完全修复版) ====================
    function renderEvents(events) {
        console.log('Rendering events:', events);

        if (!events || !events.length) {
            console.log('No events to render');
            return;
        }

        const containerSelectors = ['.events-grid', '.events-list', '.events-container', '.managed-events', '[class*="event"]'];
        let container = null;

        for (let selector of containerSelectors) {
            container = document.querySelector(selector);
            if (container) break;
        }

        if (!container) {
            console.error('Events container not found!');
            return;
        }

        // 保存原始结构用于克隆
        const template = container.querySelector('.event-card, .event-item');
        container.innerHTML = '';

        events.forEach((evt, i) => {
            if (!evt.image) {
                console.log(`Event ${i} has no image, skipping`);
                return;
            }

            const div = document.createElement('div');
            div.className = template ? template.className : 'event-card';
            if (i >= 3) div.classList.add('hidden-event');

            const hasLink = evt.link && evt.link.trim();
            const status = evt.status || '';
            const statusBadge = status ? `<span class="event-status ${status}" style="position: absolute; top: 10px; right: 10px; padding: 5px 10px; background: ${status === 'soldout' ? '#8b0000' : '#006400'}; color: white; text-transform: uppercase; font-size: 12px;">${status.toUpperCase()}</span>` : '';

            const buttonText = evt.button_text || evt.buttonText || 'Get Tickets →';

            console.log(`Event ${i}:`, {
                title: evt.title,
                date: evt.date,
                location: evt.location,
                time: evt.time,
                ticket: evt.ticket,
                status: evt.status,
                buttonText: buttonText,
                link: evt.link
            });

            div.innerHTML = `
                <div class="event-image" style="position: relative;">
                    <img src="${evt.image}" alt="${evt.title || ''}" style="width: 100%; height: auto;" onerror="this.style.display='none'">
                    ${statusBadge}
                </div>
                <div class="event-info" style="padding: 15px;">
                    ${evt.title ? `<h3 class="event-title" style="font-size: 1.5em; margin-bottom: 10px; color: #fff;">${evt.title}</h3>` : ''}
                    ${evt.date ? `<p class="event-date" style="color: #c0c0c0; margin: 5px 0;"><strong>Date:</strong> ${evt.date}</p>` : ''}
                    ${evt.location ? `<p class="event-location" style="color: #c0c0c0; margin: 5px 0;"><strong>Location:</strong> ${evt.location}</p>` : ''}
                    ${evt.time ? `<p class="event-time" style="color: #c0c0c0; margin: 5px 0;"><strong>Time:</strong> ${evt.time}</p>` : ''}
                    ${evt.ticket ? `<p class="event-ticket" style="color: #c0c0c0; margin: 5px 0;"><strong>Ticket:</strong> ${evt.ticket}</p>` : ''}
                    ${evt.description ? `<p class="event-desc" style="color: #888; margin: 10px 0; font-size: 0.9em;">${evt.description}</p>` : ''}
                    ${hasLink ? `<a href="${evt.link}" target="_blank" class="event-button" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #8b0000; color: white; text-decoration: none; text-transform: uppercase;">${buttonText}</a>` : ''}
                </div>
            `;

            container.appendChild(div);
        });

        // Load More按钮
        const loadMoreSelectors = ['.load-more-btn', '#load-more', '.loadmore', '.load-more'];
        let loadMoreBtn = null;

        for (let selector of loadMoreSelectors) {
            loadMoreBtn = document.querySelector(selector);
            if (loadMoreBtn) break;
        }

        if (loadMoreBtn) {
            if (events.length <= 3) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = '';
                loadMoreBtn.onclick = () => {
                    document.querySelectorAll('.hidden-event').forEach(el => {
                        el.classList.remove('hidden-event');
                        el.style.display = '';
                    });
                    loadMoreBtn.style.display = 'none';
                };
            }
        }
    }

    // ==================== 滚播活动渲染 (完全修复版) ====================
    function renderCarousel(items) {
        console.log('Rendering carousel:', items);

        if (!items || !items.length) {
            console.log('No carousel items to render');
            return;
        }

        const containerSelectors = ['.carousel-track', '.carousel-slides', '.carousel-container', '.carousel'];
        let container = null;

        for (let selector of containerSelectors) {
            container = document.querySelector(selector);
            if (container) break;
        }

        if (!container) {
            console.error('Carousel container not found!');
            return;
        }

        container.innerHTML = '';

        items.forEach((item, i) => {
            if (!item.image) {
                console.log(`Carousel item ${i} has no image, skipping`);
                return;
            }

            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.style.cssText = 'position: relative; min-width: 300px; margin-right: 20px;';

            const hasLink = item.link && item.link.trim();

            console.log(`Carousel ${i}:`, {
                title: item.title,
                time: item.time,
                location: item.location,
                link: item.link
            });

            slide.innerHTML = `
                ${hasLink ? `<a href="${item.link}" target="_blank" style="text-decoration: none; color: inherit;">` : ''}
                <div class="carousel-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center; width: 100%; height: 200px; border-radius: 8px;"></div>
                <div class="carousel-content" style="padding: 15px; background: #1a1a1a; border-radius: 0 0 8px 8px;">
                    ${item.title ? `<h3 style="color: #8b0000; margin-bottom: 10px;">${item.title}</h3>` : ''}
                    ${item.time ? `<p style="color: #c0c0c0; margin: 5px 0;"><strong>Time:</strong> ${item.time}</p>` : ''}
                    ${item.location ? `<p style="color: #c0c0c0; margin: 5px 0;"><strong>Location:</strong> ${item.location}</p>` : ''}
                    ${item.description ? `<p style="color: #888; margin: 10px 0; font-size: 0.9em;">${item.description}</p>` : ''}
                </div>
                ${hasLink ? '</a>' : ''}
            `;

            container.appendChild(slide);
        });
    }

    // ==================== 合作伙伴Banner渲染 (完全修复版) ====================
    function renderPartnerBanners(banners) {
        console.log('Rendering partner banners:', banners);

        if (!banners || !banners.length) {
            console.log('No partner banners to render');
            return;
        }

        banners.forEach((b, i) => {
            const selectors = [
                `[data-partner-banner="${i+1}"]`,
                `.partner-banner-${i+1}`,
                `.partner-section-${i+1}`,
                `.p-banner-${i+1}`
            ];

            let section = null;
            for (let selector of selectors) {
                section = document.querySelector(selector);
                if (section) break;
            }

            if (!section) {
                console.error(`Partner banner ${i+1} not found!`);
                return;
            }

            console.log(`Partner banner ${i}:`, {
                title: b.title,
                description: b.description,
                buttonText: b.button_text,
                link: b.link
            });

            // 背景图
            if (b.image) {
                section.style.backgroundImage = `url('${b.image}')`;
            }

            // Logo
            const logo = section.querySelector('.partner-logo, .banner-logo');
            if (logo) {
                if (b.logo) {
                    logo.src = b.logo;
                    logo.style.display = '';
                } else {
                    logo.style.display = 'none';
                }
            }

            // 标题
            const title = section.querySelector('.partner-title, .banner-title, h2, h3');
            if (title) {
                if (b.title) {
                    title.textContent = b.title;
                    title.style.display = '';
                } else {
                    title.style.display = 'none';
                }
            }

            // 详情
            const desc = section.querySelector('.partner-desc, .banner-desc, .description, p');
            if (desc) {
                if (b.description) {
                    desc.textContent = b.description;
                    desc.style.display = '';
                } else {
                    desc.style.display = 'none';
                }
            }

            // 按钮
            const btn = section.querySelector('.partner-btn, .banner-btn, .button, a.btn');
            if (btn) {
                const buttonText = b.button_text || b.buttonText || 'Learn More →';
                if (b.link && buttonText) {
                    btn.href = b.link;
                    btn.textContent = buttonText;
                    btn.style.display = '';
                    btn.target = '_blank';
                } else {
                    btn.style.display = 'none';
                }
            }
        });
    }

    // ==================== 合作Logo渲染 (完全修复版) ====================
    function renderCollabLogos(logos) {
        console.log('Rendering collab logos:', logos);

        const selectors = ['.collaborators-grid', '.partners-logos', '.collab-logos', '.partner-logos'];
        let container = null;

        for (let selector of selectors) {
            container = document.querySelector(selector);
            if (container) break;
        }

        if (!container) {
            console.error('Collab logos container not found!');
            return;
        }

        container.innerHTML = '';

        if (!logos || !logos.length) {
            console.log('No collab logos to render');
            return;
        }

        logos.forEach((logo, index) => {
            if (!logo.image) {
                console.log(`Logo ${index} has no image, skipping`);
                return;
            }

            const div = document.createElement('div');
            div.className = 'collab-logo-item';
            div.style.cssText = 'display: inline-block; margin: 10px; text-align: center;';

            const hasLink = logo.link && logo.link.trim();
            const name = logo.name || '';

            console.log(`Logo ${index}:`, { name, image: logo.image, link: logo.link });

            div.innerHTML = `
                ${hasLink ? `<a href="${logo.link}" target="_blank" style="text-decoration: none; color: inherit;">` : '<div>'}
                    <img src="${logo.image}" alt="${name}" style="max-width: 150px; max-height: 100px; object-fit: contain;" onerror="this.style.display='none'">
                    ${name ? `<p style="margin-top: 10px; color: #c0c0c0; font-size: 14px;">${name}</p>` : ''}
                ${hasLink ? '</a>' : '</div>'}
            `;

            container.appendChild(div);
        });
    }

    // ==================== 底部区域渲染 (完全修复版) ====================
    function renderFooter(data, pageType) {
        console.log(`Rendering footer for ${pageType}:`, data);

        if (!data) {
            console.error('No footer data!');
            return;
        }

        // 标题
        const titleSelectors = ['.footer-title', '.footer-logo', '.footer-brand', '.footer h2', '.footer h3'];
        for (let selector of titleSelectors) {
            const title = document.querySelector(selector);
            if (title && data.title) {
                title.innerHTML = data.title.replace('ASIA', '<span style="color:#8b0000;">ASIA</span>');
                break;
            }
        }

        // 联系文字
        const contactSelectors = ['.footer-contact', '.contact-text', '.footer p'];  
        for (let selector of contactSelectors) {
            const contact = document.querySelector(selector);
            if (contact && data.contact) {
                contact.textContent = data.contact;
                break;
            }
        }

        // 地址/邮箱
        const addressSelectors = ['.footer-address', '.address-text', '.footer-email'];
        for (let selector of addressSelectors) {
            const address = document.querySelector(selector);
            if (address && data.address) {
                address.textContent = data.address;
                break;
            }
        }

        // 版权
        const copyrightSelectors = ['.copyright', '.footer-copyright', '.footer-copy'];
        for (let selector of copyrightSelectors) {
            const copyright = document.querySelector(selector);
            if (copyright && data.copyright) {
                copyright.textContent = data.copyright;
                break;
            }
        }

        // 制作单位Logo
        const producerSelectors = ['.producer-logo img', '.footer-producer img', '.producer img'];
        for (let selector of producerSelectors) {
            const producer = document.querySelector(selector);
            if (producer && data.producer) {
                producer.src = data.producer;
                break;
            }
        }

        // 社交图标
        const socialSelectors = ['#socialContainer', '.social-icons', '.footer-social', '.social-links'];
        let socialContainer = null;

        for (let selector of socialSelectors) {
            socialContainer = document.querySelector(selector);
            if (socialContainer) break;
        }

        if (socialContainer && data.social && Array.isArray(data.social)) {
            console.log('Rendering social icons:', data.social);
            socialContainer.innerHTML = '';

            data.social.forEach((s, i) => {
                if (!s.name) return;

                const hasUrl = s.url && s.url.trim() && s.url !== '#';
                const el = document.createElement(hasUrl ? 'a' : 'span');

                if (hasUrl) { 
                    el.href = s.url; 
                    el.target = '_blank';
                    el.rel = 'noopener noreferrer';
                }

                el.className = 'social-icon';
                el.style.cssText = 'display: inline-block; margin: 0 10px; width: 44px; height: 44px; line-height: 44px; text-align: center; background: #333; border-radius: 50%; color: #fff;';
                el.innerHTML = getSocialIcon(s.icon || s.name.toLowerCase());
                el.title = s.name;

                console.log(`Social icon ${i}:`, { name: s.name, url: s.url, icon: s.icon });

                socialContainer.appendChild(el);
            });
        }
    }

    function getSocialIcon(type) {
        const icons = {
            facebook: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            x: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            twitter: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
            weibo: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.375-1.018.412-1.896.002-2.521-.771-1.166-2.883-1.104-5.29-.033 0 0-.757.332-.564-.271.369-1.19.313-2.187-.26-2.762-1.299-1.306-4.779.047-7.771 3.023C1.004 10.469 0 12.603 0 14.459c0 3.559 4.566 5.723 9.031 5.723 5.847 0 9.736-3.397 9.736-6.092 0-1.63-1.376-2.553-2.708-2.441zm.794-5.461c-.938-.956-2.322-1.319-3.641-1.124-.399.059-.678.418-.619.818.06.4.419.678.819.619.856-.126 1.732.104 2.33.715.599.612.819 1.492.585 2.33-.097.351.109.714.461.811.352.097.715-.109.811-.461.359-1.318.012-2.756-.746-3.708zm2.538-2.575C19.193.756 17.032.04 14.89.39c-.399.063-.669.427-.606.826.063.4.427.67.827.606 1.638-.26 3.357.28 4.525 1.471 1.168 1.19 1.669 2.833 1.367 4.454-.074.392.184.77.576.844.392.074.77-.184.844-.576.386-2.111-.252-4.291-1.829-5.898z"/></svg>',
            xiaohongshu: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.615h-2.77v-4.615h-2.77v4.615H8.308V7.385h2.77v4.615h2.77V7.385h2.77v9.23z"/></svg>',
            wechat: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            miniprogram: '<svg viewBox="0 0 24 24" fill="currentColor" style="width: 22px; height: 22px; vertical-align: middle;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        };

        return icons[type] || icons.facebook;
    }

    // ==================== 主加载函数 ====================
    async function loadAndRender() {
        console.log('=== Starting Load and Render ===');
        const pageType = detectPageType();
        console.log('Page type detected:', pageType);

        // 加载数据
        const banners = await fetchJSON('banners.json');
        const footerGlobal = await fetchJSON('footer-global.json');
        const footerCN = await fetchJSON('footer-cn.json');

        console.log('Data loaded:', {
            banners: banners?.length || 0,
            footerGlobal: !!footerGlobal,
            footerCN: !!footerCN
        });

        // 根据页面渲染
        if (pageType === 'index') {
            const posters = await fetchJSON('posters-index.json');
            renderBanners(banners);
            renderPosters(posters, pageType);
            renderFooter(footerGlobal, pageType);
        } else if (pageType === 'cn') {
            const posters = await fetchJSON('posters-cn.json');
            renderBanners(banners);
            renderPosters(posters, pageType);
            renderFooter(footerCN, pageType);
        } else if (pageType === 'events') {
            const posters = await fetchJSON('posters-events.json');
            const events = await fetchJSON('events-managed.json');
            const carousel = await fetchJSON('carousel.json');
            renderPosters(posters, pageType);
            renderEvents(events);
            renderCarousel(carousel);
            renderFooter(footerGlobal, pageType);
        } else if (pageType === 'partners') {
            const partnerBanners = await fetchJSON('partners-banners.json');
            const collabLogos = await fetchJSON('collaborators.json');
            renderPartnerBanners(partnerBanners);
            renderCollabLogos(collabLogos);
            renderFooter(footerGlobal, pageType);
        } else if (pageType === 'privacy' || pageType === 'accessibility') {
            renderFooter(footerGlobal, pageType);
        }

        console.log('=== Render Complete ===');
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndRender);
    } else {
        loadAndRender();
    }

    // 暴露全局接口
    window.LiveGigsData = { 
        refresh: loadAndRender, 
        config: CONFIG,
        version: '3.0-comprehensive-fix'
    };

    console.log('LiveGigs Data Loader v3.0 loaded');
})();
