// LiveGigs Asia - Data Loader
// 修复版：适配原始页面结构

(function() {
    'use strict';

    const config = {
        baseUrl: 'https://emanonent.github.io/asia/content',
        version: Date.now()
    };

    // 页面配置
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
            banners: 'partners-banners',
            collaborators: 'collaborators',
            footer: 'footer-global'
        },
        'privacy': {
            footer: 'footer-global'
        },
        'accessibility': {
            footer: 'footer-global'
        },
        'other': {
            footer: 'footer-global'
        }
    };

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

    // 渲染底部 - 适配原始页面结构
    function renderFooter(data, pageType) {
        if (!data) return;

        console.log('Rendering footer for:', pageType);

        // 1. 更新版权信息
        const copyrightElements = document.querySelectorAll('.copyright, [data-editable="footer-copyright"]');
        copyrightElements.forEach(el => {
            if (data.copyright) {
                el.textContent = data.copyright;
                el.setAttribute('data-text', data.copyright);
            }
        });

        // 2. 更新社交链接 - 适配 socialContainer
        const socialContainers = document.querySelectorAll('#socialContainer, .social-links, #footer-social');
        socialContainers.forEach(container => {
            if (!data.social || !container) return;

            // 清空现有内容
            container.innerHTML = '';

            // 添加社交图标
            data.social.forEach((item, index) => {
                if (!item.icon && !item.platform) return;

                const a = document.createElement('a');
                a.href = item.link || '#';
                a.className = 'social-icon';
                a.target = '_blank';
                a.setAttribute('data-editable', `social-${item.platform || index}`);
                a.setAttribute('data-href', item.link || '#');
                a.setAttribute('data-platform', item.platform || 'social');
                a.title = item.name || item.platform || 'Social';

                // 使用SVG图标或图片
                if (item.icon && item.icon.endsWith('.png')) {
                    a.innerHTML = `<img src="${item.icon}" alt="${item.name}" style="width:22px;height:22px;" onerror="this.style.display='none'">`;
                } else {
                    // 默认SVG图标
                    const svgPaths = {
                        'facebook': '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
                        'instagram': '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
                        'youtube': '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
                        'x': '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
                        'weibo': '<path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.381-1.025.421-1.905.001-2.535-.789-1.188-2.924-1.109-5.382-.031 0 0-.768.334-.571-.271.383-1.217.324-2.229-.268-2.816-1.344-1.336-4.918.045-7.985 3.088C2.013 10.878.784 13.447.784 15.658c0 4.226 5.407 6.804 10.695 6.804 6.936 0 11.551-4.021 11.551-7.21 0-1.925-1.628-3.013-2.971-3.403zM20.245 5.436c-1.576-1.757-3.896-2.421-5.848-1.854l.021-.007c-.406.124-.643.539-.524.938.12.406.537.639.938.525 1.413-.427 2.98.083 4.17 1.41 1.186 1.326 1.389 3.098.636 4.458-.18.334-.057.753.277.938.334.18.753.057.938-.277 1.041-1.822.752-4.254-.608-6.131zm-1.695 1.521c-.818-.914-2.024-1.259-3.042-.962-.301.09-.469.405-.379.702.09.301.405.469.702.379.597-.18 1.253.027 1.753.583.502.556.589 1.295.322 1.918-.105.24-.009.525.231.63.24.105.525.009.63-.231.42-.985.27-2.198-.217-3.019z"/>',
                        'xiaohongshu': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
                        'wechat': '<path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>',
                        'miniprogram': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/>'
                    };

                    const path = svgPaths[item.platform] || svgPaths['facebook'];
                    a.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${path}</svg>`;
                }

                container.appendChild(a);
            });
        });

        // 3. 更新Producer logo
        const producerElements = document.querySelectorAll('.producer-logo, [data-editable="producer-logo"]');
        producerElements.forEach(el => {
            if (data.producer) {
                el.src = data.producer;
                el.setAttribute('data-src', data.producer);
            }
        });

        // 4. 更新联系信息
        if (data.email) {
            const emailElements = document.querySelectorAll('[data-editable="footer-email"] a, .contact-item a[href^="mailto"]');
            emailElements.forEach(el => {
                el.href = `mailto:${data.email}`;
                el.textContent = data.email;
            });
        }

        if (data.phone) {
            const phoneElements = document.querySelectorAll('[data-editable="footer-phone"] a, .contact-item a[href^="tel"]');
            phoneElements.forEach(el => {
                el.href = `tel:${data.phone}`;
                el.textContent = data.phone;
            });
        }

        console.log('Footer rendered successfully');
    }

    // 主加载函数
    window.LiveGigsData = {
        loadAndRender: async function(pageType) {
            console.log('Loading data for page:', pageType);
            const config = pageConfig[pageType];
            if (!config) {
                console.warn('No config found for page:', pageType);
                return;
            }

            // 加载底部数据
            if (config.footer) {
                const data = await loadJSON(config.footer);
                if (data) renderFooter(data, pageType);
            }
        }
    };

    console.log('LiveGigs Data Loader loaded successfully');
})();
