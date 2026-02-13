// LiveGigs Data Loader - 智能修复版
// 解决不同页面社交图标显示问题

(function() {
    'use strict';

    // 数据基础路径
    const baseUrl = './content';

    // 页面配置
    const pageConfig = {
        'index': { footer: 'footer-global' },
        'cn': { footer: 'footer-cn' },
        'events': { footer: 'footer-global' },
        'partners': { footer: 'footer-global' },
        'privacy': { footer: 'footer-global' },
        'accessibility': { footer: 'footer-global' }
    };

    // SVG图标
    const icons = {
        facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        weibo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.381-1.025.42-1.909.003-2.54-.781-1.188-2.924-1.123-5.383-.032 0 0-.768.334-.571-.271.381-1.217.324-2.229-.27-2.817-1.344-1.336-4.918.045-7.985 3.088C2.013 10.878.784 13.447.784 15.658c0 4.226 5.407 6.804 10.695 6.804 6.936 0 11.551-4.021 11.551-7.21 0-1.925-1.628-3.013-2.971-3.403z"/></svg>`,
        wechat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>`,
        xiaohongshu: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.923h-2.769v-3.077h-3.692v3.077H7.385V7.077h2.769v3.077h3.692V7.077h2.769v9.846z"/></svg>`,
        miniprogram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
    };

    // 获取页面类型
    function getPageType() {
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
    async function loadJson(filename) {
        try {
            const response = await fetch(`${baseUrl}/${filename}.json?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 智能查找社交容器
    function findSocialContainer() {
        // 尝试多种可能的选择器
        const selectors = [
            '#socialContainer',
            '#footer-social',
            '.social-icons',
            '.footer-social',
            '[class*="social"]'
        ];

        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                console.log(`Found social container: ${selector}`);
                return el;
            }
        }
        return null;
    }

    // 渲染社交图标 - 智能适配版
    function renderSocialIcons(socials) {
        if (!socials || !Array.isArray(socials)) return;

        const container = findSocialContainer();
        if (!container) {
            console.warn('Social container not found');
            return;
        }

        // 获取容器的现有样式
        const computedStyle = window.getComputedStyle(container);
        const existingDisplay = computedStyle.display;

        // 清空但不破坏容器结构
        container.innerHTML = '';

        // 设置容器样式 - 保持原有布局
        container.style.display = existingDisplay === 'flex' ? 'flex' : 'inline-flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '15px';

        // 过滤启用的社交图标
        const enabledSocials = socials.filter(s => s && s.enabled && s.icon);

        if (enabledSocials.length === 0) {
            console.warn('No enabled social icons found');
            return;
        }

        // 创建图标
        enabledSocials.forEach(social => {
            const iconSvg = icons[social.icon] || icons.facebook;
            const link = social.link || '#';

            const a = document.createElement('a');
            a.href = link;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            // 关键：使用内联样式确保不被拉伸
            a.style.cssText = `
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 44px !important;
                height: 44px !important;
                min-width: 44px !important;
                min-height: 44px !important;
                max-width: 44px !important;
                max-height: 44px !important;
                background: #1a1a1a !important;
                border-radius: 50% !important;
                transition: all 0.3s ease !important;
                text-decoration: none !important;
                overflow: hidden !important;
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
            `;

            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = iconSvg;
            svgContainer.style.cssText = `
                width: 22px !important;
                height: 22px !important;
                min-width: 22px !important;
                min-height: 22px !important;
                max-width: 22px !important;
                max-height: 22px !important;
                color: #c0c0c0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
                pointer-events: none !important;
            `;

            // 悬停效果
            a.addEventListener('mouseenter', () => {
                a.style.background = '#8b0000';
                a.style.transform = 'translateY(-3px)';
                svgContainer.style.color = '#ffffff';
            });

            a.addEventListener('mouseleave', () => {
                a.style.background = '#1a1a1a';
                a.style.transform = 'translateY(0)';
                svgContainer.style.color = '#c0c0c0';
            });

            a.appendChild(svgContainer);
            container.appendChild(a);
        });

        console.log(`Rendered ${enabledSocials.length} social icons`);
    }

    // 渲染底部
    function renderFooter(data) {
        if (!data) return;

        // 文本内容更新
        const textElements = {
            'footer-site-name': data.siteName,
            'footer-site-asia': data.siteNameAsia,
            'footer-contact-text': data.contactText,
            'footer-email': data.email,
            'footer-address': data.address,
            'footer-copyright': data.copyright
        };

        for (const [id, value] of Object.entries(textElements)) {
            const el = document.getElementById(id) || document.querySelector(`.${id}`);
            if (el && value) {
                if (id === 'footer-email' && el.tagName === 'A') {
                    el.href = `mailto:${value}`;
                    el.textContent = value;
                } else {
                    el.textContent = value;
                }
            }
        }

        // 制作单位Logo
        const producerEl = document.getElementById('footer-producer') || document.querySelector('.producer-logo');
        if (producerEl && data.producerLogo) {
            const img = producerEl.tagName === 'IMG' ? producerEl : producerEl.querySelector('img');
            if (img) img.src = data.producerLogo;
        }

        // 社交图标
        renderSocialIcons(data.socials);
    }

    // 主加载函数
    async function loadAndRender() {
        const pageType = getPageType();
        const config = pageConfig[pageType];

        console.log(`Loading data for page: ${pageType}`);

        if (config && config.footer) {
            const footerData = await loadJson(config.footer);
            if (footerData) {
                renderFooter(footerData);
            }
        }
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndRender);
    } else {
        loadAndRender();
    }

    // 暴露全局刷新函数
    window.livegigsRefresh = loadAndRender;

})();
