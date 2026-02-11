/**
 * LiveGigs Data Loader
 * 功能：
 * 1. 从GitHub自动加载JSON数据
 * 2. 会话管理（30分钟或关闭浏览器失效）
 * 3. 空字段自动隐藏
 * 4. 动态内容渲染
 */

const DataLoader = (function() {
    'use strict';

    // 配置
    const CONFIG = {
        sessionTimeout: 30 * 60 * 1000, // 30分钟
        contentPath: './content/',
        cacheBuster: true
    };

    // 会话管理
    const SessionManager = {
        startTime: null,

        init() {
            // 检查是否有现有会话
            const session = this.getSession();
            if (session && this.isValid(session)) {
                this.startTime = session.startTime;
                console.log('[DataLoader] Session restored, expires in:', this.getRemainingTime());
            } else {
                this.createNewSession();
            }

            // 监听页面关闭
            window.addEventListener('beforeunload', () => {
                // 可选：关闭浏览器时清除会话
                // this.clearSession();
            });
        },

        createNewSession() {
            this.startTime = Date.now();
            const session = {
                startTime: this.startTime,
                expiresAt: this.startTime + CONFIG.sessionTimeout
            };
            sessionStorage.setItem('lg_session', JSON.stringify(session));
            console.log('[DataLoader] New session created');
        },

        getSession() {
            try {
                return JSON.parse(sessionStorage.getItem('lg_session'));
            } catch(e) {
                return null;
            }
        },

        isValid(session) {
            if (!session || !session.expiresAt) return false;
            return Date.now() < session.expiresAt;
        },

        getRemainingTime() {
            const session = this.getSession();
            if (!session) return 0;
            return Math.max(0, session.expiresAt - Date.now());
        },

        clearSession() {
            sessionStorage.removeItem('lg_session');
            console.log('[DataLoader] Session cleared');
        },

        // 检查是否需要重新登录
        checkSession() {
            const session = this.getSession();
            if (!session || !this.isValid(session)) {
                console.log('[DataLoader] Session expired, clearing...');
                this.clearSession();
                return false;
            }
            return true;
        }
    };

    // 数据加载器
    const DataFetcher = {
        cache: {},

        async loadJSON(filename) {
            try {
                const cacheBuster = CONFIG.cacheBuster ? `?t=${Date.now()}` : '';
                const url = `${CONFIG.contentPath}${filename}.json${cacheBuster}`;

                console.log(`[DataLoader] Loading: ${url}`);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.cache[filename] = data;
                return data;

            } catch (error) {
                console.warn(`[DataLoader] Failed to load ${filename}:`, error);
                return null;
            }
        },

        // 批量加载
        async loadMultiple(filenames) {
            const results = {};
            await Promise.all(
                filenames.map(async (name) => {
                    results[name] = await this.loadJSON(name);
                })
            );
            return results;
        }
    };

    // 内容渲染器 - 带空字段检查
    const ContentRenderer = {
        // 安全获取嵌套属性
        getValue(obj, path, defaultValue = '') {
            const keys = path.split('.');
            let value = obj;
            for (const key of keys) {
                if (value == null || typeof value !== 'object') {
                    return defaultValue;
                }
                value = value[key];
            }
            return value !== undefined && value !== null ? value : defaultValue;
        },

        // 检查值是否为空
        isEmpty(value) {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string' && value.trim() === '') return true;
            if (Array.isArray(value) && value.length === 0) return true;
            if (typeof value === 'object' && Object.keys(value).length === 0) return true;
            return false;
        },

        // 更新元素内容，如果为空则隐藏
        updateElement(selector, value, type = 'text') {
            const elements = document.querySelectorAll(selector);

            elements.forEach(el => {
                // 如果值为空，隐藏元素
                if (this.isEmpty(value)) {
                    el.style.display = 'none';
                    console.log(`[DataLoader] Hidden empty element: ${selector}`);
                    return;
                }

                // 否则显示并更新内容
                el.style.display = '';

                switch(type) {
                    case 'text':
                        el.textContent = value;
                        break;
                    case 'html':
                        el.innerHTML = value;
                        break;
                    case 'src':
                        el.src = value;
                        el.onerror = function() {
                            console.warn(`[DataLoader] Image failed to load: ${value}`);
                            this.style.display = 'none';
                        };
                        break;
                    case 'href':
                        el.href = value;
                        break;
                    case 'background':
                        el.style.backgroundImage = `url(${value})`;
                        break;
                }

                // 更新data属性
                if (el.hasAttribute(`data-${type}`)) {
                    el.setAttribute(`data-${type}`, value);
                }
            });
        },

        // 渲染活动卡片
        renderEvents(events, containerSelector = '#eventsGrid') {
            const container = document.querySelector(containerSelector);
            if (!container || !events || !Array.isArray(events)) {
                console.warn('[DataLoader] Cannot render events: container or data missing');
                return;
            }

            // 清空现有内容
            container.innerHTML = '';

            events.forEach((event, index) => {
                // 跳过完全为空的活动
                if (this.isEmpty(event.name) && this.isEmpty(event.image)) {
                    console.log(`[DataLoader] Skipping empty event at index ${index}`);
                    return;
                }

                const eventId = index + 1;
                const isHidden = index >= 3 ? 'hidden' : '';

                const cardHTML = `
                    <div class="event-card ${isHidden}" data-event-id="${eventId}" data-editable="event-${eventId}">
                        <img src="${event.image || 'https://via.placeholder.com/400x600/8b0000/000?text=Event'}" 
                             alt="${event.name || 'Event'}" 
                             class="event-poster" 
                             data-editable="event-${eventId}-image" 
                             data-src="${event.image || ''}">
                        ${event.status ? `
                        <div class="event-status ${event.statusType || 'countdown'}" 
                             data-editable="event-${eventId}-status" 
                             data-status-type="${event.statusType || 'countdown'}" 
                             data-text="${event.status}"
                             ${event.countdownDate ? `data-countdown-date="${event.countdownDate}"` : ''}>
                            ${event.status}
                        </div>
                        ` : ''}
                        <div class="event-content">
                            ${event.name ? `<h3 class="event-name" data-editable="event-${eventId}-name" data-text="${event.name}">${event.name}</h3>` : ''}
                            ${event.details ? `<div class="event-details" data-editable="event-${eventId}-details" data-text="${event.details}">${event.details}</div>` : ''}
                            ${event.venue ? `<div class="event-venue" data-editable="event-${eventId}-venue" data-text="${event.venue}">${event.venue}</div>` : ''}
                            ${event.btnText && event.btnLink ? `
                            <a href="${event.btnLink}" class="event-btn" target="_blank" 
                               data-editable="event-${eventId}-btn" 
                               data-text="${event.btnText}" 
                               data-href="${event.btnLink}">${event.btnText}</a>
                            ` : ''}
                        </div>
                    </div>
                `;

                container.insertAdjacentHTML('beforeend', cardHTML);
            });

            // 更新Load More按钮显示
            this.updateLoadMoreButton(events.length);

            // 重新初始化倒计时
            if (typeof initCountdowns === 'function') {
                initCountdowns();
            }
        },

        // 更新Load More按钮
        updateLoadMoreButton(totalEvents) {
            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (!loadMoreContainer) return;

            // 如果活动数量<=3，隐藏Load More按钮
            if (totalEvents <= 3) {
                loadMoreContainer.style.display = 'none';
                loadMoreContainer.classList.remove('visible');
                console.log('[DataLoader] Load More button hidden (<=3 events)');
            } else {
                loadMoreContainer.style.display = 'block';
                loadMoreContainer.classList.add('visible');
            }
        },

        // 渲染海报
        renderPosters(posters) {
            if (!posters || !Array.isArray(posters)) return;

            posters.forEach((poster, index) => {
                const id = index + 1;

                // 海报图片
                if (!this.isEmpty(poster.image)) {
                    this.updateElement(`[data-poster-id="${id}"] img`, poster.image, 'src');
                }

                // 海报标题
                if (!this.isEmpty(poster.title)) {
                    this.updateElement(`[data-poster-id="${id}"] .poster-title`, poster.title, 'text');
                }

                // 海报链接
                const posterEl = document.querySelector(`[data-poster-id="${id}"]`);
                if (posterEl && !this.isEmpty(poster.link)) {
                    posterEl.setAttribute('data-link', poster.link);
                    const linkEl = posterEl.querySelector('.poster-link');
                    if (linkEl) {
                        linkEl.href = poster.link;
                    }
                }

                // 链接文字
                if (!this.isEmpty(poster.linkText)) {
                    this.updateElement(`[data-poster-id="${id}"] .poster-link`, poster.linkText, 'text');
                }
            });
        },

        // 渲染底部
        renderFooter(footerData) {
            if (!footerData) return;

            // 邮箱
            if (!this.isEmpty(footerData.email)) {
                const emailEl = document.querySelector('a[href^="mailto"]');
                if (emailEl) {
                    emailEl.href = `mailto:${footerData.email}`;
                    emailEl.textContent = footerData.email;
                }
            }

            // 电话
            if (!this.isEmpty(footerData.phone)) {
                const phoneEl = document.querySelector('a[href^="tel"]');
                if (phoneEl) {
                    phoneEl.href = `tel:${footerData.phone}`;
                    phoneEl.textContent = footerData.phone;
                }
            }

            // 地址
            if (!this.isEmpty(footerData.address)) {
                const addressEl = document.querySelector('.footer-contact-right .contact-item');
                if (addressEl) {
                    addressEl.innerHTML = footerData.address.replace(/\n/g, '<br>');
                }
            }

            // 社交链接
            if (footerData.social && Array.isArray(footerData.social)) {
                footerData.social.forEach(social => {
                    if (!this.isEmpty(social.platform) && !this.isEmpty(social.url)) {
                        const icon = document.querySelector(`[data-platform="${social.platform}"]`);
                        if (icon) {
                            icon.href = social.url;
                            icon.setAttribute('data-href', social.url);
                        }
                    }
                });
            }
        }
    };

    // 页面特定加载器
    const PageLoaders = {
        async events() {
            console.log('[DataLoader] Loading events page data...');

            // 加载活动数据
            const eventsData = await DataFetcher.loadJSON('events-managed');
            if (eventsData && eventsData.events) {
                ContentRenderer.renderEvents(eventsData.events);
            }

            // 加载海报数据
            const postersData = await DataFetcher.loadJSON('events-posters');
            if (postersData && postersData.posters) {
                ContentRenderer.renderPosters(postersData.posters);
            }

            // 加载滚播数据
            const scrollData = await DataFetcher.loadJSON('events-carousel');
            if (scrollData && scrollData.items) {
                this.renderAutoScroll(scrollData.items);
            }

            // 加载底部数据
            const footerData = await DataFetcher.loadJSON('footer-global');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        async index() {
            console.log('[DataLoader] Loading index page data...');

            // 加载Banner数据
            const bannerData = await DataFetcher.loadJSON('banners');
            if (bannerData && bannerData.banners) {
                this.renderBanners(bannerData.banners);
            }

            // 加载海报数据
            const postersData = await DataFetcher.loadJSON('index-posters');
            if (postersData && postersData.posters) {
                ContentRenderer.renderPosters(postersData.posters);
            }

            // 加载底部数据
            const footerData = await DataFetcher.loadJSON('footer-global');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        async cn() {
            console.log('[DataLoader] Loading CN page data...');

            // 加载Banner数据（与index同步）
            const bannerData = await DataFetcher.loadJSON('banners');
            if (bannerData && bannerData.banners) {
                this.renderBanners(bannerData.banners);
            }

            // 加载海报数据
            const postersData = await DataFetcher.loadJSON('cn-posters');
            if (postersData && postersData.posters) {
                ContentRenderer.renderPosters(postersData.posters);
            }

            // 加载底部数据（单独）
            const footerData = await DataFetcher.loadJSON('footer-cn');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        async partners() {
            console.log('[DataLoader] Loading partners page data...');

            // 加载Banner数据
            const bannerData = await DataFetcher.loadJSON('partners-banners');
            if (bannerData && bannerData.banners) {
                this.renderPartnerBanners(bannerData.banners);
            }

            // 加载合作伙伴Logo
            const collaboratorsData = await DataFetcher.loadJSON('collaborators');
            if (collaboratorsData && collaboratorsData.logos) {
                this.renderCollaborators(collaboratorsData.logos);
            }

            // 加载底部数据
            const footerData = await DataFetcher.loadJSON('footer-global');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        // 渲染方法...
        renderBanners(banners) {
            // 实现Banner渲染
            console.log('[DataLoader] Rendering banners:', banners.length);
        },

        renderAutoScroll(items) {
            // 实现滚播渲染
            console.log('[DataLoader] Rendering auto scroll items:', items.length);
        },

        renderPartnerBanners(banners) {
            console.log('[DataLoader] Rendering partner banners:', banners.length);
        },

        renderCollaborators(logos) {
            console.log('[DataLoader] Rendering collaborators:', logos.length);
        }
    };

    // 公共API
    return {
        // 初始化
        init(pageType) {
            console.log(`[DataLoader] Initializing for page: ${pageType}`);

            // 初始化会话管理
            SessionManager.init();

            // 检查会话有效性
            if (!SessionManager.checkSession()) {
                console.log('[DataLoader] Session invalid, data will still load but admin features may be limited');
            }

            // 加载页面数据
            if (PageLoaders[pageType]) {
                PageLoaders[pageType]().catch(err => {
                    console.error('[DataLoader] Error loading page data:', err);
                });
            } else {
                console.warn(`[DataLoader] No loader found for page type: ${pageType}`);
            }

            // 设置定期检查会话
            setInterval(() => {
                if (!SessionManager.checkSession()) {
                    console.log('[DataLoader] Session expired during use');
                }
            }, 60000); // 每分钟检查一次
        },

        // 手动重新加载数据
        async reload(pageType) {
            DataFetcher.cache = {}; // 清除缓存
            if (PageLoaders[pageType]) {
                await PageLoaders[pageType]();
            }
        },

        // 获取会话信息
        getSessionInfo() {
            return {
                isValid: SessionManager.checkSession(),
                remainingTime: SessionManager.getRemainingTime(),
                startTime: SessionManager.startTime
            };
        },

        // 登出（清除会话）
        logout() {
            SessionManager.clearSession();
        },

        // 检查元素是否为空（供外部使用）
        isEmpty: ContentRenderer.isEmpty.bind(ContentRenderer),

        // 安全获取值
        getValue: ContentRenderer.getValue.bind(ContentRenderer)
    };
})();

// 自动初始化（如果页面有data-page属性）
document.addEventListener('DOMContentLoaded', function() {
    const pageType = document.body.getAttribute('data-page') || 
                     document.documentElement.getAttribute('data-page');

    if (pageType && typeof DataLoader !== 'undefined') {
        DataLoader.init(pageType);
    }
});

// 全局暴露
window.DataLoader = DataLoader;
