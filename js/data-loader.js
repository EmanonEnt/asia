/**
 * LiveGigs Data Loader - Ultimate Fix
 * 原则：只更新已有元素的数据，不创建/删除任何DOM元素
 */

(function() {
    'use strict';

    const CONFIG = {
        contentPath: './content/',
        debug: true
    };

    function log(...args) {
        if (CONFIG.debug) console.log('[DataLoader]', ...args);
    }

    // 安全地更新元素文本
    function safeUpdateText(selector, value) {
        if (!value || value === 'undefined' || value === 'null') {
            log('Skipping invalid value for', selector);
            return;
        }

        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el && el.textContent !== value) {
                el.textContent = value;
                log('Updated text:', selector, '->', value);
            }
        });
    }

    // 安全地更新图片
    function safeUpdateImage(selector, src) {
        if (!src || src === 'undefined' || src === 'null') {
            log('Skipping invalid image for', selector);
            return;
        }

        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el && el.src !== src) {
                el.src = src;
                log('Updated image:', selector, '->', src);
            }
        });
    }

    // 安全地更新链接
    function safeUpdateLink(selector, href) {
        if (!href || href === 'undefined' || href === 'null') {
            log('Skipping invalid link for', selector);
            return;
        }

        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el && el.href !== href) {
                el.href = href;
                log('Updated link:', selector, '->', href);
            }
        });
    }

    // 加载JSON - 不处理错误，让页面保持原样
    async function loadJSON(filename) {
        try {
            const url = `${CONFIG.contentPath}${filename}.json?t=${Date.now()}`;
            log('Loading:', url);

            const response = await fetch(url);
            if (!response.ok) {
                log('File not found or error:', filename, response.status);
                return null;
            }

            const data = await response.json();
            log('Loaded successfully:', filename);
            return data;

        } catch (e) {
            log('Error loading', filename, ':', e.message);
            return null;
        }
    }

    // 更新底部 - 只更新文本，不改变结构
    function updateFooter(data) {
        if (!data) return;

        log('Updating footer...');

        // 邮箱
        if (data.email) {
            const emailLink = document.querySelector('a[href^="mailto"]');
            if (emailLink) {
                emailLink.href = `mailto:${data.email}`;
                emailLink.textContent = data.email;
            }
        }

        // 电话
        if (data.phone) {
            const phoneLink = document.querySelector('a[href^="tel"]');
            if (phoneLink) {
                phoneLink.href = `tel:${data.phone}`;
                phoneLink.textContent = data.phone;
            }
        }

        // 地址
        if (data.address) {
            const addressEl = document.querySelector('.footer-contact-right .contact-item');
            if (addressEl) {
                addressEl.innerHTML = data.address.replace(/\n/g, '<br>');
            }
        }

        // 社交链接
        if (data.social && Array.isArray(data.social)) {
            data.social.forEach(social => {
                if (social.platform && social.url) {
                    const icon = document.querySelector(`[data-platform="${social.platform}"]`);
                    if (icon) {
                        icon.href = social.url;
                    }
                }
            });
        }

        log('Footer updated');
    }

    // 更新海报 - 只更新已有海报
    function updatePosters(posters) {
        if (!posters || !Array.isArray(posters)) return;

        log('Updating posters...');

        posters.forEach((poster, index) => {
            const id = index + 1;
            const posterEl = document.querySelector(`[data-poster-id="${id}"]`);

            if (!posterEl) {
                log('Poster not found:', id);
                return;
            }

            // 更新图片
            if (poster.image) {
                const img = posterEl.querySelector('img');
                if (img) img.src = poster.image;
            }

            // 更新标题
            if (poster.title) {
                const title = posterEl.querySelector('.poster-title');
                if (title) title.textContent = poster.title;
            }

            // 更新链接文字
            if (poster.linkText) {
                const link = posterEl.querySelector('.poster-link');
                if (link) link.textContent = poster.linkText;
            }

            // 更新链接地址
            if (poster.link) {
                posterEl.setAttribute('data-link', poster.link);
                const link = posterEl.querySelector('.poster-link');
                if (link) link.href = poster.link;
            }
        });

        log('Posters updated');
    }

    // 页面初始化 - 不修改任何DOM结构
    async function init(pageType) {
        log('Initializing for page:', pageType);

        // 加载底部数据（所有页面共用）
        const isCN = pageType === 'cn';
        const footerFile = isCN ? 'footer-cn' : 'footer-global';
        const footerData = await loadJSON(footerFile);
        if (footerData) {
            updateFooter(footerData);
        }

        // 根据页面类型加载其他数据
        if (pageType === 'events') {
            const postersData = await loadJSON('events-posters');
            if (postersData && postersData.posters) {
                updatePosters(postersData.posters);
            }
        }
        else if (pageType === 'index') {
            const postersData = await loadJSON('index-posters');
            if (postersData && postersData.posters) {
                updatePosters(postersData.posters);
            }
        }
        else if (pageType === 'cn') {
            const postersData = await loadJSON('cn-posters');
            if (postersData && postersData.posters) {
                updatePosters(postersData.posters);
            }
        }
        else if (pageType === 'partners') {
            // Partners页面特殊处理
            log('Partners page - minimal updates');
        }

        log('Initialization complete');
    }

    // 暴露到全局
    window.DataLoader = {
        init: init,
        loadJSON: loadJSON,
        updateFooter: updateFooter,
        updatePosters: updatePosters
    };

    log('DataLoader loaded successfully');
})();
