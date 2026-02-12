// LiveGigs Asia 数据加载器
// 支持 localStorage 和 GitHub API

const ADMIN_CONFIG = {
    version: '3.0.0',
    github: {
        owner: 'EmanonEnt',
        repo: 'asia',
        branch: 'main',
        contentPath: 'content'
    },
    storageKeys: {
        banners: 'lg_banners',
        posters_index: 'lg_posters_index',
        posters_cn: 'lg_posters_cn',
        posters_events: 'lg_posters_events',
        events: 'lg_events',
        carousel: 'lg_carousel',
        collaborators: 'lg_collaborators',
        footer_global: 'lg_footer_global',
        footer_cn: 'lg_footer_cn',
        githubToken: 'github_token'
    }
};

const dataLoader = {
    // ========== Banner ==========
    getBanners() {
        return JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.banners) || '[]');
    },
    saveBanners(banners) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.banners, JSON.stringify(banners));
    },

    // ========== Posters ==========
    getPosters(page) {
        const key = ADMIN_CONFIG.storageKeys[`posters_${page}`];
        return JSON.parse(localStorage.getItem(key) || '[{},{},{}]');
    },
    savePosters(page, posters) {
        const key = ADMIN_CONFIG.storageKeys[`posters_${page}`];
        localStorage.setItem(key, JSON.stringify(posters));
    },

    // ========== Carousel (Poster 2) ==========
    getCarousel() {
        return JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.carousel) || '[{}]');
    },
    saveCarousel(items) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.carousel, JSON.stringify(items));
    },

    // ========== Events ==========
    getEvents() {
        return JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.events) || '[]');
    },
    saveEvents(events) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.events, JSON.stringify(events));
    },

    // ========== Collaborators ==========
    getCollaborators() {
        return JSON.parse(localStorage.getItem(ADMIN_CONFIG.storageKeys.collaborators) || '[]');
    },
    saveCollaborators(collabs) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.collaborators, JSON.stringify(collabs));
    },

    // ========== Footer ==========
    getFooter(site) {
        const key = site === 'cn' ? ADMIN_CONFIG.storageKeys.footer_cn : ADMIN_CONFIG.storageKeys.footer_global;
        return JSON.parse(localStorage.getItem(key) || '{"copyright":"","social":[],"producer":""}');
    },
    saveFooter(site, data) {
        const key = site === 'cn' ? ADMIN_CONFIG.storageKeys.footer_cn : ADMIN_CONFIG.storageKeys.footer_global;
        localStorage.setItem(key, JSON.stringify(data));
    },

    // ========== GitHub Sync ==========
    async syncFromGitHub() {
        const token = localStorage.getItem(ADMIN_CONFIG.storageKeys.githubToken);
        if (!token) {
            return { success: false, error: '未设置 GitHub Token' };
        }

        const files = [
            'banners.json',
            'posters-index.json',
            'posters-cn.json',
            'posters-events.json',
            'events.json',
            'carousel.json',
            'collaborators.json',
            'footer-global.json',
            'footer-cn.json'
        ];

        try {
            for (const file of files) {
                const url = `https://api.github.com/repos/${ADMIN_CONFIG.github.owner}/${ADMIN_CONFIG.github.repo}/contents/${ADMIN_CONFIG.github.contentPath}/${file}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `token ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = JSON.parse(atob(data.content));

                    // 保存到 localStorage
                    const key = file.replace('.json', '').replace(/-/g, '_');
                    if (file === 'banners.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.banners, JSON.stringify(content));
                    if (file === 'posters-index.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.posters_index, JSON.stringify(content));
                    if (file === 'posters-cn.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.posters_cn, JSON.stringify(content));
                    if (file === 'posters-events.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.posters_events, JSON.stringify(content));
                    if (file === 'events.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.events, JSON.stringify(content));
                    if (file === 'carousel.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.carousel, JSON.stringify(content));
                    if (file === 'collaborators.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.collaborators, JSON.stringify(content));
                    if (file === 'footer-global.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.footer_global, JSON.stringify(content));
                    if (file === 'footer-cn.json') localStorage.setItem(ADMIN_CONFIG.storageKeys.footer_cn, JSON.stringify(content));
                }
            }
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // ========== Export/Import ==========
    exportAll() {
        return {
            banners: this.getBanners(),
            posters_index: this.getPosters('index'),
            posters_cn: this.getPosters('cn'),
            posters_events: this.getPosters('events'),
            events: this.getEvents(),
            carousel: this.getCarousel(),
            collaborators: this.getCollaborators(),
            footer_global: this.getFooter('global'),
            footer_cn: this.getFooter('cn')
        };
    },
    importAll(data) {
        if (data.banners) this.saveBanners(data.banners);
        if (data.posters_index) this.savePosters('index', data.posters_index);
        if (data.posters_cn) this.savePosters('cn', data.posters_cn);
        if (data.posters_events) this.savePosters('events', data.posters_events);
        if (data.events) this.saveEvents(data.events);
        if (data.carousel) this.saveCarousel(data.carousel);
        if (data.collaborators) this.saveCollaborators(data.collaborators);
        if (data.footer_global) this.saveFooter('global', data.footer_global);
        if (data.footer_cn) this.saveFooter('cn', data.footer_cn);
    },
    resetAll() {
        Object.values(ADMIN_CONFIG.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// 初始化
dataLoader.init = function() {
    // 确保默认值
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.banners)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.banners, '[]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.posters_index)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.posters_index, '[{},{},{}]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.posters_cn)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.posters_cn, '[{},{},{}]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.posters_events)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.posters_events, '[{},{},{}]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.events)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.events, '[]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.carousel)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.carousel, '[{}]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.collaborators)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.collaborators, '[]');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.footer_global)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.footer_global, '{"copyright":"","social":[],"producer":""}');
    }
    if (!localStorage.getItem(ADMIN_CONFIG.storageKeys.footer_cn)) {
        localStorage.setItem(ADMIN_CONFIG.storageKeys.footer_cn, '{"copyright":"","social":[],"producer":""}');
    }
};

// 全局初始化函数
function initDataLoader() {
    dataLoader.init();
}