// LiveGigs Asia 前端数据加载器 - 从GitHub获取数据
// 兼容现有代码：DataLoader.init('cn') 或 DataLoader.init('other')

const DataLoader = {
    config: {
        owner: 'EmanonEnt',
        repo: 'asia',
        branch: 'main',
        contentPath: 'content'
    },

    pageType: 'index',

    init(pageType) {
        this.pageType = pageType || 'index';
        console.log('DataLoader initialized for:', this.pageType);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllData());
        } else {
            this.loadAllData();
        }
    },

    async fetchJSON(filename) {
        const url = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${this.config.contentPath}/${filename}.json`;

        try {
            const response = await fetch(url + '?t=' + Date.now());
            if (!response.ok) return null;
            return await response.json();
        } catch (e) {
            console.warn(`Error loading ${filename}:`, e);
            return null;
        }
    },

    async loadAllData() {
        console.log('Loading data from GitHub...');

        try {
            let posterKey = this.pageType === 'other' ? 'index' : this.pageType;

            const banners = await this.fetchJSON('banners');
            if (banners) this.renderBanners(banners);

            const posters = await this.fetchJSON(`posters_${posterKey}`);
            if (posters) this.renderPosters(posters);

            if (this.pageType === 'events') {
                const carousel = await this.fetchJSON('carousel');
                if (carousel) this.renderCarousel(carousel);

                const events = await this.fetchJSON('events');
                if (events) this.renderEvents(events);
            }

            if (this.pageType === 'partners') {
                const collaborators = await this.fetchJSON('collaborators');
                if (collaborators) this.renderCollaborators(collaborators);
            }

            const footerKey = (this.pageType === 'cn') ? 'cn' : 'global';
            const footer = await this.fetchJSON(`footer_${footerKey}`);
            if (footer) this.renderFooter(footer);

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

window.LiveGigsData = {
    getBanners: () => DataLoader.fetchJSON('banners'),
    getPosters: (page) => DataLoader.fetchJSON(`posters_${page}`),
    getCarousel: () => DataLoader.fetchJSON('carousel'),
    getEvents: () => DataLoader.fetchJSON('events'),
    getCollaborators: () => DataLoader.fetchJSON('collaborators'),
    getFooter: (site) => DataLoader.fetchJSON(`footer_${site}`)
};
