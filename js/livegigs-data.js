/**
 * LiveGigs Asia - Data Loader
 * 自动从 GitHub 加载 JSON 数据并渲染到页面
 * 带缓存清除机制，确保后台更新后前端自动刷新
 */

const LiveGigsData = {
    // GitHub 原始内容基础 URL
    baseUrl: 'https://raw.githubusercontent.com/EmanonEnt/asia/main/content',

    // 缓存控制 - 添加时间戳防止缓存
    getUrl: function(filename) {
        const timestamp = new Date().getTime();
        return `${this.baseUrl}/${filename}?t=${timestamp}`;
    },

    // 加载 JSON 数据
    load: async function(filename) {
        try {
            const url = this.getUrl(filename);
            console.log('[LiveGigs] Loading:', url);

            const response = await fetch(url, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                console.warn('[LiveGigs] File not found:', filename);
                return null;
            }

            const data = await response.json();
            console.log('[LiveGigs] Loaded:', filename, data);
            return data;
        } catch (error) {
            console.error('[LiveGigs] Error loading', filename, error);
            return null;
        }
    },

    // 更新元素内容
    updateElement: function(selector, value, type = 'text') {
        const element = document.querySelector(`[data-editable="${selector}"]`);
        if (!element || !value) return false;

        switch(type) {
            case 'text':
                element.textContent = value;
                element.setAttribute('data-text', value);
                break;
            case 'src':
            case 'image':
                element.src = value;
                element.setAttribute('data-src', value);
                break;
            case 'href':
            case 'link':
                if (element.tagName === 'A') {
                    element.href = value;
                } else if (element.tagName === 'BUTTON') {
                    element.onclick = function() { window.open(value, '_blank'); };
                }
                element.setAttribute('data-href', value);
                break;
            case 'poster-link':
                element.setAttribute('data-link', value);
                const linkEl = element.querySelector('.poster-link');
                if (linkEl) linkEl.href = value;
                break;
        }
        return true;
    },

    // 渲染 Banner 数据
    renderBanners: function(banners) {
        if (!banners || !Array.isArray(banners)) return;

        banners.forEach((banner, index) => {
            const i = index + 1;
            if (banner.image) this.updateElement(`banner-${i}-image`, banner.image, 'src');
            if (banner.title) this.updateElement(`banner-${i}-title`, banner.title, 'text');
            if (banner.buttonText) this.updateElement(`banner-${i}-btn`, banner.buttonText, 'text');
            if (banner.buttonLink) this.updateElement(`banner-${i}-btn`, banner.buttonLink, 'href');
        });

        console.log('[LiveGigs] Banners rendered:', banners.length);
    },

    // 渲染海报数据
    renderPosters: function(posters) {
        if (!posters || !Array.isArray(posters)) return;

        posters.forEach((poster, index) => {
            const i = index + 1;
            if (poster.image) this.updateElement(`poster-${i}-image`, poster.image, 'src');
            if (poster.title) this.updateElement(`poster-${i}-title`, poster.title, 'text');
            if (poster.linkText) this.updateElement(`poster-${i}-link-text`, poster.linkText, 'text');
            if (poster.link) {
                const posterEl = document.querySelector(`[data-poster-id="${i}"]`);
                if (posterEl) {
                    posterEl.setAttribute('data-link', poster.link);
                    const linkEl = posterEl.querySelector('.poster-link');
                    if (linkEl) linkEl.href = poster.link;
                }
            }
        });

        console.log('[LiveGigs] Posters rendered:', posters.length);
    },

    // 渲染底部数据
    renderFooter: function(footer) {
        if (!footer) return;

        if (footer.email) {
            const emailEl = document.querySelector('[data-editable="footer-email"] a');
            if (emailEl) {
                emailEl.href = 'mailto:' + footer.email;
                emailEl.textContent = footer.email;
            }
        }

        if (footer.phone) {
            const phoneEl = document.querySelector('[data-editable="footer-phone"] a');
            if (phoneEl) {
                phoneEl.href = 'tel:' + footer.phone;
                phoneEl.textContent = footer.phone;
            }
        }

        if (footer.address) {
            const addrEl = document.querySelector('[data-editable="footer-address"]');
            if (addrEl) addrEl.innerHTML = footer.address;
        }

        if (footer.copyright) {
            this.updateElement('footer-copyright', footer.copyright, 'text');
        }

        // 社交媒体
        if (footer.social && Array.isArray(footer.social)) {
            const container = document.getElementById('socialContainer');
            if (container) {
                container.innerHTML = '';
                footer.social.forEach(social => {
                    if (social.platform && social.href) {
                        const a = document.createElement('a');
                        a.href = social.href;
                        a.className = 'social-icon';
                        a.title = social.platform;
                        a.setAttribute('data-platform', social.platform);
                        a.setAttribute('data-editable', 'social-' + social.platform);
                        a.setAttribute('data-href', social.href);
                        a.innerHTML = this.getSocialIcon(social.platform);
                        container.appendChild(a);
                    }
                });
            }
        }

        console.log('[LiveGigs] Footer rendered');
    },

    // 获取社交媒体图标 SVG
    getSocialIcon: function(platform) {
        const icons = {
            facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            weibo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.402-.649.386-1.018.425-1.893.003-2.521-.793-1.17-2.966-1.109-5.419-.031 0 0-.777.34-.578-.275.381-1.215.324-2.234-.27-2.822-1.348-1.335-4.938.045-8.023 3.084C1.353 10.476 0 12.555 0 14.359c0 3.457 4.439 5.56 8.783 5.56 5.691 0 9.479-3.307 9.479-5.929 0-1.587-1.339-2.486-2.203-2.741zm.814-4.278c-.686-.803-1.697-1.135-2.658-.984-.389.06-.659.417-.599.806.06.389.417.659.806.599.524-.082 1.057.095 1.416.513.36.418.466.977.296 1.474-.116.351.073.731.424.848.351.116.731-.073.848-.424.315-.956.129-2.062-.533-2.832zm3.182-2.717c-1.423-1.667-3.527-2.357-5.527-2.044-.389.06-.659.417-.599.806.06.389.417.659.806.599 1.494-.234 3.043.28 4.095 1.512 1.053 1.232 1.357 2.906.912 4.399-.109.351.09.723.441.832.351.109.723-.09.832-.441.578-1.988.189-4.166-1.26-5.663z"/></svg>',
            wechat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>'
        };
        return icons[platform.toLowerCase()] || icons.facebook;
    },

    // 加载并渲染所有数据
    loadAndRender: async function(pageType) {
        console.log('[LiveGigs] Loading data for page:', pageType);

        // 加载 Banner 数据（index 和 cn 共用）
        const banners = await this.load('banners.json');
        if (banners && banners.banners) {
            this.renderBanners(banners.banners);
        }

        // 加载海报数据
        const postersFile = pageType === 'cn' ? 'cn-posters.json' : 'index-posters.json';
        const posters = await this.load(postersFile);
        if (posters && posters.posters) {
            this.renderPosters(posters.posters);
        }

        // 加载底部数据
        const footerFile = pageType === 'cn' ? 'footer-cn.json' : 'footer-global.json';
        const footer = await this.load(footerFile);
        if (footer) {
            this.renderFooter(footer);
        }

        console.log('[LiveGigs] Data loading complete for:', pageType);
    },

    // 强制刷新（清除缓存后重新加载）
    refresh: function(pageType) {
        console.log('[LiveGigs] Force refreshing...');
        this.loadAndRender(pageType);
    }
};

// 自动初始化（如果页面有 data-page 属性）
document.addEventListener('DOMContentLoaded', function() {
    const pageAttr = document.body.getAttribute('data-page');
    if (pageAttr) {
        LiveGigsData.loadAndRender(pageAttr);
    }
});

// 暴露到全局
window.LiveGigsData = LiveGigsData;
