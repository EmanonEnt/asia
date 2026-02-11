/**
 * LiveGigs Asia 数据加载器
 * 支持从 GitHub 自动加载数据，本地缓存，以及数据同步
 */

class DataLoader {
    constructor(config) {
        this.config = config;
        this.cache = {};
        this.lastFetch = {};
        this.isLoading = false;
    }

    /**
     * 获取 GitHub Raw 内容 URL
     */
    getGitHubRawUrl(path) {
        const { owner, repo, branch } = this.config.github;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    }

    /**
     * 获取 GitHub API URL
     */
    getGitHubApiUrl(path) {
        const { owner, repo } = this.config.github;
        return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    }

    /**
     * 从 GitHub 获取文件内容
     */
    async fetchFromGitHub(path) {
        const url = this.getGitHubRawUrl(path);
        const headers = {};
        
        const token = localStorage.getItem(this.config.storageKeys.githubToken);
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${path}:`, error);
            throw error;
        }
    }

    /**
     * 从本地存储加载数据
     */
    loadFromLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Failed to load ${key} from local:`, error);
            return null;
        }
    }

    /**
     * 保存数据到本地存储
     */
    saveToLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Failed to save ${key} to local:`, error);
            return false;
        }
    }

    /**
     * 初始化默认数据
     */
    initDefaultData() {
        const { storageKeys, defaults } = this.config;
        
        // Banner
        if (!localStorage.getItem(storageKeys.banners)) {
            this.saveToLocal(storageKeys.banners, defaults.banners);
        }
        
        // Posters
        if (!localStorage.getItem(storageKeys.posters)) {
            this.saveToLocal(storageKeys.posters, defaults.posters);
        }
        
        // Events
        if (!localStorage.getItem(storageKeys.events)) {
            this.saveToLocal(storageKeys.events, defaults.events);
        }
        
        // Collaborators
        if (!localStorage.getItem(storageKeys.collaborators)) {
            this.saveToLocal(storageKeys.collaborators, defaults.collaborators);
        }
        
        // Footer Global
        if (!localStorage.getItem(storageKeys.footerGlobal)) {
            this.saveToLocal(storageKeys.footerGlobal, defaults.footerGlobal);
        }
        
        // Footer CN
        if (!localStorage.getItem(storageKeys.footerCN)) {
            this.saveToLocal(storageKeys.footerCN, defaults.footerCN);
        }
    }

    /**
     * 从 GitHub 加载所有数据
     */
    async loadAllFromGitHub() {
        if (this.isLoading) return;
        this.isLoading = true;

        const { storageKeys, pages, github } = this.config;
        const results = { success: [], failed: [] };

        try {
            // 加载各页面数据
            for (const [pageKey, pageConfig] of Object.entries(pages)) {
                try {
                    const filePath = `${github.contentPath}/${pageConfig.file}`;
                    const data = await this.fetchFromGitHub(filePath);
                    
                    // 根据页面类型保存到相应的存储键
                    if (data.banners) {
                        this.saveToLocal(storageKeys.banners, data.banners);
                    }
                    if (data.posters) {
                        const posters = this.loadFromLocal(storageKeys.posters) || {};
                        posters[pageKey] = data.posters;
                        this.saveToLocal(storageKeys.posters, posters);
                    }
                    if (data.events) {
                        this.saveToLocal(storageKeys.events, data.events);
                    }
                    if (data.collaborators) {
                        this.saveToLocal(storageKeys.collaborators, data.collaborators);
                    }
                    if (data.footer) {
                        const isCN = pageKey === 'cn';
                        this.saveToLocal(
                            isCN ? storageKeys.footerCN : storageKeys.footerGlobal,
                            data.footer
                        );
                    }
                    
                    results.success.push(pageKey);
                } catch (error) {
                    console.warn(`Failed to load ${pageKey}:`, error);
                    results.failed.push({ page: pageKey, error: error.message });
                }
            }

            // 记录最后更新时间
            localStorage.setItem('lg_last_sync', new Date().toISOString());
            
        } catch (error) {
            console.error('Failed to load data from GitHub:', error);
        } finally {
            this.isLoading = false;
        }

        return results;
    }

    /**
     * 获取 Banner 数据
     */
    getBanners() {
        return this.loadFromLocal(this.config.storageKeys.banners) || [];
    }

    /**
     * 保存 Banner 数据
     */
    saveBanners(banners) {
        return this.saveToLocal(this.config.storageKeys.banners, banners);
    }

    /**
     * 获取海报数据
     */
    getPosters(page = 'index') {
        const allPosters = this.loadFromLocal(this.config.storageKeys.posters) || {};
        return allPosters[page] || [];
    }

    /**
     * 保存海报数据
     */
    savePosters(page, posters) {
        const allPosters = this.loadFromLocal(this.config.storageKeys.posters) || {};
        allPosters[page] = posters;
        return this.saveToLocal(this.config.storageKeys.posters, allPosters);
    }

    /**
     * 获取活动数据
     */
    getEvents() {
        return this.loadFromLocal(this.config.storageKeys.events) || [];
    }

    /**
     * 保存活动数据
     */
    saveEvents(events) {
        return this.saveToLocal(this.config.storageKeys.events, events);
    }

    /**
     * 获取合作伙伴数据
     */
    getCollaborators() {
        return this.loadFromLocal(this.config.storageKeys.collaborators) || [];
    }

    /**
     * 保存合作伙伴数据
     */
    saveCollaborators(collaborators) {
        return this.saveToLocal(this.config.storageKeys.collaborators, collaborators);
    }

    /**
     * 获取底部数据
     */
    getFooter(site = 'global') {
        const key = site === 'cn' ? 
            this.config.storageKeys.footerCN : 
            this.config.storageKeys.footerGlobal;
        return this.loadFromLocal(key) || {};
    }

    /**
     * 保存底部数据
     */
    saveFooter(site, footer) {
        const key = site === 'cn' ? 
            this.config.storageKeys.footerCN : 
            this.config.storageKeys.footerGlobal;
        return this.saveToLocal(key, footer);
    }

    /**
     * 导出所有数据
     */
    exportAll() {
        const { storageKeys } = this.config;
        return {
            banners: this.getBanners(),
            posters: this.loadFromLocal(storageKeys.posters) || {},
            events: this.getEvents(),
            collaborators: this.getCollaborators(),
            footerGlobal: this.getFooter('global'),
            footerCN: this.getFooter('cn'),
            exportTime: new Date().toISOString(),
            version: this.config.version
        };
    }

    /**
     * 导入所有数据
     */
    importAll(data) {
        try {
            if (data.banners) this.saveBanners(data.banners);
            if (data.posters) this.saveToLocal(this.config.storageKeys.posters, data.posters);
            if (data.events) this.saveEvents(data.events);
            if (data.collaborators) this.saveCollaborators(data.collaborators);
            if (data.footerGlobal) this.saveFooter('global', data.footerGlobal);
            if (data.footerCN) this.saveFooter('cn', data.footerCN);
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    /**
     * 重置所有数据
     */
    resetAll() {
        const { storageKeys } = this.config;
        Object.values(storageKeys).forEach(key => {
            if (!key.includes('session') && !key.includes('token') && !key.includes('Activity')) {
                localStorage.removeItem(key);
            }
        });
        this.initDefaultData();
        return true;
    }

    /**
     * 获取统计数据
     */
    getStats() {
        return {
            banners: this.getBanners().length,
            events: this.getEvents().length,
            collaborators: this.getCollaborators().length,
            lastSync: localStorage.getItem('lg_last_sync') || '从未同步'
        };
    }

    /**
     * 检查是否需要显示 Load More 按钮
     * 大于等于 minEventsForLoadMore 个活动时显示
     */
    shouldShowLoadMore() {
        const eventCount = this.getEvents().length;
        return eventCount >= this.config.events.minEventsForLoadMore;
    }

    /**
     * 验证图片地址
     */
    validateImageUrl(url) {
        if (!url) return false;
        
        const { externalProtocols, formats } = this.config.images;
        
        // 检查是否是外部链接
        const isExternal = externalProtocols.some(protocol => 
            url.toLowerCase().startsWith(protocol)
        );
        
        if (isExternal) {
            return true;
        }
        
        // 检查本地图片格式
        const ext = url.split('.').pop().toLowerCase();
        return formats.includes(ext);
    }

    /**
     * 验证链接地址
     */
    validateLinkUrl(url) {
        if (!url) return false; // 空链接返回false，表示不能点击
        
        const { externalProtocols } = this.config.images;
        
        // 检查是否是外部链接
        const isExternal = externalProtocols.some(protocol => 
            url.toLowerCase().startsWith(protocol)
        );
        
        if (isExternal) {
            return true;
        }
        
        // 检查是否是本地页面链接
        return url.startsWith('./') || url.startsWith('/') || url.startsWith('#');
    }

    /**
     * 检查链接是否可点击
     */
    isLinkClickable(url) {
        return this.validateLinkUrl(url);
    }

    /**
     * 格式化链接用于显示
     */
    formatLink(url) {
        if (!url) return '';
        return url;
    }
}

// 创建全局实例
let dataLoader;

function initDataLoader() {
    if (typeof ADMIN_CONFIG !== 'undefined') {
        dataLoader = new DataLoader(ADMIN_CONFIG);
        dataLoader.initDefaultData();
        return dataLoader;
    }
    console.error('ADMIN_CONFIG not found');
    return null;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initDataLoader();
});
