// LiveGigs Asia 前端数据加载器 - 调试版本
const DataLoader = {
    config: {
        // 尝试多种方式获取数据
        urls: [
            // 方式1: 同域路径（如果content文件夹在网站根目录）
            window.location.origin + '/content/',
            // 方式2: GitHub Pages
            'https://emanonent.github.io/asia/content/',
            // 方式3: jsDelivr CDN
            'https://cdn.jsdelivr.net/gh/EmanonEnt/asia@main/content/',
            // 方式4: 相对路径
            './content/',
            '../content/'
        ]
    },

    pageType: 'index',
    currentUrlIndex: 0,

    init(pageType) {
        this.pageType = pageType || 'index';
        console.log('=== DataLoader 初始化 ===');
        console.log('页面类型:', this.pageType);
        console.log('当前域名:', window.location.origin);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllData());
        } else {
            this.loadAllData();
        }
    },

    // 尝试从多个URL获取数据
    async fetchJSON(filename) {
        console.log(`\n=== 获取 ${filename}.json ===`);

        for (let i = 0; i < this.config.urls.length; i++) {
            const baseUrl = this.config.urls[i];
            const url = baseUrl + filename + '.json?t=' + Date.now();

            console.log(`尝试 ${i + 1}/${this.config.urls.length}: ${url}`);

            try {
                const response = await fetch(url, { 
                    cache: 'no-cache',
                    headers: { 'Cache-Control': 'no-cache' }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✓ 成功获取:', filename);
                    console.log('数据内容:', JSON.stringify(data).substring(0, 200) + '...');
                    this.currentUrlIndex = i; // 记录成功的URL
                    return data;
                } else {
                    console.log('✗ 失败:', response.status, response.statusText);
                }
            } catch (e) {
                console.log('✗ 错误:', e.message);
            }
        }

        console.error(`✗ 所有URL都失败: ${filename}`);
        return null;
    },

    async loadAllData() {
        console.log('\n=== 开始加载数据 ===');

        try {
            let posterKey = this.pageType === 'other' ? 'index' : this.pageType;

            // 1. 加载Banners
            console.log('\n--- 加载 Banners ---');
            const banners = await this.fetchJSON('banners');
            if (banners) {
                console.log('Banners数量:', banners.length);
                this.renderBanners(banners);
            } else {
                console.error('✗ 无法加载Banners');
            }

            // 2. 加载海报
            console.log('\n--- 加载 Posters ---');
            const posters = await this.fetchJSON(`posters_${posterKey}`);
            if (posters) {
                console.log('Posters数量:', posters.length);
                this.renderPosters(posters);
            } else {
                console.error('✗ 无法加载Posters');
            }

            // 3. 加载底部
            console.log('\n--- 加载 Footer ---');
            const footer = await this.fetchJSON(`footer_${this.pageType === 'cn' ? 'cn' : 'global'}`);
            if (footer) {
                console.log('Footer:', footer);
                this.renderFooter(footer);
            } else {
                console.error('✗ 无法加载Footer');
            }

            // 4. events页面额外加载
            if (this.pageType === 'events') {
                console.log('\n--- 加载 Events 数据 ---');

                const carousel = await this.fetchJSON('carousel');
                if (carousel) {
                    console.log('Carousel数量:', carousel.length);
                    this.renderCarousel(carousel);
                }

                const events = await this.fetchJSON('events');
                if (events) {
                    console.log('Events数量:', events.length);
                    console.log('Events数据:', events);
                    this.renderEvents(events);
                } else {
                    console.error('✗ 无法加载Events');
                }
            }

            // 5. partners页面额外加载
            if (this.pageType === 'partners') {
                console.log('\n--- 加载 Partners 数据 ---');
                const collaborators = await this.fetchJSON('collaborators');
                if (collaborators) {
                    console.log('Collaborators数量:', collaborators.length);
                    this.renderCollaborators(collaborators);
                }
            }

            console.log('\n=== 数据加载完成 ===');

        } catch (error) {
            console.error('✗ 加载数据时出错:', error);
        }
    },

    // 渲染函数 - 添加调试信息
    renderBanners(banners) {
        console.log('触发 bannersLoaded 事件');
        window.dispatchEvent(new CustomEvent('bannersLoaded', { detail: banners }));
    },

    renderPosters(posters) {
        console.log('触发 postersLoaded 事件');
        window.dispatchEvent(new CustomEvent('postersLoaded', { detail: posters }));
    },

    renderCarousel(carousel) {
        console.log('触发 carouselLoaded 事件');
        window.dispatchEvent(new CustomEvent('carouselLoaded', { detail: carousel }));
    },

    renderEvents(events) {
        console.log('触发 eventsLoaded 事件');
        window.dispatchEvent(new CustomEvent('eventsLoaded', { detail: events }));
    },

    renderCollaborators(collaborators) {
        console.log('触发 collaboratorsLoaded 事件');
        window.dispatchEvent(new CustomEvent('collaboratorsLoaded', { detail: collaborators }));
    },

    renderFooter(footer) {
        console.log('触发 footerLoaded 事件');
        if (footer.copyright) {
            const el = document.querySelector('.footer-copyright, .copyright, [data-editable="copyright"]');
            if (el) {
                console.log('更新版权文字:', footer.copyright);
                el.textContent = footer.copyright;
            } else {
                console.warn('未找到版权元素');
            }
        }
        if (footer.producer) {
            const el = document.querySelector('.producer-logo, [data-editable="producer"]');
            if (el) {
                console.log('更新制作单位Logo:', footer.producer);
                el.src = footer.producer;
            }
        }
        window.dispatchEvent(new CustomEvent('footerLoaded', { detail: footer }));
    },

    async refresh() {
        console.log('\n=== 手动刷新数据 ===');
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

// 页面加载完成后显示调试信息
window.addEventListener('load', () => {
    console.log('\n=== DataLoader 调试信息 ===');
    console.log('当前URL:', window.location.href);
    console.log('DataLoader 可用:', typeof DataLoader !== 'undefined');
    console.log('要查看数据加载情况，请打开Console面板');
});
