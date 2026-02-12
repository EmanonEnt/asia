/**
 * LiveGigs Asia - Data Loader
 * 自动从 GitHub Pages 加载 JSON 数据并渲染到页面
 * 修复：使用同域名避免CORS，支持Events页面完整功能
 */

const LiveGigsData = {
    // 使用 GitHub Pages 同域名，避免 CORS 问题
    baseUrl: 'https://emanonent.github.io/asia/content',

    // 缓存控制 - 添加时间戳防止缓存
    getUrl: function(filename) {
        const timestamp = new Date().getTime();
        return `${this.baseUrl}/${filename}?t=${timestamp}`;
    },

    // 加载 JSON 数据
    load: async function(filename) {
        try {
            const url = this.getUrl(filename);
            console.log('[LiveGigs] Loading:', url);

            const response = await fetch(url, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                console.warn('[LiveGigs] File not found:', filename);
                return null;
            }

            const data = await response.json();
            console.log('[LiveGigs] Loaded:', filename, data);
            return data;
        } catch (error) {
            console.error('[LiveGigs] Error loading', filename, error);
            return null;
        }
    },

    // 计算倒计时天数
    calculateCountdown: function(dateStr) {
        if (!dateStr) return '';
        const eventDate = new Date(dateStr);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays + ' DAYS' : 'STARTED';
    },

    // 格式化日期
    formatDate: function(dateStr) {
        if (!dateStr) return 'Date TBA';
        const date = new Date(dateStr);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },

    // 渲染 Events 页面活动列表
    renderEvents: function(events) {
        const container = document.getElementById('eventsGrid');
        if (!container || !events || !Array.isArray(events)) {
            console.log('[LiveGigs] Events container not found or no data');
            return;
        }

        // 如果没有活动数据，保留静态内容
        if (events.length === 0) {
            console.log('[LiveGigs] No events data, keeping static content');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 渲染每个活动
        events.forEach((event, index) => {
            const eventCard = this.createEventCard(event, index + 1);
            container.appendChild(eventCard);
        });

        // 控制 Load More 按钮
        this.setupLoadMore(events.length);

        // 重新初始化倒计时
        this.initCountdowns();

        console.log('[LiveGigs] Events rendered:', events.length);
    },

    // 创建活动卡片 - 完全匹配现有 HTML 结构
    createEventCard: function(event, id) {
        const div = document.createElement('div');
        div.className = 'event-card';
        div.setAttribute('data-editable', `event-${id}`);
        div.setAttribute('data-event-id', id);

        // 计算倒计时
        const countdown = event.date ? this.calculateCountdown(event.date) : '';

        // 状态类型和文字
        let statusClass = event.status || 'countdown';
        let statusText = event.statusText || countdown;

        // 如果状态是 countdown 但没有文字，使用计算出的倒计时
        if (statusClass === 'countdown' && !event.statusText && countdown) {
            statusText = countdown;
        }

        // 构建详情文字（日期 | 场地）
        let detailsText = '';
        if (event.date && event.venue) {
            const dateStr = this.formatDate(event.date);
            detailsText = `${dateStr} | ${event.venue}`;
        } else if (event.date) {
            detailsText = this.formatDate(event.date);
        } else if (event.venue) {
            detailsText = event.venue;
        } else {
            detailsText = 'Date TBA | Location TBA';
        }

        // 构建 HTML - 完全匹配现有结构
        div.innerHTML = `
            <img src="${event.poster || './image/event-placeholder.jpg'}" alt="${event.title || ''}" class="event-poster" 
                 data-editable="event-${id}-image" data-src="${event.poster || './image/event-placeholder.jpg'}">
            <div class="event-status ${statusClass}" data-editable="event-${id}-status" data-status-type="${statusClass}" data-text="${statusText}" ${event.date ? 'data-countdown-date="' + event.date + '"' : ''} id="status-${id}">${statusText}</div>
            <div class="event-content">
                <h3 class="event-name" data-editable="event-${id}-name" data-text="${event.title || ''}">${event.title || ''}</h3>
                <div class="event-details" data-editable="event-${id}-details" data-text="${detailsText}">${detailsText}</div>
                <div class="event-venue" data-editable="event-${id}-venue" data-text="${event.description || ''}">${event.description || ''}</div>
                <a href="${event.buttonLink || '#'}" class="event-btn" target="_blank" data-editable="event-${id}-btn" data-text="${event.buttonText || 'Learn More'}" data-href="${event.buttonLink || '#'}">${event.buttonText || 'Learn More'}</a>
            </div>
        `;

        return div;
    },

    // 设置 Load More 按钮
    setupLoadMore: function(totalEvents) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (!loadMoreContainer || !loadMoreBtn) return;

        if (totalEvents <= 3) {
            loadMoreContainer.classList.remove('visible');
        } else {
            loadMoreContainer.classList.add('visible');

            // 初始只显示前3个
            const cards = document.querySelectorAll('.event-card');
            cards.forEach((card, index) => {
                if (index >= 3) {
                    card.classList.add('hidden');
                }
            });

            // 绑定点击事件
            loadMoreBtn.onclick = function() {
                const hiddenCards = document.querySelectorAll('.event-card.hidden');
                hiddenCards.forEach(card => card.classList.remove('hidden'));
                loadMoreContainer.classList.remove('visible');
            };
        }
    },

    // 初始化倒计时
    initCountdowns: function() {
        document.querySelectorAll('.event-status[data-status-type="countdown"]').forEach(status => {
            const targetDate = status.getAttribute('data-countdown-date');
            if (!targetDate) return;

            const updateCountdown = () => {
                const now = new Date();
                const target = new Date(targetDate);
                const diff = target - now;

                if (diff <= 0) {
                    status.textContent = 'STARTED';
                    status.classList.remove('countdown');
                    status.classList.add('ontour');
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                status.textContent = days + ' DAYS';
                status.setAttribute('data-text', days + ' DAYS');
            };

            updateCountdown();
        });
    },

    // 渲染滚播海报区域
    renderAutoScroll: function(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('[LiveGigs] No auto scroll data');
            return;
        }

        const track = document.getElementById('autoScrollTrack');
        if (!track) {
            console.log('[LiveGigs] Auto scroll track not found');
            return;
        }

        // 清空现有内容
        track.innerHTML = '';

        // 添加项目（按日期排序）
        items.sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            return dateA.localeCompare(dateB);
        });

        items.forEach((item, index) => {
            const id = index + 1;
            const div = document.createElement('div');
            div.className = 'auto-scroll-item';
            div.setAttribute('data-editable', `auto-${id}`);
            div.setAttribute('data-date', item.date || '');
            div.setAttribute('data-time', item.time || '20:00');

            const metaText = item.date ? `${this.formatDate(item.date)} / ${item.venue || 'TBA'}` : (item.venue || 'TBA');

            div.innerHTML = `
                <div class="auto-scroll-overlay"></div>
                <img src="${item.image || ''}" alt="${item.title || ''}" data-editable="auto-${id}-image" data-src="${item.image || ''}">
                <div class="auto-scroll-info">
                    <h4 class="auto-scroll-title" data-editable="auto-${id}-title" data-text="${item.title || ''}">${item.title || ''}</h4>
                    <div class="auto-scroll-meta" data-editable="auto-${id}-meta" data-text="${metaText}">${metaText}</div>
                </div>
            `;
            track.appendChild(div);
        });

        // 复制一份实现无缝滚动
        items.forEach((item, index) => {
            const id = index + 1;
            const div = document.createElement('div');
            div.className = 'auto-scroll-item';
            div.setAttribute('data-editable', `auto-${id}-clone`);

            const metaText = item.date ? `${this.formatDate(item.date)} / ${item.venue || 'TBA'}` : (item.venue || 'TBA');

            div.innerHTML = `
                <div class="auto-scroll-overlay"></div>
                <img src="${item.image || ''}" alt="${item.title || ''}">
                <div class="auto-scroll-info">
                    <h4 class="auto-scroll-title">${item.title || ''}</h4>
                    <div class="auto-scroll-meta">${metaText}</div>
                </div>
            `;
            track.appendChild(div);
        });

        console.log('[LiveGigs] Auto scroll rendered:', items.length, 'items');
    },

    // 渲染海报数据
    renderPosters: function(posters) {
        if (!posters || !Array.isArray(posters)) return;

        posters.forEach((poster, index) => {
            const i = index + 1;
            const posterEl = document.querySelector(`[data-poster-id="${i}"]`);
            if (!posterEl) return;

            // 更新图片
            const img = posterEl.querySelector('img');
            if (img && poster.image) {
                img.src = poster.image;
                img.setAttribute('data-src', poster.image);
            }

            // 更新标题
            const title = posterEl.querySelector('.poster-title');
            if (title && poster.title) {
                title.textContent = poster.title;
                title.setAttribute('data-text', poster.title);
            }

            // 更新链接
            const link = posterEl.querySelector('.poster-link');
            if (link && poster.link_text) {
                link.textContent = poster.link_text;
                link.setAttribute('data-text', poster.link_text);
            }
            if (poster.link) {
                posterEl.setAttribute('data-link', poster.link);
                if (link) link.href = poster.link;
            }
        });

        console.log('[LiveGigs] Posters rendered:', posters.length);
    },

    // 渲染底部数据
    renderFooter: function(footer) {
        if (!footer) return;

        // 版权信息
        if (footer.copyright) {
            const copyrightEl = document.querySelector('[data-editable="footer-copyright"]');
            if (copyrightEl) {
                copyrightEl.textContent = footer.copyright;
                copyrightEl.setAttribute('data-text', footer.copyright);
            }
        }

        // 社交媒体
        if (footer.social && Array.isArray(footer.social)) {
            const container = document.getElementById('socialContainer');
            if (container) {
                container.innerHTML = '';
                footer.social.forEach(social => {
                    if (social.platform && social.url) {
                        const a = document.createElement('a');
                        a.href = social.url;
                        a.className = 'social-icon';
                        a.title = social.platform;
                        a.setAttribute('data-platform', social.platform);
                        a.setAttribute('data-editable', 'social-' + social.platform);
                        a.setAttribute('data-href', social.url);
                        a.innerHTML = this.getSocialIcon(social.platform);
                        container.appendChild(a);
                    }
                });
            }
        }

        // 制作单位Logo
        if (footer.producer) {
            const producerEl = document.querySelector('[data-editable="producer-logo"]');
            if (producerEl) {
                producerEl.src = footer.producer;
                producerEl.setAttribute('data-src', footer.producer);
            }
        }

        console.log('[LiveGigs] Footer rendered');
    },

    // 获取社交媒体图标 SVG
    getSocialIcon: function(platform) {
        const icons = {
            facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
        };
        return icons[platform.toLowerCase()] || icons.facebook;
    },

    // 加载并渲染所有数据
    loadAndRender: async function(pageType) {
        console.log('[LiveGigs] Loading data for page:', pageType);

        if (pageType === 'events') {
            // 加载 Events 数据
            const eventsData = await this.load('events.json');
            if (eventsData) {
                // 渲染活动列表
                if (eventsData.events && eventsData.events.length > 0) {
                    this.renderEvents(eventsData.events);
                }
                // 渲染滚播海报
                if (eventsData.carousel && eventsData.carousel.length > 0) {
                    this.renderAutoScroll(eventsData.carousel);
                }
                // 渲染海报区域
                if (eventsData.posters && eventsData.posters.length > 0) {
                    this.renderPosters(eventsData.posters);
                }
                // 渲染底部
                if (eventsData.footer) {
                    this.renderFooter(eventsData.footer);
                }
            }
        } else {
            // 其他页面（index, cn等）
            const banners = await this.load('banners.json');
            if (banners && banners.banners) {
                this.renderBanners(banners.banners);
            }

            const postersFile = pageType === 'cn' ? 'cn-posters.json' : 'index-posters.json';
            const posters = await this.load(postersFile);
            if (posters && posters.posters) {
                this.renderPosters(posters.posters);
            }

            const footerFile = pageType === 'cn' ? 'footer-cn.json' : 'footer-global.json';
            const footer = await this.load(footerFile);
            if (footer) {
                this.renderFooter(footer);
            }
        }

        console.log('[LiveGigs] Data loading complete for:', pageType);
    },

    // 强制刷新
    refresh: function(pageType) {
        console.log('[LiveGigs] Force refreshing...');
        this.loadAndRender(pageType);
    }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是 events 页面
    if (document.getElementById('eventsGrid')) {
        LiveGigsData.loadAndRender('events');
    }
});

// 暴露到全局
window.LiveGigsData = LiveGigsData;
