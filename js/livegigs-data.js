/**
 * LiveGigs Asia - Frontend Data Loader
 * 修复版 - 底部区域数据正确映射
 */

(function() {
    'use strict';

    // 数据缓存
    let dataCache = {};
    let lastFetch = 0;
    const CACHE_DURATION = 60000; // 1分钟缓存

    // 页面配置映射
    const pageConfig = {
        'index': {
            banners: 'banners',
            posters: 'index-posters',
            footer: 'footer-global'
        },
        'cn': {
            banners: 'banners',
            posters: 'cn-posters',
            footer: 'footer-cn'
        },
        'events': {
            carousel: 'events-carousel',
            managed: 'events-managed',
            posters: 'events-posters',
            footer: 'footer-global'
        },
        'partners': {
            partners: 'partners-banners',
            collaborators: 'collaborators',
            footer: 'footer-global'
        },
        'privacy': {
            footer: 'footer-global'
        },
        'accessibility': {
            footer: 'footer-global'
        }
    };

    // 获取数据
    async function fetchData(filename) {
        const now = Date.now();
        if (dataCache[filename] && (now - lastFetch) < CACHE_DURATION) {
            return dataCache[filename];
        }

        try {
            // 使用相对路径避免CORS问题
            const response = await fetch(`./content/${filename}.json?v=${now}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            dataCache[filename] = data;
            lastFetch = now;
            return data;
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 渲染Banner
    function renderBanners(data, pageType) {
        if (!data || !data.banners) return;

        const banners = data.banners.filter(b => b.enabled).sort((a, b) => (a.order || 0) - (b.order || 0));

        // 查找banner容器
        const bannerContainer = document.querySelector('.banner-slider, .hero-slider, #banner-container');
        if (!bannerContainer) return;

        // 清空现有内容
        bannerContainer.innerHTML = '';

        banners.forEach((banner, index) => {
            const bannerEl = document.createElement('div');
            bannerEl.className = 'banner-slide';
            bannerEl.style.cssText = `
                background-image: url('${banner.image}');
                background-size: cover;
                background-position: center;
            `;

            let contentHtml = '';
            if (banner.title) {
                contentHtml += `<h2 class="banner-title">${escapeHtml(banner.title)}</h2>`;
            }
            if (banner.buttonText) {
                const linkAttr = banner.link ? `href="${escapeHtml(banner.link)}" target="_blank"` : '';
                contentHtml += `<a ${linkAttr} class="banner-btn">${escapeHtml(banner.buttonText)}</a>`;
            }

            if (contentHtml) {
                bannerEl.innerHTML = `<div class="banner-content">${contentHtml}</div>`;
            }

            bannerContainer.appendChild(bannerEl);
        });

        // 触发轮播初始化
        if (typeof initBannerSlider === 'function') {
            initBannerSlider();
        }
    }

    // 渲染海报
    function renderPosters(data, pageType) {
        if (!data || !data.posters) return;

        const posters = data.posters.filter(p => p.enabled);

        posters.forEach((poster, index) => {
            const posterEl = document.querySelector(`[data-poster="${index + 1}"], .poster-item:nth-child(${index + 1})`);
            if (!posterEl) return;

            // 更新图片
            const imgEl = posterEl.querySelector('img, .poster-image');
            if (imgEl && poster.image) {
                imgEl.src = poster.image;
            }

            // 更新标题
            const titleEl = posterEl.querySelector('.poster-title, h3, h4');
            if (titleEl) {
                titleEl.textContent = poster.title || '';
                titleEl.style.display = poster.title ? '' : 'none';
            }

            // 更新链接
            const linkEl = posterEl.querySelector('a');
            if (linkEl) {
                if (poster.link) {
                    linkEl.href = poster.link;
                    linkEl.target = '_blank';
                }
                if (poster.linkText) {
                    linkEl.textContent = poster.linkText;
                }
            }
        });
    }

    // 渲染底部区域 - 修复版，正确映射字段
    function renderFooter(data, pageType) {
        if (!data) return;

        console.log('Rendering footer with data:', data);

        // 站点名称 (LIVEGIGS)
        const siteNameEl = document.querySelector('.footer-site-name, .site-name, #footer-site-name');
        if (siteNameEl && data.siteName !== undefined) {
            siteNameEl.textContent = data.siteName;
            siteNameEl.style.display = data.siteName ? '' : 'none';
        }

        // 站点副标 (ASIA/CN - 红色)
        const siteAsiaEl = document.querySelector('.footer-site-asia, .site-asia, #footer-site-asia, .footer-asia');
        if (siteAsiaEl && data.siteNameAsia !== undefined) {
            siteAsiaEl.textContent = data.siteNameAsia;
            siteAsiaEl.style.display = data.siteNameAsia ? '' : 'none';
        }

        // 联系文字
        const contactTextEl = document.querySelector('.footer-contact-text, .contact-text, #footer-contact-text');
        if (contactTextEl && data.contactText !== undefined) {
            contactTextEl.textContent = data.contactText;
            contactTextEl.style.display = data.contactText ? '' : 'none';
        }

        // 邮箱地址 (可点击发信)
        const emailEl = document.querySelector('.footer-email, .email-link, #footer-email, a[href^="mailto:"]');
        if (emailEl && data.email !== undefined) {
            if (data.email) {
                emailEl.href = `mailto:${data.email}`;
                emailEl.textContent = data.email;
                emailEl.style.display = '';
            } else {
                emailEl.style.display = 'none';
            }
        }

        // 地址
        const addressEl = document.querySelector('.footer-address, .address-text, #footer-address');
        if (addressEl && data.address !== undefined) {
            addressEl.textContent = data.address;
            addressEl.style.display = data.address ? '' : 'none';
        }

        // 版权文字
        const copyrightEl = document.querySelector('.footer-copyright, .copyright, #footer-copyright');
        if (copyrightEl && data.copyright !== undefined) {
            copyrightEl.textContent = data.copyright;
            copyrightEl.style.display = data.copyright ? '' : 'none';
        }

        // 制作单位Logo
        const producerEl = document.querySelector('.footer-producer, .producer-logo, #footer-producer img');
        if (producerEl && data.producerLogo) {
            producerEl.src = data.producerLogo;
        }

        // 社交媒体
        renderSocials(data.socials);
    }

    // 渲染社交媒体 - 修复版：链接或名称为空时显示但不可点击
    function renderSocials(socials) {
        if (!socials || !Array.isArray(socials)) return;

        const container = document.querySelector('#socialContainer, .footer-social, .social-links');
        if (!container) return;

        // 清空现有内容
        container.innerHTML = '';

        const enabledSocials = socials.filter(s => s.enabled);

        enabledSocials.forEach(social => {
            // 使用自定义图标或预设图标
            const iconType = social.customIcon || social.icon || 'default';
            const iconSvg = getSocialIcon(iconType);

            // 判断是否应该可点击：链接和名称都必须有值
            const isClickable = social.link && social.link.trim() !== '' && social.name && social.name.trim() !== '';

            if (isClickable) {
                // 可点击：使用 <a> 标签
                const link = document.createElement('a');
                link.className = 'social-link';
                link.innerHTML = iconSvg;
                link.href = social.link;
                link.target = '_blank';
                link.title = social.name || '';
                container.appendChild(link);
            } else {
                // 不可点击：使用 <span> 标签，保持显示但无链接功能
                const span = document.createElement('span');
                span.className = 'social-link social-link-disabled';
                span.innerHTML = iconSvg;
                span.style.cursor = 'default';
                span.style.opacity = '0.7';
                span.title = social.name || 'Social Media';
                container.appendChild(span);
            }
        });
    }

    // 获取社交媒体图标SVG
    function getSocialIcon(type) {
        const icons = {
            facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
            wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            weibo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.401-.649.386-1.02.425-1.899.003-2.525-.789-1.168-2.947-1.108-5.388-.034 0 0-.772.338-.575-.274.381-1.206.324-2.215-.27-2.8-1.348-1.33-4.937.045-8.013 3.073C1.149 10.562 0 12.785 0 14.723c0 3.709 4.76 5.966 9.418 5.966 6.097 0 10.155-3.543 10.155-6.356 0-1.702-1.435-2.665-2.614-3.084zm.636-4.052c.838-.936 1.24-2.059 1.133-3.182-.05-.529-.275-.907-.617-1.058-.341-.151-.745-.064-1.106.241-.838.736-1.24 1.859-1.133 2.982.05.53.275.908.617 1.059.341.15.745.063 1.106-.042zm2.079-2.186c1.63-1.821 2.411-4.006 2.202-6.188-.103-1.058-.528-1.819-1.196-2.143-.669-.324-1.468-.145-2.191.502-1.63 1.821-2.411 4.006-2.202 6.188.103 1.058.528 1.819 1.196 2.143.669.324 1.468.145 2.191-.502z"/></svg>',
            xiaohongshu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.615h-2.77v-3.077h-3.69v3.077H7.385V7.385h2.77v3.077h3.69V7.385h2.77v9.23z"/></svg>',
            miniprogram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
            default: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
        };

        return icons[type] || icons.default;
    }

    // HTML转义
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 主加载函数
    async function loadAndRender(pageType) {
        const config = pageConfig[pageType];
        if (!config) {
            console.warn('Unknown page type:', pageType);
            return;
        }

        console.log('Loading data for page:', pageType, config);

        // 加载所有需要的数据
        const promises = [];

        if (config.banners) {
            promises.push(fetchData(config.banners).then(data => {
                if (data) renderBanners(data, pageType);
            }));
        }

        if (config.posters) {
            promises.push(fetchData(config.posters).then(data => {
                if (data) renderPosters(data, pageType);
            }));
        }

        if (config.carousel) {
            promises.push(fetchData(config.carousel).then(data => {
                if (data && typeof renderCarousel === 'function') {
                    renderCarousel(data);
                }
            }));
        }

        if (config.managed) {
            promises.push(fetchData(config.managed).then(data => {
                if (data && typeof renderManagedEvents === 'function') {
                    renderManagedEvents(data);
                }
            }));
        }

        if (config.partners) {
            promises.push(fetchData(config.partners).then(data => {
                if (data && typeof renderPartnerBanners === 'function') {
                    renderPartnerBanners(data);
                }
            }));
        }

        if (config.collaborators) {
            promises.push(fetchData(config.collaborators).then(data => {
                if (data && typeof renderCollaborators === 'function') {
                    renderCollaborators(data);
                }
            }));
        }

        if (config.footer) {
            promises.push(fetchData(config.footer).then(data => {
                if (data) renderFooter(data, pageType);
            }));
        }

        await Promise.all(promises);
        console.log('Data loading complete for page:', pageType);
    }

    // 暴露全局函数
    window.LiveGigsData = {
        loadAndRender: loadAndRender,
        fetchData: fetchData,
        renderFooter: renderFooter,
        renderSocials: renderSocials
    };

    // 自动初始化（如果页面有data-page属性）
    document.addEventListener('DOMContentLoaded', function() {
        const pageEl = document.querySelector('[data-page]');
        if (pageEl) {
            const pageType = pageEl.getAttribute('data-page');
            loadAndRender(pageType);
        }
    });
})();
