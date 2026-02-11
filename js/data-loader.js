/**
 * LiveGigs Data Loader - Fixed Version
 * 功能：
 * 1. 从GitHub自动加载JSON数据
 * 2. 会话管理（30分钟或关闭浏览器失效）
 * 3. 空字段自动隐藏
 * 4. 动态内容渲染
 * 5. 错误回退：JSON不存在时保留原有内容
 */

const DataLoader = (function() {
    'use strict';

    // 配置
    const CONFIG = {
        sessionTimeout: 30 * 60 * 1000, // 30分钟
        contentPath: './content/',
        cacheBuster: true,
        debug: true // 开启调试日志
    };

    // 调试日志
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[DataLoader]', ...args);
        }
    }

    function warn(...args) {
        console.warn('[DataLoader]', ...args);
    }

    function error(...args) {
        console.error('[DataLoader]', ...args);
    }

    // 会话管理
    const SessionManager = {
        startTime: null,

        init() {
            const session = this.getSession();
            if (session && this.isValid(session)) {
                this.startTime = session.startTime;
                log('Session restored, expires in:', Math.floor(this.getRemainingTime()/1000), 's');
            } else {
                this.createNewSession();
            }
        },

        createNewSession() {
            this.startTime = Date.now();
            const session = {
                startTime: this.startTime,
                expiresAt: this.startTime + CONFIG.sessionTimeout
            };
            sessionStorage.setItem('lg_session', JSON.stringify(session));
            log('New session created');
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
            log('Session cleared');
        },

        checkSession() {
            const session = this.getSession();
            if (!session || !this.isValid(session)) {
                log('Session expired');
                this.clearSession();
                return false;
            }
            return true;
        }
    };

    // 数据加载器 - 带错误回退
    const DataFetcher = {
        cache: {},

        async loadJSON(filename) {
            try {
                const cacheBuster = CONFIG.cacheBuster ? `?t=${Date.now()}` : '';
                const url = `${CONFIG.contentPath}${filename}.json${cacheBuster}`;

                log('Loading:', url);

                const response = await fetch(url);

                // 如果文件不存在(404)，返回null而不是抛出错误
                if (response.status === 404) {
                    warn(`JSON file not found: ${filename}.json - Using default content`);
                    return null;
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.cache[filename] = data;
                log(`Loaded ${filename}.json successfully`);
                return data;

            } catch (err) {
                warn(`Failed to load ${filename}:`, err.message);
                return null;
            }
        },

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

    // 内容渲染器
    const ContentRenderer = {
        isEmpty(value) {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string' && value.trim() === '') return true;
            if (Array.isArray(value) && value.length === 0) return true;
            if (typeof value === 'object' && Object.keys(value).length === 0) return true;
            return false;
        },

        // 安全更新元素 - 如果数据为空则保留原有内容
        safeUpdate(selector, value, type = 'text') {
            const elements = document.querySelectorAll(selector);

            elements.forEach(el => {
                // 如果值为空，保留原有内容，不做任何修改
                if (this.isEmpty(value)) {
                    log(`Skipping empty value for ${selector}, keeping existing content`);
                    return;
                }

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
                            warn(`Image failed to load: ${value}`);
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

        // 渲染活动卡片 - 只有当数据存在时才渲染
        renderEvents(events, containerSelector = '#eventsGrid') {
            const container = document.querySelector(containerSelector);
            if (!container) {
                warn('Events container not found');
                return;
            }

            // 如果没有数据或数据为空，保留原有HTML内容
            if (!events || !Array.isArray(events) || events.length === 0) {
                log('No events data, keeping existing HTML content');
                return;
            }

            log('Rendering', events.length, 'events');

            // 清空现有内容
            container.innerHTML = '';

            events.forEach((event, index) => {
                // 跳过完全为空的活动
                if (this.isEmpty(event.name) && this.isEmpty(event.image)) {
                    log(`Skipping empty event at index ${index}`);
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

            // 更新Load More按钮
            this.updateLoadMoreButton(events.length);

            // 重新初始化倒计时
            if (typeof initCountdowns === 'function') {
                initCountdowns();
            }
        },

        updateLoadMoreButton(totalEvents) {
            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (!loadMoreContainer) return;

            if (totalEvents <= 3) {
                loadMoreContainer.style.display = 'none';
                loadMoreContainer.classList.remove('visible');
            } else {
                loadMoreContainer.style.display = 'block';
                loadMoreContainer.classList.add('visible');
            }
        },

        // 渲染海报 - 安全更新
        renderPosters(posters) {
            if (!posters || !Array.isArray(posters)) {
                log('No posters data, keeping existing content');
                return;
            }

            posters.forEach((poster, index) => {
                const id = index + 1;

                if (!this.isEmpty(poster.image)) {
                    this.safeUpdate(`[data-poster-id="${id}"] img`, poster.image, 'src');
                }
                if (!this.isEmpty(poster.title)) {
                    this.safeUpdate(`[data-poster-id="${id}"] .poster-title`, poster.title, 'text');
                }
                if (!this.isEmpty(poster.linkText)) {
                    this.safeUpdate(`[data-poster-id="${id}"] .poster-link`, poster.linkText, 'text');
                }

                const posterEl = document.querySelector(`[data-poster-id="${id}"]`);
                if (posterEl && !this.isEmpty(poster.link)) {
                    posterEl.setAttribute('data-link', poster.link);
                    const linkEl = posterEl.querySelector('.poster-link');
                    if (linkEl) linkEl.href = poster.link;
                }
            });
        },

        // 渲染底部 - 安全更新
        renderFooter(footerData) {
            if (!footerData) {
                log('No footer data, keeping existing content');
                return;
            }

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

    // 页面加载器 - 带错误处理
    const PageLoaders = {
        async events() {
            log('Loading events page data...');

            // 加载活动数据
            const eventsData = await DataFetcher.loadJSON('events-managed');
            if (eventsData && eventsData.events && eventsData.events.length > 0) {
                ContentRenderer.renderEvents(eventsData.events);
            } else {
                log('No events data loaded, using default HTML content');
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
            log('Loading index page data...');

            const bannerData = await DataFetcher.loadJSON('banners');
            if (bannerData && bannerData.banners) {
                this.renderBanners(bannerData.banners);
            }

            const postersData = await DataFetcher.loadJSON('index-posters');
            if (postersData && postersData.posters) {
                ContentRenderer.renderPosters(postersData.posters);
            }

            const footerData = await DataFetcher.loadJSON('footer-global');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        async cn() {
            log('Loading CN page data...');

            const bannerData = await DataFetcher.loadJSON('banners');
            if (bannerData && bannerData.banners) {
                this.renderBanners(bannerData.banners);
            }

            const postersData = await DataFetcher.loadJSON('cn-posters');
            if (postersData && postersData.posters) {
                ContentRenderer.renderPosters(postersData.posters);
            }

            const footerData = await DataFetcher.loadJSON('footer-cn');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        async partners() {
            log('Loading partners page data...');

            const bannerData = await DataFetcher.loadJSON('partners-banners');
            if (bannerData && bannerData.banners) {
                this.renderPartnerBanners(bannerData.banners);
            }

            const collaboratorsData = await DataFetcher.loadJSON('collaborators');
            if (collaboratorsData && collaboratorsData.logos) {
                this.renderCollaborators(collaboratorsData.logos);
            }

            const footerData = await DataFetcher.loadJSON('footer-global');
            if (footerData) {
                ContentRenderer.renderFooter(footerData);
            }
        },

        // 渲染方法占位
        renderBanners(banners) {
            log('Rendering banners:', banners.length);
        },

        renderAutoScroll(items) {
            log('Rendering auto scroll items:', items.length);
        },

        renderPartnerBanners(banners) {
            log('Rendering partner banners:', banners.length);
        },

        renderCollaborators(logos) {
            log('Rendering collaborators:', logos.length);
        }
    };

    // 公共API
    return {
        init(pageType) {
            log(`Initializing for page: ${pageType}`);

            SessionManager.init();
            SessionManager.checkSession();

            // 延迟加载数据，确保页面先渲染完成
            setTimeout(() => {
                if (PageLoaders[pageType]) {
                    PageLoaders[pageType]().catch(err => {
                        error('Error loading page data:', err);
                    });
                } else {
                    warn(`No loader found for page type: ${pageType}`);
                }
            }, 100);

            // 定期检查会话
            setInterval(() => {
                SessionManager.checkSession();
            }, 60000);
        },

        async reload(pageType) {
            DataFetcher.cache = {};
            if (PageLoaders[pageType]) {
                await PageLoaders[pageType]();
            }
        },

        getSessionInfo() {
            return {
                isValid: SessionManager.checkSession(),
                remainingTime: SessionManager.getRemainingTime(),
                startTime: SessionManager.startTime
            };
        },

        logout() {
            SessionManager.clearSession();
        },

        isEmpty: ContentRenderer.isEmpty.bind(ContentRenderer)
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    const pageType = document.body.getAttribute('data-page') || 
                     document.documentElement.getAttribute('data-page');

    if (pageType && typeof DataLoader !== 'undefined') {
        DataLoader.init(pageType);
    }
});

window.DataLoader = DataLoader;
