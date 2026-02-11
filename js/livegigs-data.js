// LiveGigs Asia 前端数据加载器 - 从GitHub获取数据
const LiveGigsData = {
    config: {
        owner: 'EmanonEnt',
        repo: 'asia',
        branch: 'main',
        contentPath: 'content',
        cacheTime: 60000 // 缓存1分钟
    },

    cache: {},
    lastFetch: {},

    // 获取JSON数据
    async fetchJSON(filename) {
        const url = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${this.config.contentPath}/${filename}.json`;

        try {
            const response = await fetch(url + '?t=' + Date.now()); // 防止缓存
            if (!response.ok) {
                console.warn(`Failed to load ${filename}:`, response.status);
                return null;
            }
            return await response.json();
        } catch (e) {
            console.warn(`Error loading ${filename}:`, e);
            return null;
        }
    },

    // 获取Banners
    async getBanners() {
        const data = await this.fetchJSON('banners');
        return data || [];
    },

    // 获取海报
    async getPosters(page) {
        const data = await this.fetchJSON(`posters_${page}`);
        return data || [{},{},{}];
    },

    // 获取轮播
    async getCarousel() {
        const data = await this.fetchJSON('carousel');
        return data || [{}];
    },

    // 获取活动
    async getEvents() {
        const data = await this.fetchJSON('events');
        return data || [];
    },

    // 获取合作伙伴
    async getCollaborators() {
        const data = await this.fetchJSON('collaborators');
        return data || [];
    },

    // 获取底部
    async getFooter(site) {
        const data = await this.fetchJSON(`footer_${site}`);
        return data || { copyright: '', social: [], producer: '' };
    }
};

// 导出供页面使用
window.LiveGigsData = LiveGigsData;
