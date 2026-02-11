// LiveGigs Asia 前端数据加载器 V2
// 使用GitHub Pages访问数据（无5分钟缓存限制）

const DataLoader = {
    config: {
        // 使用GitHub Pages URL而不是raw.githubusercontent.com
        // 格式: https://emanonent.github.io/asia/content/
        baseUrl: window.location.origin.includes('github.io') 
            ? window.location.origin + '/asia/content/'
            : 'https://emanonent.github.io/asia/content/',

        // 备用：如果GitHub Pages不行，使用jsDelivr CDN（缓存更短）
        cdnUrl: 'https://cdn.jsdelivr.net/gh/EmanonEnt/asia@main/content/'
    },

    pageType: 'index',
    useCDN: false, // 设置为true使用CDN

    init(pageType) {
        this.pageType = pageType || 'index';
        console.log('DataLoader initialized for:', this.pageType);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllData());
        } else {
            this.loadAllData();
        }
    },

    // 获取数据URL
    getDataUrl(filename) {
        const base = this.useCDN ? this.config.cdnUrl : this.config.baseUrl;
        return base + filename + '.json';
    },

    // 获取JSON数据
    async fetchJSON(filename) {
        const url = this.getDataUrl(filename) + '?t=' + Date.now();

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Failed to load ${filename}:`, response.status);
                return null;
            }
            return await response.json();
        } catch (e) {
            console.warn(`Error loading ${filename}:`, e);
            // 如果失败且没用过CDN，尝试CDN
            if (!this.useCDN) {
                console.log('Trying CDN...');
                this.useCDN = true;
                return await this.fetchJSON(filename);
            }
            return null;
        }
    },

    // 加载所有数据
    async loadAllData() {
        console.log('Loading data...');

        try {
            let posterKey = this.pageType === 'other' ? 'index' : this.pageType;

            // 并行加载所有数据
            const [banners, posters, footer] = await Promise.all([
                this.fetchJSON('banners'),
                this.fetchJSON(`posters_${posterKey}`),
                this.fetchJSON(`footer_${this.pageType === 'cn' ? 'cn' : 'global'}`)
            ]);

            if (banners) this.renderBanners(banners);
            if (posters) this.renderPosters(posters);
            if (footer) this.renderFooter(footer);

            // events页面额外加载
            if (this.pageType === 'events') {
                const [carousel, events] = await Promise.all([
                    this.fetchJSON('carousel'),
                    this.fetchJSON('events')
                ]);
                if (carousel) this.renderCarousel(carousel);
                if (events) this.renderEvents(events);
            }

            // partners页面额外加载
            if (this.pageType === 'partners') {
                const collaborators = await this.fetchJSON('collaborators');
                if (collaborators) this.renderCollaborators(collaborators);
            }

            console.log('Data loaded successfully');

        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    renderBanners(banners) {
        window.dispatchEvent(new CustomEvent('bannersLoaded', { detail: banners }));
    },

    renderPosters(posters) {
        window.dispatchEvent(new CustomEvent('postersLoaded', { detail: posters }));
    },

    renderCarousel(carousel) {
        window.dispatchEvent(new CustomEvent('carouselLoaded', { detail: carousel }));
    },

    renderEvents(events) {
        window.dispatchEvent(new CustomEvent('eventsLoaded', { detail: events }));
    },

    renderCollaborators(collaborators) {
        window.dispatchEvent(new CustomEvent('collaboratorsLoaded', { detail: collaborators }));
    },

    renderFooter(footer) {
        if (footer.copyright) {
            const el = document.querySelector('.footer-copyright, .copyright, [data-editable="copyright"]');
            if (el) el.textContent = footer.copyright;
        }
        if (footer.producer) {
            const el = document.querySelector('.producer-logo, [data-editable="producer"]');
            if (el) el.src = footer.producer;
        }
        window.dispatchEvent(new CustomEvent('footerLoaded', { detail: footer }));
    },

    async refresh() {
        await this.loadAllData();
    }
};

window.DataLoader = DataLoader;

// 保留LiveGigsData别名
window.LiveGigsData = {
    getBanners: () => DataLoader.fetchJSON('banners'),
    getPosters: (page) => DataLoader.fetchJSON(`posters_${page}`),
    getCarousel: () => DataLoader.fetchJSON('carousel'),
    getEvents: () => DataLoader.fetchJSON('events'),
    getCollaborators: () => DataLoader.fetchJSON('collaborators'),
    getFooter: (site) => DataLoader.fetchJSON(`footer_${site}`)
};
