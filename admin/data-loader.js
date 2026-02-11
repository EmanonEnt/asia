// LiveGigs Asia 数据加载器
const dataLoader = {
    github: {
        owner: 'EmanonEnt',
        repo: 'asia',
        branch: 'main',
        contentPath: 'content'
    },

    cache: {
        banners: null,
        posters: { index: null, cn: null, events: null },
        events: null,
        collaborators: null,
        footer: { global: null, cn: null },
        carousel: null
    },

    init() {
        this.loadAllFromStorage();
    },

    loadAllFromStorage() {
        this.cache.banners = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.banners) || '[]');
        this.cache.posters.index = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.posters + '_index') || '[{},{},{}]');
        this.cache.posters.cn = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.posters + '_cn') || '[{},{},{}]');
        this.cache.posters.events = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.posters + '_events') || '[{},{},{}]');
        this.cache.events = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.events) || '[]');
        this.cache.collaborators = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.collaborators) || '[]');
        this.cache.footer.global = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.footerGlobal) || '{"copyright":"© 2026 LIVEGIGS ASIA","social":[],"producer":"./image/emanonent-logo.png"}');
        this.cache.footer.cn = JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.footerCN) || '{"copyright":"© 2026 LIVEGIGS","social":[],"producer":"./image/emanonent-logo.png"}');
        this.cache.carousel = JSON.parse(localStorage.getItem('lg_carousel') || '[{}]');
    },

    getToken() {
        return localStorage.getItem(ADMIN_CONFIG.storageKeys.githubToken) || '';
    },

    async getGitHubFile(path) {
        const token = this.getToken();
        if (!token) return { success: false, error: '未设置GitHub Token' };

        try {
            const response = await fetch(`https://api.github.com/repos/${this.github.owner}/${this.github.repo}/contents/${path}?ref=${this.github.branch}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status === 404) {
                return { success: false, notFound: true };
            }

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message };
            }

            const data = await response.json();
            return { 
                success: true, 
                content: JSON.parse(atob(data.content)),
                sha: data.sha
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    async saveGitHubFile(path, content, sha = null) {
        const token = this.getToken();
        if (!token) return { success: false, error: '未设置GitHub Token' };

        try {
            const body = {
                message: `Update ${path} via admin`,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
                branch: this.github.branch
            };

            if (sha) body.sha = sha;

            const response = await fetch(`https://api.github.com/repos/${this.github.owner}/${this.github.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message };
            }

            const data = await response.json();
            return { success: true, sha: data.content.sha };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Banners
    getBanners() {
        return this.cache.banners || [];
    },

    async saveBanners(banners) {
        this.cache.banners = banners;
        localStorage.setItem(ADMIN_CONFIG.storageKeys.banners, JSON.stringify(banners));

        const path = `${this.github.contentPath}/banners.json`;
        const existing = await this.getGitHubFile(path);
        const result = await this.saveGitHubFile(path, banners, existing.sha);

        if (result.success) {
            this.updateDataVersion();
        }
        return result;
    },

    // Posters
    getPosters(page) {
        return this.cache.posters[page] || [{},{},{}];
    },

    async savePosters(page, posters) {
        this.cache.posters[page] = posters;
        localStorage.setItem(ADMIN_CONFIG.storageKeys.posters + '_' + page, JSON.stringify(posters));

        const path = `${this.github.contentPath}/posters_${page}.json`;
        const existing = await this.getGitHubFile(path);
        const result = await this.saveGitHubFile(path, posters, existing.sha);

        if (result.success) {
            this.updateDataVersion();
        }
        return result;
    },

    // Carousel
    getCarousel() {
        return this.cache.carousel || [{}];
    },

    setCarousel(items) {
        this.cache.carousel = items;
        localStorage.setItem('lg_carousel', JSON.stringify(items));
    },

    async saveCarousel(items) {
        this.setCarousel(items);
        const path = `${this.github.contentPath}/carousel.json`;
        const existing = await this.getGitHubFile(path);
        const result = await this.saveGitHubFile(path, items, existing.sha);

        if (result.success) {
            this.updateDataVersion();
        }
        return result;
    },

    // Events
    getEvents() {
        return this.cache.events || [];
    },

    async saveEvents(events) {
        this.cache.events = events;
        localStorage.setItem(ADMIN_CONFIG.storageKeys.events, JSON.stringify(events));

        const path = `${this.github.contentPath}/events.json`;
        const existing = await this.getGitHubFile(path);
        const result = await this.saveGitHubFile(path, events, existing.sha);

        if (result.success) {
            this.updateDataVersion();
        }
        return result;
    },

    // Collaborators
    getCollaborators() {
        return this.cache.collaborators || [];
    },

    async saveCollaborators(collabs) {
        this.cache.collaborators = collabs;
        localStorage.setItem(ADMIN_CONFIG.storageKeys.collaborators, JSON.stringify(collabs));

        const path = `${this.github.contentPath}/collaborators.json`;
        const existing = await this.getGitHubFile(path);
        const result = await this.saveGitHubFile(path, collabs, existing.sha);

        if (result.success) {
            this.updateDataVersion();
        }
        return result;
    },

    // Footer
    getFooter(site) {
        return this.cache.footer[site] || { copyright: '', social: [], producer: '' };
    },

    async saveFooter(site, data) {
        this.cache.footer[site] = data;
        const key = site === 'cn' ? ADMIN_CONFIG.storageKeys.footerCN : ADMIN_CONFIG.storageKeys.footerGlobal;
        localStorage.setItem(key, JSON.stringify(data));

        const path = `${this.github.contentPath}/footer_${site}.json`;
        const existing = await this.getGitHubFile(path);
        const result = await this.saveGitHubFile(path, data, existing.sha);

        if (result.success) {
            this.updateDataVersion();
        }
        return result;
    },

    // Data Version
    updateDataVersion() {
        const version = Date.now().toString();
        localStorage.setItem(ADMIN_CONFIG.storageKeys.dataVersion, version);
        return version;
    },

    getDataVersion() {
        return localStorage.getItem(ADMIN_CONFIG.storageKeys.dataVersion) || '0';
    },

    // Export/Import
    exportAll() {
        return {
            banners: this.getBanners(),
            posters: {
                index: this.getPosters('index'),
                cn: this.getPosters('cn'),
                events: this.getPosters('events')
            },
            carousel: this.getCarousel(),
            events: this.getEvents(),
            collaborators: this.getCollaborators(),
            footer: {
                global: this.getFooter('global'),
                cn: this.getFooter('cn')
            },
            version: this.getDataVersion(),
            exportedAt: new Date().toISOString()
        };
    },

    async importAll(data) {
        if (data.banners) await this.saveBanners(data.banners);
        if (data.posters) {
            if (data.posters.index) await this.savePosters('index', data.posters.index);
            if (data.posters.cn) await this.savePosters('cn', data.posters.cn);
            if (data.posters.events) await this.savePosters('events', data.posters.events);
        }
        if (data.carousel) await this.saveCarousel(data.carousel);
        if (data.events) await this.saveEvents(data.events);
        if (data.collaborators) await this.saveCollaborators(data.collaborators);
        if (data.footer) {
            if (data.footer.global) await this.saveFooter('global', data.footer.global);
            if (data.footer.cn) await this.saveFooter('cn', data.footer.cn);
        }
        return { success: true };
    },

    async resetAll() {
        const empty = {
            banners: [],
            posters: { index: [{},{},{}], cn: [{},{},{}], events: [{},{},{}] },
            carousel: [{}],
            events: [],
            collaborators: [],
            footer: {
                global: { copyright: '© 2026 LIVEGIGS ASIA', social: [], producer: './image/emanonent-logo.png' },
                cn: { copyright: '© 2026 LIVEGIGS', social: [], producer: './image/emanonent-logo.png' }
            }
        };
        return await this.importAll(empty);
    },

    // Sync from GitHub
    async syncFromGitHub() {
        const files = [
            { key: 'banners', path: 'banners.json', setter: (d) => { this.cache.banners = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.banners, JSON.stringify(d)); } },
            { key: 'posters_index', path: 'posters_index.json', setter: (d) => { this.cache.posters.index = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.posters + '_index', JSON.stringify(d)); } },
            { key: 'posters_cn', path: 'posters_cn.json', setter: (d) => { this.cache.posters.cn = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.posters + '_cn', JSON.stringify(d)); } },
            { key: 'posters_events', path: 'posters_events.json', setter: (d) => { this.cache.posters.events = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.posters + '_events', JSON.stringify(d)); } },
            { key: 'carousel', path: 'carousel.json', setter: (d) => { this.cache.carousel = d; localStorage.setItem('lg_carousel', JSON.stringify(d)); } },
            { key: 'events', path: 'events.json', setter: (d) => { this.cache.events = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.events, JSON.stringify(d)); } },
            { key: 'collaborators', path: 'collaborators.json', setter: (d) => { this.cache.collaborators = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.collaborators, JSON.stringify(d)); } },
            { key: 'footer_global', path: 'footer_global.json', setter: (d) => { this.cache.footer.global = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.footerGlobal, JSON.stringify(d)); } },
            { key: 'footer_cn', path: 'footer_cn.json', setter: (d) => { this.cache.footer.cn = d; localStorage.setItem(ADMIN_CONFIG.storageKeys.footerCN, JSON.stringify(d)); } }
        ];

        let success = 0;
        let errors = [];

        for (const file of files) {
            const result = await this.getGitHubFile(`${this.github.contentPath}/${file.path}`);
            if (result.success) {
                file.setter(result.content);
                success++;
            } else if (!result.notFound) {
                errors.push(`${file.path}: ${result.error}`);
            }
        }

        return { 
            success: errors.length === 0, 
            synced: success, 
            errors: errors,
            error: errors.join('; ')
        };
    }
};

function initDataLoader() {
    dataLoader.init();
}
