/**
 * LiveGigs Asia 数据加载器
 */

class DataLoader {
    constructor(config) {
        this.config = config;
        this.cache = {};
    }

    // GitHub Raw URL
    getGitHubUrl(path) {
        const { owner, repo, branch } = this.config.github;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    }

    // 从 GitHub 获取
    async fetchFromGitHub(path) {
        const url = this.getGitHubUrl(path);
        const headers = {};
        const token = localStorage.getItem(this.config.storageKeys.githubToken);
        if (token) headers['Authorization'] = `token ${token}`;

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    // 本地存储操作
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) { return false; }
    }

    // 初始化默认数据
    initDefaults() {
        const keys = this.config.storageKeys;
        
        if (!this.get(keys.banners)) {
            this.set(keys.banners, [
                { title: "THE NONAME ANTI-MUSIC FESTIVAL", image: "./image/thenonameanti-.jpg", button_text: "View Details →", link: "./events.html", order: 1, active: true },
                { title: "PUNK HEART FESTIVAL", image: "./image/punkheartbanner.jpg", button_text: "Get Tickets →", link: "./events.html", order: 2, active: true }
            ]);
        }

        if (!this.get(keys.posters)) {
            this.set(keys.posters, {
                index: [
                    { title: "Event 1", image: "./image/1-b-2.jpg", link_text: "View Details →", link: "./events.html" },
                    { title: "Event 2", image: "./image/1-b-3.jpg", link_text: "View Details →", link: "./events.html" },
                    { title: "Event 3", image: "./image/livegigscn1.png", link_text: "View Details →", link: "./events.html" }
                ],
                cn: [
                    { title: "活动 1", image: "./image/cn-asiaad.jpg", link_text: "查看详情 →", link: "./events.html" },
                    { title: "活动 2", image: "./image/1-b-2.jpg", link_text: "查看详情 →", link: "./events.html" },
                    { title: "活动 3", image: "./image/1-b-3.jpg", link_text: "查看详情 →", link: "./events.html" }
                ],
                events: [
                    { title: "Past Gig 1", image: "./image/1-b-2.jpg", link_text: "View Details →", link: "./events.html" },
                    { title: "Past Gig 2", image: "./image/1-b-3.jpg", link_text: "View Details →", link: "./events.html" },
                    { title: "Past Gig 3", image: "./image/livegigscn1.png", link_text: "View Details →", link: "./events.html" }
                ]
            });
        }

        if (!this.get(keys.carousel)) {
            this.set(keys.carousel, [
                { title: "Carousel 1", image: "./image/carousel1.jpg", link_text: "View →", link: "./events.html" },
                { title: "Carousel 2", image: "./image/carousel2.jpg", link_text: "View →", link: "./events.html" }
            ]);
        }

        if (!this.get(keys.events)) this.set(keys.events, []);
        if (!this.get(keys.collaborators)) this.set(keys.collaborators, []);
        
        if (!this.get(keys.footerGlobal)) {
            this.set(keys.footerGlobal, {
                copyright: "© 2026 LIVEGIGS ASIA. ALL RIGHTS RESERVED.",
                social: [
                    { icon: "facebook", name: "Facebook", url: "https://facebook.com/livegigsasia" },
                    { icon: "instagram", name: "Instagram", url: "https://instagram.com/livegigsasia" },
                    { icon: "youtube", name: "YouTube", url: "https://youtube.com/livegigsasia" },
                    { icon: "x", name: "X", url: "https://x.com/livegigsasia" }
                ],
                producer: "./image/emanonent-logo.png"
            });
        }
        
        if (!this.get(keys.footerCN)) {
            this.set(keys.footerCN, {
                copyright: "© 2026 LIVEGIGS ASIA. 版权所有.",
                social: [
                    { icon: "weibo", name: "微博", url: "https://weibo.com/livegigsasia" },
                    { icon: "wechat", name: "微信", url: "#" },
                    { icon: "douyin", name: "抖音", url: "https://douyin.com/livegigsasia" },
                    { icon: "bilibili", name: "B站", url: "https://bilibili.com/livegigsasia" }
                ],
                producer: "./image/emanonent-logo.png"
            });
        }
    }

    // Banner
    getBanners() { return this.get(this.config.storageKeys.banners) || []; }
    saveBanners(data) { this.set(this.config.storageKeys.banners, data); }

    // Posters
    getPosters(page) {
        const all = this.get(this.config.storageKeys.posters) || {};
        return all[page] || [{}, {}, {}];
    }
    savePosters(page, data) {
        const all = this.get(this.config.storageKeys.posters) || {};
        all[page] = data;
        this.set(this.config.storageKeys.posters, all);
    }

    // Carousel (Events page)
    getCarousel() {
        return this.get(this.config.storageKeys.carousel) || [{ title: '', image: '', link_text: '', link: '' }];
    }
    saveCarousel(data) { this.set(this.config.storageKeys.carousel, data); }

    // Events
    getEvents() { return this.get(this.config.storageKeys.events) || []; }
    saveEvents(data) { this.set(this.config.storageKeys.events, data); }

    // Collaborators
    getCollaborators() { return this.get(this.config.storageKeys.collaborators) || []; }
    saveCollaborators(data) { this.set(this.config.storageKeys.collaborators, data); }

    // Footer
    getFooter(site) {
        const key = site === 'cn' ? this.config.storageKeys.footerCN : this.config.storageKeys.footerGlobal;
        return this.get(key) || {};
    }
    saveFooter(site, data) {
        const key = site === 'cn' ? this.config.storageKeys.footerCN : this.config.storageKeys.footerGlobal;
        this.set(key, data);
    }

    // 导出所有
    exportAll() {
        return {
            banners: this.getBanners(),
            posters: this.get(this.config.storageKeys.posters),
            carousel: this.getCarousel(),
            events: this.getEvents(),
            collaborators: this.getCollaborators(),
            footerGlobal: this.getFooter('global'),
            footerCN: this.getFooter('cn'),
            exportTime: new Date().toISOString()
        };
    }

    // 导入所有
    importAll(data) {
        if (data.banners) this.saveBanners(data.banners);
        if (data.posters) this.set(this.config.storageKeys.posters, data.posters);
        if (data.carousel) this.saveCarousel(data.carousel);
        if (data.events) this.saveEvents(data.events);
        if (data.collaborators) this.saveCollaborators(data.collaborators);
        if (data.footerGlobal) this.saveFooter('global', data.footerGlobal);
        if (data.footerCN) this.saveFooter('cn', data.footerCN);
    }

    // 重置
    resetAll() {
        Object.values(this.config.storageKeys).forEach(key => {
            if (!key.includes('session') && !key.includes('token') && !key.includes('Activity')) {
                localStorage.removeItem(key);
            }
        });
        this.initDefaults();
    }

    // GitHub 同步
    async syncFromGitHub() {
        try {
            // 同步各页面数据
            const pages = ['index', 'cn', 'events'];
            for (const page of pages) {
                try {
                    const data = await this.fetchFromGitHub(`content/${page}.json`);
                    if (data.banners) this.saveBanners(data.banners);
                    if (data.posters) {
                        const all = this.get(this.config.storageKeys.posters) || {};
                        all[page] = data.posters;
                        this.set(this.config.storageKeys.posters, all);
                    }
                    if (data.carousel) this.saveCarousel(data.carousel);
                    if (data.events) this.saveEvents(data.events);
                    if (data.footer) {
                        this.saveFooter(page === 'cn' ? 'cn' : 'global', data.footer);
                    }
                } catch (e) {
                    console.warn(`Sync ${page} failed:`, e);
                }
            }
            localStorage.setItem('lg_last_sync', new Date().toISOString());
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

// 添加 carousel 存储键
ADMIN_CONFIG.storageKeys.carousel = 'lg_carousel';

let dataLoader;
function initDataLoader() {
    dataLoader = new DataLoader(ADMIN_CONFIG);
    dataLoader.initDefaults();
}
