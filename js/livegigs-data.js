/**
 * LiveGigs Asia - Data Loader (ULTIMATE FIX)
 * 版本: 3.0 - 解决所有 CORS 和加载问题
 */

(function() {
    'use strict';

    // 内联数据 - 避免 fetch CORS 问题
    const INLINE_DATA = {
        events: [
            {
                id: 1,
                title: "NONAMEFEST 2026",
                date: "2026-10-10",
                venue: "Riot City",
                description: "NONAMEFEST 2026",
                poster: "./image/thenonameanti-.jpg",
                status: "countdown",
                statusText: "",
                buttonText: "購買票券",
                buttonLink: "https://example.com/tickets1"
            },
            {
                id: 2,
                title: "PUNK HEART FESTIVAL 2026 WARM-UP Show",
                date: "2026-01-17",
                venue: "未來俱樂部",
                description: "XI'AN",
                poster: "./image/punkheartbanner.jpg",
                status: "soldout",
                statusText: "售完",
                buttonText: "詳細資料",
                buttonLink: "https://example.com/info2"
            },
            {
                id: 3,
                title: "PUNK HEART FESTIVAL 2025",
                date: "2025-10-03",
                venue: "回授俱樂部",
                description: "PUNK HEART FESTIVAL 2025",
                poster: "./image/1-b-2.jpg",
                status: "ontour",
                statusText: "ON TOUR",
                buttonText: "詳細資料",
                buttonLink: "https://example.com/info3"
            },
            {
                id: 4,
                title: "ROCK STORM 2026",
                date: "2026-01-15",
                venue: "TAIPEI",
                description: "ROCK STORM 2026",
                poster: "./image/1-b-3.jpg",
                status: "countdown",
                statusText: "",
                buttonText: "Learn More",
                buttonLink: "https://example.com/info4"
            }
        ],
        carousel: [
            { title: "ROCK STORM 2026", date: "2026-01-15", venue: "TAIPEI", image: "./image/carousel1.jpg" },
            { title: "METAL STORM", date: "2026-02-20", venue: "KAOHSIUNG", image: "./image/carousel2.jpg" },
            { title: "PUNK NIGHT", date: "2026-03-10", venue: "TAICHUNG", image: "./image/carousel3.jpg" },
            { title: "INDIE MUSIC FEST", date: "2026-04-05", venue: "HONG KONG", image: "./image/carousel4.jpg" }
        ],
        posters: [
            { id: 1, title: "LiveGigs CN", image: "./image/livegigscn1.png", link_text: "Get on WeChat →", link: "https://wxaurl.cn/HMcAK6R7fou" },
            { id: 2, title: "Epic Past Gigs", image: "./image/1-b-3.jpg", link_text: "View Gallery →", link: "./events.html" },
            { id: 3, title: "XRE Booking", image: "./image/xrebookingad.jpg", link_text: "Check Out More Partners →", link: "./partners.html" }
        ],
        footer: {
            copyright: "Copyright © 2001-2026 EMANON ENT. - All Rights Reserved.",
            social: [
                { platform: "facebook", url: "https://facebook.com/livegigsasia" },
                { platform: "instagram", url: "https://instagram.com/livegigsasia" },
                { platform: "youtube", url: "https://youtube.com/livegigsasia" },
                { platform: "x", url: "https://x.com/livegigsasia" }
            ],
            producer: "./image/emanonent-logo.png"
        }
    };

    // 数据加载器
    const DataLoader = {
        // 计算倒计时
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
            return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        },

        // 渲染活动列表
        renderEvents: function(events) {
            const container = document.getElementById('eventsGrid');
            if (!container) {
                console.error('[LiveGigs] eventsGrid not found');
                return;
            }

            if (!events || events.length === 0) {
                console.log('[LiveGigs] No events to render');
                return;
            }

            console.log('[LiveGigs] Rendering', events.length, 'events');
            container.innerHTML = '';

            events.forEach((event, index) => {
                const card = this.createEventCard(event, index + 1);
                container.appendChild(card);
            });

            this.setupLoadMore(events.length);
            this.initCountdowns();

            console.log('[LiveGigs] Events rendered successfully');
        },

        // 创建活动卡片
        createEventCard: function(event, id) {
            const div = document.createElement('div');
            div.className = 'event-card';
            div.setAttribute('data-editable', 'event-' + id);
            div.setAttribute('data-event-id', id);

            const countdown = event.date ? this.calculateCountdown(event.date) : '';
            let statusClass = event.status || 'countdown';
            let statusText = event.statusText || countdown;
            if (statusClass === 'countdown' && !event.statusText && countdown) {
                statusText = countdown;
            }

            let detailsText = '';
            if (event.date && event.venue) {
                detailsText = this.formatDate(event.date) + ' | ' + event.venue;
            } else if (event.date) {
                detailsText = this.formatDate(event.date);
            } else if (event.venue) {
                detailsText = event.venue;
            }

            div.innerHTML = 
                '<img src="' + (event.poster || './image/event-placeholder.jpg') + '" alt="' + (event.title || '') + '" class="event-poster" data-editable="event-' + id + '-image" data-src="' + (event.poster || './image/event-placeholder.jpg') + '">' +
                '<div class="event-status ' + statusClass + '" data-editable="event-' + id + '-status" data-status-type="' + statusClass + '" data-text="' + statusText + '"' + (event.date ? ' data-countdown-date="' + event.date + '"' : '') + ' id="status-' + id + '">' + statusText + '</div>' +
                '<div class="event-content">' +
                    '<h3 class="event-name" data-editable="event-' + id + '-name" data-text="' + (event.title || '') + '">' + (event.title || '') + '</h3>' +
                    '<div class="event-details" data-editable="event-' + id + '-details" data-text="' + detailsText + '">' + detailsText + '</div>' +
                    '<div class="event-venue" data-editable="event-' + id + '-venue" data-text="' + (event.description || '') + '">' + (event.description || '') + '</div>' +
                    '<a href="' + (event.buttonLink || '#') + '" class="event-btn" target="_blank" data-editable="event-' + id + '-btn" data-text="' + (event.buttonText || 'Learn More') + '" data-href="' + (event.buttonLink || '#') + '">' + (event.buttonText || 'Learn More') + '</a>' +
                '</div>';

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

                const cards = document.querySelectorAll('.event-card');
                cards.forEach((card, index) => {
                    if (index >= 3) {
                        card.classList.add('hidden');
                    }
                });

                loadMoreBtn.onclick = function() {
                    document.querySelectorAll('.event-card.hidden').forEach(card => {
                        card.classList.remove('hidden');
                    });
                    loadMoreContainer.classList.remove('visible');
                };
            }
        },

        // 初始化倒计时
        initCountdowns: function() {
            document.querySelectorAll('.event-status[data-status-type="countdown"]').forEach(function(status) {
                const targetDate = status.getAttribute('data-countdown-date');
                if (!targetDate) return;

                const updateCountdown = function() {
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

        // 渲染滚播海报
        renderAutoScroll: function(items) {
            if (!items || items.length === 0) return;

            const track = document.getElementById('autoScrollTrack');
            if (!track) return;

            track.innerHTML = '';

            items.forEach(function(item, index) {
                const id = index + 1;
                const div = document.createElement('div');
                div.className = 'auto-scroll-item';
                div.setAttribute('data-editable', 'auto-' + id);
                div.setAttribute('data-date', item.date || '');

                const metaText = item.date ? (this.formatDate(item.date) + ' / ' + (item.venue || 'TBA')) : (item.venue || 'TBA');

                div.innerHTML = 
                    '<div class="auto-scroll-overlay"></div>' +
                    '<img src="' + (item.image || '') + '" alt="' + (item.title || '') + '" data-editable="auto-' + id + '-image" data-src="' + (item.image || '') + '">' +
                    '<div class="auto-scroll-info">' +
                        '<h4 class="auto-scroll-title" data-editable="auto-' + id + '-title" data-text="' + (item.title || '') + '">' + (item.title || '') + '</h4>' +
                        '<div class="auto-scroll-meta" data-editable="auto-' + id + '-meta" data-text="' + metaText + '">' + metaText + '</div>' +
                    '</div>';

                track.appendChild(div);
            }.bind(this));

            // 复制一份实现无缝滚动
            items.forEach(function(item, index) {
                const id = index + 1;
                const div = document.createElement('div');
                div.className = 'auto-scroll-item';
                div.setAttribute('data-editable', 'auto-' + id + '-clone');

                const metaText = item.date ? (this.formatDate(item.date) + ' / ' + (item.venue || 'TBA')) : (item.venue || 'TBA');

                div.innerHTML = 
                    '<div class="auto-scroll-overlay"></div>' +
                    '<img src="' + (item.image || '') + '" alt="' + (item.title || '') + '">' +
                    '<div class="auto-scroll-info">' +
                        '<h4 class="auto-scroll-title">' + (item.title || '') + '</h4>' +
                        '<div class="auto-scroll-meta">' + metaText + '</div>' +
                    '</div>';

                track.appendChild(div);
            }.bind(this));
        },

        // 渲染海报
        renderPosters: function(posters) {
            if (!posters) return;

            posters.forEach(function(poster) {
                const el = document.querySelector('[data-poster-id="' + poster.id + '"]');
                if (!el) return;

                const img = el.querySelector('img');
                if (img && poster.image) {
                    img.src = poster.image;
                    img.setAttribute('data-src', poster.image);
                }

                const title = el.querySelector('.poster-title');
                if (title && poster.title) {
                    title.textContent = poster.title;
                    title.setAttribute('data-text', poster.title);
                }

                const link = el.querySelector('.poster-link');
                if (link) {
                    if (poster.link_text) {
                        link.textContent = poster.link_text;
                        link.setAttribute('data-text', poster.link_text);
                    }
                    if (poster.link) {
                        el.setAttribute('data-link', poster.link);
                        link.href = poster.link;
                    }
                }
            });
        },

        // 渲染底部
        renderFooter: function(footer) {
            if (!footer) return;

            if (footer.copyright) {
                const el = document.querySelector('[data-editable="footer-copyright"]');
                if (el) {
                    el.textContent = footer.copyright;
                    el.setAttribute('data-text', footer.copyright);
                }
            }

            if (footer.social && footer.social.length > 0) {
                const container = document.getElementById('socialContainer');
                if (container) {
                    container.innerHTML = '';
                    footer.social.forEach(function(social) {
                        const a = document.createElement('a');
                        a.href = social.url;
                        a.className = 'social-icon';
                        a.title = social.platform;
                        a.setAttribute('data-platform', social.platform);
                        a.setAttribute('data-editable', 'social-' + social.platform);
                        a.setAttribute('data-href', social.url);

                        // 简单图标
                        a.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';
                        container.appendChild(a);
                    });
                }
            }

            if (footer.producer) {
                const el = document.querySelector('[data-editable="producer-logo"]');
                if (el) {
                    el.src = footer.producer;
                    el.setAttribute('data-src', footer.producer);
                }
            }
        },

        // 主加载函数
        load: function() {
            console.log('[LiveGigs] DataLoader starting...');

            // 使用内联数据（避免 CORS）
            const data = INLINE_DATA;

            // 渲染所有内容
            this.renderEvents(data.events);
            this.renderAutoScroll(data.carousel);
            this.renderPosters(data.posters);
            this.renderFooter(data.footer);

            console.log('[LiveGigs] All content rendered from inline data');
        }
    };

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            DataLoader.load();
        });
    } else {
        // DOM 已加载
        DataLoader.load();
    }

    // 暴露到全局
    window.LiveGigsData = {
        refresh: function() { DataLoader.load(); },
        data: INLINE_DATA
    };

})();
