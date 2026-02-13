// LiveGigs Data Loader - Fixed Version
// 自动加载JSON数据并渲染到页面

(function() {
    'use strict';

    const CONFIG = {
        baseUrl: './content',
        cacheBust: true
    };

    // 页面类型检测
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

    // 加载JSON
    async function loadJSON(filename) {
        try {
            const url = `${CONFIG.baseUrl}/${filename}.json${CONFIG.cacheBust ? '?v=' + Date.now() : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 判断是否为空值
    function isEmpty(value) {
        return value === null || value === undefined || value === '';
    }

    // 渲染底部区域 - 完全重写版
    function renderFooter(data, pageType) {
        if (!data) {
            console.log('No footer data provided');
            return;
        }

        console.log('Rendering footer with data:', data);

        // 1. 站点名称 - 使用多种选择器尝试
        const siteNameSelectors = ['.footer-brand', '.site-name', '#footer-brand', '.footer-logo', '.logo-text'];
        for (const selector of siteNameSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                const nameText = !isEmpty(data.siteName) ? data.siteName : 'LIVEGIGS';
                const asiaText = !isEmpty(data.siteNameAsia) ? data.siteNameAsia : (pageType === 'cn' ? 'CN' : 'ASIA');
                el.innerHTML = `${nameText}<span style="color: #8b0000;">${asiaText}</span>`;
                console.log('Updated site name:', selector);
                break;
            }
        }

        // 2. 联系文字 - 多种选择器
        const contactTextSelectors = ['.footer-contact-text', '.contact-text', '.contact-info p', '.footer-desc', '[data-field="contactText"]'];
        for (const selector of contactTextSelectors) {
            const el = document.querySelector(selector);
            if (el && !isEmpty(data.contactText)) {
                el.textContent = data.contactText;
                el.style.display = '';
                console.log('Updated contact text:', selector, data.contactText);
                break;
            }
        }

        // 3. 邮箱地址 - 可点击发送邮件
        const emailSelectors = ['.footer-email', '.email-link', 'a[href^="mailto:"]', '[data-field="email"]'];
        for (const selector of emailSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                if (!isEmpty(data.email)) {
                    el.href = `mailto:${data.email}`;
                    el.textContent = data.email;
                    el.style.display = '';
                    console.log('Updated email:', selector, data.email);
                } else {
                    el.style.display = 'none';
                }
                break;
            }
        }

        // 4. 地址
        const addressSelectors = ['.footer-address', '.address-text', '.location-text', '[data-field="address"]'];
        for (const selector of addressSelectors) {
            const el = document.querySelector(selector);
            if (el && !isEmpty(data.address)) {
                el.textContent = data.address;
                el.style.display = '';
                console.log('Updated address:', selector, data.address);
                break;
            }
        }

        // 5. 版权文字 - 强制更新
        const copyrightSelectors = ['.copyright', '.footer-copyright', '#footer-copyright', '.copyright-text', '[data-field="copyright"]'];
        for (const selector of copyrightSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                if (!isEmpty(data.copyright)) {
                    el.textContent = data.copyright;
                    el.style.display = '';
                    console.log('Updated copyright:', selector, data.copyright);
                } else {
                    el.style.display = 'none';
                }
                break;
            }
        }

        // 6. 制作单位Logo
        const producerSelectors = ['.producer-logo', '.footer-producer', '#footer-producer', '.emanon-logo', '[data-field="producerLogo"]'];
        for (const selector of producerSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                if (!isEmpty(data.producerLogo)) {
                    el.src = data.producerLogo;
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
                break;
            }
        }

        // 7. 社交媒体 - 修复版：链接留空显示但不可点击
        renderSocialIcons(data.socials, pageType);
    }

    // 渲染社交图标 - 修复拉伸和点击问题
    function renderSocialIcons(socials, pageType) {
        if (!socials || !Array.isArray(socials)) {
            console.log('No socials data');
            return;
        }

        // 查找社交容器
        const containerSelectors = ['#socialContainer', '.footer-social', '.social-links', '.social-icons', '[data-section="social"]'];
        let container = null;

        for (const selector of containerSelectors) {
            container = document.querySelector(selector);
            if (container) {
                console.log('Found social container:', selector);
                break;
            }
        }

        if (!container) {
            console.warn('Social container not found');
            return;
        }

        // 清空现有内容
        container.innerHTML = '';

        // 过滤启用的社交图标
        const enabledSocials = socials.filter(s => s.enabled && !isEmpty(s.icon));

        console.log('Enabled socials:', enabledSocials.length);

        enabledSocials.forEach((social, index) => {
            // 创建图标容器
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'social-icon-wrapper';
            iconWrapper.style.cssText = `
                display: inline-block;
                width: 44px;
                height: 44px;
                margin: 0 8px;
                position: relative;
            `;

            // 创建链接或span
            let linkEl;
            const hasLink = !isEmpty(social.link);

            if (hasLink) {
                linkEl = document.createElement('a');
                linkEl.href = social.link;
                linkEl.target = '_blank';
                linkEl.style.cursor = 'pointer';
            } else {
                linkEl = document.createElement('span');
                linkEl.style.cursor = 'not-allowed';
                linkEl.style.opacity = '0.5';
            }

            linkEl.className = 'social-icon';
            linkEl.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background-color: #050505;
                transition: all 0.3s ease;
                text-decoration: none;
            `;

            // 添加悬停效果
            linkEl.onmouseover = function() {
                if (hasLink) {
                    this.style.backgroundColor = '#8b0000';
                    this.style.transform = 'translateY(-3px)';
                }
            };
            linkEl.onmouseout = function() {
                this.style.backgroundColor = '#050505';
                this.style.transform = 'translateY(0)';
            };

            // 创建SVG图标 - 使用固定尺寸防止拉伸
            const svgIcon = getSocialIconSvg(social.icon);
            const iconDiv = document.createElement('div');
            iconDiv.innerHTML = svgIcon;
            iconDiv.style.cssText = `
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            linkEl.appendChild(iconDiv);
            iconWrapper.appendChild(linkEl);
            container.appendChild(iconWrapper);

            console.log(`Added social icon ${index}:`, social.icon, 'Link:', hasLink ? social.link : 'none');
        });
    }

    // 获取社交媒体图标SVG - 固定尺寸
    function getSocialIconSvg(iconType) {
        const icons = {
            facebook: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,

            instagram: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,

            youtube: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,

            x: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,

            wechat: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>`,

            weibo: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.578-.172-.4-.626.386-.998.428-1.86.008-2.469-.786-1.14-2.938-1.079-5.388-.031 0 0-.772.338-.575-.272.381-1.205.324-2.213-.27-2.8-1.347-1.327-4.928.045-8.001 3.067C1.189 10.445 0 12.551 0 14.347c0 3.44 4.416 5.531 8.738 5.531 5.658 0 9.426-3.287 9.426-5.898 0-1.576-1.329-2.467-2.065-2.631zm.677-4.287c-.754-.803-1.866-1.124-2.936-.973-.448.064-.748.473-.683.92.065.449.473.748.921.684.584-.083 1.182.083 1.591.52.41.437.558 1.046.396 1.62-.113.393.113.804.506.918.393.113.805-.113.918-.506.276-.957.037-2.039-.713-2.183zm2.159-2.559c-1.56-1.656-3.863-2.324-6.074-2.012-.448.063-.757.47-.693.918.063.449.47.758.919.694 1.638-.23 3.332.27 4.488 1.498 1.156 1.229 1.548 2.898 1.154 4.434-.113.393.113.804.506.918.393.113.805-.113.918-.506.516-1.987.02-4.287-1.218-5.944z"/></svg>`,

            xiaohongshu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z"/></svg>`,

            miniprogram: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white" style="display:block;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
        };

        return icons[iconType] || icons.facebook;
    }

    // 渲染Banner
    function renderBanners(data, pageType) {
        if (!data || !data.banners) return;

        const banners = data.banners.filter(b => b.enabled && !isEmpty(b.image));

        let container;
        if (pageType === 'index' || pageType === 'cn') {
            container = document.querySelector('.banner-slider, #bannerSlider, .hero-slider, .slider-container');
        }

        if (!container) {
            console.log('Banner container not found');
            return;
        }

        container.innerHTML = '';

        banners.forEach((banner, index) => {
            const slide = document.createElement('div');
            slide.className = 'banner-slide';
            slide.style.backgroundImage = `url(${banner.image})`;

            const titleHTML = !isEmpty(banner.title) ? 
                `<h2 class="banner-title">${banner.title}</h2>` : '';

            const buttonHTML = !isEmpty(banner.buttonText) ? 
                `<a href="${!isEmpty(banner.link) ? banner.link : 'javascript:void(0);'}" 
                    class="banner-btn" 
                    ${!isEmpty(banner.link) ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'}>
                    ${banner.buttonText}
                </a>` : '';

            slide.innerHTML = `
                <div class="banner-content">
                    ${titleHTML}
                    ${buttonHTML}
                </div>
            `;

            container.appendChild(slide);
        });

        initSlider(container);
    }

    // 渲染海报
    function renderPosters(data, pageType) {
        if (!data || !data.posters) return;

        const posters = data.posters.filter(p => p.enabled && !isEmpty(p.image));

        posters.forEach((poster, index) => {
            const container = document.querySelector(`#poster-${index + 1}, .poster-${index + 1}, [data-poster="${index + 1}"]`);
            if (!container) return;

            const img = container.querySelector('img');
            if (img) {
                img.src = poster.image;
                img.alt = poster.title || '';
            }

            const titleEl = container.querySelector('.poster-title, h3, h4');
            if (titleEl) {
                if (!isEmpty(poster.title)) {
                    titleEl.textContent = poster.title;
                    titleEl.style.display = '';
                } else {
                    titleEl.style.display = 'none';
                }
            }

            const linkEl = container.querySelector('a, .poster-link, .btn');
            if (linkEl) {
                if (!isEmpty(poster.linkText)) {
                    linkEl.textContent = poster.linkText;
                    linkEl.style.display = '';
                } else {
                    linkEl.style.display = 'none';
                }

                if (!isEmpty(poster.link)) {
                    linkEl.href = poster.link;
                    linkEl.target = '_blank';
                    linkEl.style.pointerEvents = 'auto';
                    linkEl.style.opacity = '1';
                } else {
                    linkEl.href = 'javascript:void(0);';
                    linkEl.style.pointerEvents = 'none';
                    linkEl.style.opacity = '0.5';
                    linkEl.removeAttribute('target');
                }
            }
        });
    }

    // 渲染Events海报2
    function renderEventsPoster2(data) {
        if (!data || !data.posters) return;

        const posters = data.posters.filter(p => p.enabled && !isEmpty(p.image));
        const container = document.querySelector('#poster-2-carousel, .poster-2-slider, [data-poster="2"]');

        if (!container || posters.length === 0) return;

        if (posters.length > 1 && data.poster2_carousel) {
            container.innerHTML = '';
            posters.forEach(poster => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';

                const titleHTML = !isEmpty(poster.title) ? 
                    `<h4 class="poster-title">${poster.title}</h4>` : '';
                const linkHTML = !isEmpty(poster.linkText) ? 
                    `<a href="${!isEmpty(poster.link) ? poster.link : 'javascript:void(0);'}" 
                        class="poster-link"
                        ${!isEmpty(poster.link) ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'}>
                        ${poster.linkText}
                    </a>` : '';

                slide.innerHTML = `
                    <img src="${poster.image}" alt="${poster.title || ''}">
                    ${titleHTML}
                    ${linkHTML}
                `;
                container.appendChild(slide);
            });

            initCarousel(container);
        } else {
            const poster = posters[0];
            const img = container.querySelector('img');
            if (img) {
                img.src = poster.image;
                img.alt = poster.title || '';
            }

            const titleEl = container.querySelector('.poster-title, h4');
            if (titleEl) {
                if (!isEmpty(poster.title)) {
                    titleEl.textContent = poster.title;
                    titleEl.style.display = '';
                } else {
                    titleEl.style.display = 'none';
                }
            }

            const linkEl = container.querySelector('a, .poster-link');
            if (linkEl) {
                if (!isEmpty(poster.linkText)) {
                    linkEl.textContent = poster.linkText;
                    linkEl.style.display = '';
                } else {
                    linkEl.style.display = 'none';
                }

                if (!isEmpty(poster.link)) {
                    linkEl.href = poster.link;
                    linkEl.target = '_blank';
                    linkEl.style.pointerEvents = 'auto';
                    linkEl.style.opacity = '1';
                } else {
                    linkEl.href = 'javascript:void(0);';
                    linkEl.style.pointerEvents = 'none';
                    linkEl.style.opacity = '0.5';
                    linkEl.removeAttribute('target');
                }
            }
        }
    }

    // 渲染自主活动
    function renderEventsManaged(data) {
        if (!data || !data.events) return;

        const events = data.events.filter(e => e.enabled && !isEmpty(e.image));
        const container = document.querySelector('#events-managed, .events-grid, .managed-events');

        if (!container) return;

        container.innerHTML = '';

        events.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.index = index;

            let detailsHTML = '';
            if (!isEmpty(event.date)) detailsHTML += `<div class="event-date">${event.date}</div>`;
            if (!isEmpty(event.venue)) detailsHTML += `<div class="event-venue">${event.venue}</div>`;
            if (!isEmpty(event.time)) detailsHTML += `<div class="event-time">${event.time}</div>`;
            if (!isEmpty(event.ticket)) detailsHTML += `<div class="event-ticket">${event.ticket}</div>`;
            if (!isEmpty(event.status)) detailsHTML += `<div class="event-status">${event.status}</div>`;

            const titleHTML = !isEmpty(event.title) ? `<h3 class="event-title">${event.title}</h3>` : '';

            const buttonHTML = !isEmpty(event.buttonText) ? 
                `<a href="${!isEmpty(event.link) ? event.link : 'javascript:void(0);'}" 
                    class="event-btn"
                    ${!isEmpty(event.link) ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'}>
                    ${event.buttonText}
                </a>` : '';

            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title || ''}">
                </div>
                <div class="event-info">
                    ${titleHTML}
                    ${detailsHTML}
                    ${buttonHTML}
                </div>
            `;

            container.appendChild(eventCard);
        });

        const loadMoreBtn = document.querySelector('#load-more, .load-more-btn');
        if (loadMoreBtn) {
            if (events.length > 3) {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.onclick = function() {
                    document.querySelectorAll('.event-card').forEach(card => {
                        card.style.display = 'block';
                    });
                    this.style.display = 'none';
                };
                document.querySelectorAll('.event-card').forEach((card, index) => {
                    if (index >= 3) card.style.display = 'none';
                });
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    // 渲染滚播活动
    function renderEventsCarousel(data) {
        if (!data || !data.carousel) return;

        const items = data.carousel.filter(c => c.enabled && !isEmpty(c.image));
        const container = document.querySelector('#events-carousel, .carousel-slider, .events-carousel');

        if (!container || items.length === 0) return;

        container.innerHTML = '';

        items.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.style.backgroundImage = `url(${item.image})`;

            const titleHTML = !isEmpty(item.title) ? `<h3>${item.title}</h3>` : '';
            const dateHTML = !isEmpty(item.date) ? `<div class="carousel-date">${item.date}</div>` : '';
            const buttonHTML = !isEmpty(item.buttonText) ? 
                `<a href="${!isEmpty(item.link) ? item.link : 'javascript:void(0);'}" 
                    class="carousel-btn"
                    ${!isEmpty(item.link) ? 'target="_blank"' : 'style="pointer-events:none;opacity:0.5;"'}>
                    ${item.buttonText}
                </a>` : '';

            slide.innerHTML = `
                <div class="carousel-content">
                    ${titleHTML}
                    ${dateHTML}
                    ${buttonHTML}
                </div>
            `;

            container.appendChild(slide);
        });

        initCarousel(container);
    }

    // 渲染Partners Banner
    function renderPartnersBanners(data) {
        if (!data || !data.banners) return;

        const banners = data.banners.filter(b => b.enabled && !isEmpty(b.mainImage));

        banners.forEach((banner, index) => {
            const container = document.querySelector(`#partner-banner-${index + 1}, [data-partner-banner="${index + 1}"]`);
            if (!container) return;

            container.style.backgroundImage = `url(${banner.mainImage})`;

            const logoEl = container.querySelector('.partner-logo, .banner-logo');
            if (logoEl) {
                if (!isEmpty(banner.logoImage)) {
                    logoEl.src = banner.logoImage;
                    logoEl.style.display = '';
                } else {
                    logoEl.style.display = 'none';
                }
            }

            const titleEl = container.querySelector('.partner-title, h2, h3');
            if (titleEl) {
                if (!isEmpty(banner.title)) {
                    titleEl.textContent = banner.title;
                    titleEl.style.display = '';
                } else {
                    titleEl.style.display = 'none';
                }
            }

            const descEl = container.querySelector('.partner-description, .banner-desc');
            if (descEl) {
                if (!isEmpty(banner.description)) {
                    descEl.textContent = banner.description;
                    descEl.style.display = '';
                } else {
                    descEl.style.display = 'none';
                }
            }

            const btnEl = container.querySelector('.partner-btn, .banner-btn, a');
            if (btnEl) {
                if (!isEmpty(banner.buttonText)) {
                    btnEl.textContent = banner.buttonText;
                    btnEl.style.display = '';

                    if (!isEmpty(banner.link)) {
                        btnEl.href = banner.link;
                        btnEl.target = '_blank';
                        btnEl.style.pointerEvents = 'auto';
                        btnEl.style.opacity = '1';
                    } else {
                        btnEl.href = 'javascript:void(0);';
                        btnEl.style.pointerEvents = 'none';
                        btnEl.style.opacity = '0.5';
                        btnEl.removeAttribute('target');
                    }
                } else {
                    btnEl.style.display = 'none';
                }
            }
        });
    }

    // 渲染合作Logo
    function renderCollaborators(data) {
        if (!data || !data.logos) return;

        const logos = data.logos.filter(l => l.enabled && !isEmpty(l.image));
        const container = document.querySelector('#collaborators, .collaborators-grid, .partner-logos');

        if (!container) return;

        container.innerHTML = '';

        logos.forEach(logo => {
            const logoItem = document.createElement('div');
            logoItem.className = 'collaborator-item';

            if (!isEmpty(logo.link)) {
                logoItem.innerHTML = `
                    <a href="${logo.link}" target="_blank" class="collaborator-link">
                        <img src="${logo.image}" alt="${logo.name || ''}" class="collaborator-logo">
                    </a>
                `;
            } else {
                logoItem.innerHTML = `
                    <img src="${logo.image}" alt="${logo.name || ''}" class="collaborator-logo">
                `;
            }

            container.appendChild(logoItem);
        });
    }

    // 初始化轮播
    function initSlider(container) {
        console.log('Slider initialized');
    }

    function initCarousel(container) {
        console.log('Carousel initialized');
    }

    // 主加载函数
    async function loadAndRender() {
        const pageType = detectPageType();
        console.log('Page type:', pageType);

        const [
            bannersData,
            indexPostersData,
            cnPostersData,
            eventsPostersData,
            eventsManagedData,
            eventsCarouselData,
            footerGlobalData,
            footerCNData,
            partnersBannersData,
            collaboratorsData
        ] = await Promise.all([
            loadJSON('banners'),
            loadJSON('index-posters'),
            loadJSON('cn-posters'),
            loadJSON('events-posters'),
            loadJSON('events-managed'),
            loadJSON('events-carousel'),
            loadJSON('footer-global'),
            loadJSON('footer-cn'),
            loadJSON('partners-banners'),
            loadJSON('collaborators')
        ]);

        console.log('Loaded footer global:', footerGlobalData);
        console.log('Loaded footer CN:', footerCNData);

        switch(pageType) {
            case 'index':
                renderBanners(bannersData, 'index');
                renderPosters(indexPostersData, 'index');
                renderFooter(footerGlobalData, 'index');
                break;

            case 'cn':
                renderBanners(bannersData, 'cn');
                renderPosters(cnPostersData, 'cn');
                renderFooter(footerCNData, 'cn');
                break;

            case 'events':
                renderEventsPoster2(eventsPostersData);
                renderEventsManaged(eventsManagedData);
                renderEventsCarousel(eventsCarouselData);
                renderPosters(indexPostersData, 'events');
                renderFooter(footerGlobalData, 'events');
                break;

            case 'partners':
                renderPartnersBanners(partnersBannersData);
                renderCollaborators(collaboratorsData);
                renderFooter(footerGlobalData, 'partners');
                break;

            case 'privacy':
            case 'accessibility':
                renderFooter(footerGlobalData, pageType);
                break;
        }

        console.log('Data loaded and rendered successfully');
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndRender);
    } else {
        loadAndRender();
    }

    // 暴露全局函数
    window.LiveGigsData = {
        refresh: loadAndRender,
        loadAndRender: loadAndRender
    };
})();
