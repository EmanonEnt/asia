/**
 * LiveGigs Asia - Data Loader v3.2
 * 修复：添加页面类型检测，避免影响 index/cn 页面
 */

(function() {
    'use strict';

    // ==========================================
    // 检测页面类型
    // ==========================================
    function getPageType() {
        const path = window.location.pathname;
        const hash = window.location.hash;

        // 检查 URL 路径
        if (path.includes('events') || hash.includes('events')) {
            return 'events';
        }
        if (path.includes('cn') || path.includes('livegigscn')) {
            return 'cn';
        }
        if (path.includes('partners')) {
            return 'partners';
        }
        // 默认是 index（首页）
        return 'index';
    }

    const PAGE_TYPE = getPageType();
    console.log('[LiveGigs] Page type detected:', PAGE_TYPE);

    // ==========================================
    // 各页面数据配置
    // ==========================================

    // Events 页面数据
    const EVENTS_DATA = {
        events: [
            {
                id: 1,
                title: "NONAMEFEST 2026",
                date: "2026-10-10",
                venue: "Riot City",
                description: "",
                poster: "./image/thenonameanti-.jpg",
                status: "countdown",
                statusText: "",
                buttonText: "購買票券",
                buttonLink: "https://example.com/tickets1"
            },
            {
                id: 2,
                title: "PUNK HEART FESTIVAL 2026",
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
            {
                id: 1,
                title: "LiveGigs CN",
                image: "./image/livegigscn1.png",
                linkText: "Get on WeChat →",
                link: "https://wxaurl.cn/HMcAK6R7fou"
            },
            {
                id: 2,
                title: "Epic Past Gigs",
                image: "./image/1-b-3.jpg",
                linkText: "View Gallery →",
                link: "./events.html",
                carousel: [
                    "./image/1-b-3.jpg",
                    "./image/livegigscn1.png",
                    "./image/thenonameanti-.jpg"
                ]
            },
            {
                id: 3,
                title: "XRE Booking",
                image: "./image/xrebookingad.jpg",
                linkText: "Check Out More Partners →",
                link: "./partners.html"
            }
        ],
        footer: {
            copyright: "Copyright © 2001-2026 EMANON ENT. - All Rights Reserved.",
            email: "LiveGigsCn@Hotmail.Com",
            phone: "+852-456-7890",
            address: "#303 TERRY FRANCINE STREET,\nHONGKONG, CN 999077",
            social: [
                { platform: "facebook", url: "https://facebook.com/livegigsasia" },
                { platform: "instagram", url: "https://instagram.com/livegigsasia" },
                { platform: "youtube", url: "https://youtube.com/livegigsasia" },
                { platform: "x", url: "https://x.com/livegigsasia" }
            ],
            producer: "./image/emanonent-logo.png"
        }
    };

    // Index 页面数据（首页）
    const INDEX_DATA = {
        banners: [],
        posters: [
            {
                id: 1,
                title: "LiveGigs WeChat",
                image: "./image/livegigscn1.png",
                linkText: "Get on WeChat →",
                link: "https://wxaurl.cn/HMcAK6R7fou"
            },
            {
                id: 2,
                title: "Featured Events",
                image: "./image/1-b-3.jpg",
                linkText: "View Details →",
                link: "./events.html"
            },
            {
                id: 3,
                title: "XRE Booking",
                image: "./image/xrebookingad.jpg",
                linkText: "Check Out More →",
                link: "./partners.html"
            }
        ],
        footer: EVENTS_DATA.footer
    };

    // CN 页面数据（国内站）
    const CN_DATA = {
        banners: [],
        posters: [
            {
                id: 1,
                title: "LiveGigs 微信",
                image: "./image/livegigscn1.png",
                linkText: "关注微信 →",
                link: "https://wxaurl.cn/HMcAK6R7fou"
            },
            {
                id: 2,
                title: "精选活动",
                image: "./image/1-b-3.jpg",
                linkText: "查看详情 →",
                link: "./events.html"
            },
            {
                id: 3,
                title: "XRE Booking",
                image: "./image/xrebookingad.jpg",
                linkText: "了解更多合作伙伴 →",
                link: "./partners.html"
            }
        ],
        footer: {
            copyright: "Copyright © 2001-2026 EMANON ENT. - All Rights Reserved.",
            email: "LiveGigsCn@Hotmail.Com",
            phone: "+86-xxx-xxxx-xxxx",
            address: "中国，香港",
            social: [
                { platform: "wechat", url: "https://wxaurl.cn/HMcAK6R7fou" },
                { platform: "weibo", url: "https://weibo.com/livegigsasia" }
            ],
            producer: "./image/emanonent-logo.png"
        }
    };

    // ==========================================
    // 工具函数
    // ==========================================

    function calculateCountdown(dateStr) {
        if (!dateStr) return '';
        const eventDate = new Date(dateStr);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays + ' DAYS' : 'STARTED';
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

    // ==========================================
    // 渲染函数
    // ==========================================

    function renderEvents(events) {
        // 只在 events 页面执行
        if (PAGE_TYPE !== 'events') {
            console.log('[LiveGigs] Skipping events render on', PAGE_TYPE);
            return;
        }

        const container = document.getElementById('eventsGrid');
        if (!container) return;

        if (!events || events.length === 0) return;

        container.innerHTML = '';

        events.forEach(function(event, index) {
            const card = createEventCard(event, index + 1);
            container.appendChild(card);
        });

        setupLoadMore(events.length);
        initCountdowns();
    }

    function createEventCard(event, id) {
        const div = document.createElement('div');
        div.className = 'event-card';
        div.setAttribute('data-editable', 'event-' + id);
        div.setAttribute('data-event-id', id);

        const countdown = event.date ? calculateCountdown(event.date) : '';
        let statusClass = event.status || 'countdown';
        let statusText = event.statusText || countdown;
        if (statusClass === 'countdown' && !event.statusText && countdown) {
            statusText = countdown;
        }

        let detailsText = '';
        if (event.date && event.venue) {
            detailsText = formatDate(event.date) + ' | ' + event.venue;
        } else if (event.date) {
            detailsText = formatDate(event.date);
        } else if (event.venue) {
            detailsText = event.venue;
        }

        let html = '';
        html += '<img src="' + (event.poster || '') + '" alt="' + (event.title || '') + '" class="event-poster" data-editable="event-' + id + '-image" data-src="' + (event.poster || '') + '">';
        html += '<div class="event-status ' + statusClass + '" data-editable="event-' + id + '-status" data-status-type="' + statusClass + '" data-text="' + statusText + '"' + (event.date ? ' data-countdown-date="' + event.date + '"' : '') + ' id="status-' + id + '">' + statusText + '</div>';
        html += '<div class="event-content">';
        html += '<h3 class="event-name" data-editable="event-' + id + '-name" data-text="' + (event.title || '') + '">' + (event.title || '') + '</h3>';

        if (detailsText) {
            html += '<div class="event-details" data-editable="event-' + id + '-details" data-text="' + detailsText + '">' + detailsText + '</div>';
        }

        if (event.description) {
            html += '<div class="event-venue" data-editable="event-' + id + '-venue" data-text="' + event.description + '">' + event.description + '</div>';
        }

        if (event.buttonText && event.buttonLink) {
            html += '<a href="' + event.buttonLink + '" class="event-btn" target="_blank" data-editable="event-' + id + '-btn" data-text="' + event.buttonText + '" data-href="' + event.buttonLink + '">' + event.buttonText + '</a>';
        }

        html += '</div>';

        div.innerHTML = html;
        return div;
    }

    function setupLoadMore(totalEvents) {
        if (PAGE_TYPE !== 'events') return;

        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (!loadMoreContainer || !loadMoreBtn) return;

        if (totalEvents <= 3) {
            loadMoreContainer.classList.remove('visible');
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.classList.add('visible');
            loadMoreContainer.style.display = 'block';

            const cards = document.querySelectorAll('.event-card');
            cards.forEach(function(card, index) {
                if (index >= 3) {
                    card.classList.add('hidden');
                }
            });

            loadMoreBtn.onclick = function() {
                document.querySelectorAll('.event-card.hidden').forEach(function(card) {
                    card.classList.remove('hidden');
                });
                loadMoreContainer.classList.remove('visible');
                loadMoreContainer.style.display = 'none';
            };
        }
    }

    function initCountdowns() {
        if (PAGE_TYPE !== 'events') return;

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
    }

    function renderAutoScroll(items) {
        if (PAGE_TYPE !== 'events') return;

        const track = document.getElementById('autoScrollTrack');
        if (!track) return;

        track.innerHTML = '';

        items.sort(function(a, b) {
            return (a.date || '').localeCompare(b.date || '');
        });

        items.forEach(function(item, index) {
            const id = index + 1;
            const div = document.createElement('div');
            div.className = 'auto-scroll-item';
            div.setAttribute('data-editable', 'auto-' + id);
            div.setAttribute('data-date', item.date || '');

            const metaText = item.date ? (formatDate(item.date) + ' / ' + (item.venue || 'TBA')) : (item.venue || 'TBA');

            div.innerHTML = 
                '<div class="auto-scroll-overlay"></div>' +
                '<img src="' + (item.image || '') + '" alt="' + (item.title || '') + '" data-editable="auto-' + id + '-image" data-src="' + (item.image || '') + '">' +
                '<div class="auto-scroll-info">' +
                    '<h4 class="auto-scroll-title" data-editable="auto-' + id + '-title" data-text="' + (item.title || '') + '">' + (item.title || '') + '</h4>' +
                    '<div class="auto-scroll-meta" data-editable="auto-' + id + '-meta" data-text="' + metaText + '">' + metaText + '</div>' +
                '</div>';

            track.appendChild(div);
        });

        // 复制一份实现无缝滚动
        items.forEach(function(item, index) {
            const id = index + 1;
            const div = document.createElement('div');
            div.className = 'auto-scroll-item';
            div.setAttribute('data-editable', 'auto-' + id + '-clone');

            const metaText = item.date ? (formatDate(item.date) + ' / ' + (item.venue || 'TBA')) : (item.venue || 'TBA');

            div.innerHTML = 
                '<div class="auto-scroll-overlay"></div>' +
                '<img src="' + (item.image || '') + '" alt="' + (item.title || '') + '">' +
                '<div class="auto-scroll-info">' +
                    '<h4 class="auto-scroll-title">' + (item.title || '') + '</h4>' +
                    '<div class="auto-scroll-meta">' + metaText + '</div>' +
                '</div>';

            track.appendChild(div);
        });
    }

    function renderPosters(posters) {
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
                if (poster.linkText) {
                    link.textContent = poster.linkText;
                    link.setAttribute('data-text', poster.linkText);
                }
                if (poster.link) {
                    el.setAttribute('data-link', poster.link);
                    link.href = poster.link;
                }
            }

            // 海报2轮播（仅在 events 页面）
            if (PAGE_TYPE === 'events' && poster.id === 2 && poster.carousel && poster.carousel.length > 0) {
                initPoster2Carousel(el, poster.carousel);
            }
        });
    }

    function initPoster2Carousel(container, images) {
        const carousel = container.querySelector('#posterCarousel');
        if (!carousel) return;

        const existingImages = carousel.querySelectorAll('img');
        existingImages.forEach(function(img) { img.remove(); });

        images.forEach(function(src, index) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Past Event ' + (index + 1);
            img.setAttribute('data-editable', 'poster-2-image-' + (index + 1));
            img.setAttribute('data-src', src);
            if (index === 0) img.classList.add('active');
            carousel.insertBefore(img, carousel.querySelector('.carousel-dots'));
        });

        const dotsContainer = carousel.querySelector('.carousel-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            images.forEach(function(_, index) {
                const dot = document.createElement('span');
                dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
                dot.onclick = function() { goToSlide(index); };
                dotsContainer.appendChild(dot);
            });
        }

        initCarousel();
    }

    function initCarousel() {
        let currentSlide = 0;
        const carousel = document.getElementById('posterCarousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('img');
        const dots = carousel.querySelectorAll('.carousel-dot');

        window.goToSlide = function(index) {
            if (window.innerWidth <= 768) return;

            slides[currentSlide].classList.remove('active');
            if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

            currentSlide = index;

            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        };

        setInterval(function() {
            if (window.innerWidth <= 768) return;
            const next = (currentSlide + 1) % slides.length;
            window.goToSlide(next);
        }, 4000);
    }

    function renderFooter(footer) {
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
                    a.innerHTML = getSocialIcon(social.platform);
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

        if (footer.email) {
            const el = document.querySelector('.footer-contact-left a[href^="mailto"]');
            if (el) {
                el.href = 'mailto:' + footer.email;
                el.textContent = footer.email;
            }
        }

        if (footer.phone) {
            const el = document.querySelector('.footer-contact-left a[href^="tel"]');
            if (el) {
                el.href = 'tel:' + footer.phone;
                el.textContent = footer.phone;
            }
        }
    }

    function getSocialIcon(platform) {
        const icons = {
            facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            wechat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            weibo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.402-.649.386-1.018.425-1.893.003-2.521-.793-1.17-2.966-1.109-5.419-.031 0 0-.777.34-.578-.275.381-1.215.324-2.234-.27-2.822-1.348-1.335-4.938.045-8.023 3.084C1.353 10.476 0 12.555 0 14.359c0 3.457 4.439 5.56 8.783 5.56 5.691 0 9.479-3.307 9.479-5.929 0-1.587-1.339-2.486-2.203-2.741zm.814-4.278c-.686-.803-1.697-1.135-2.658-.984-.389.06-.659.417-.599.806.06.389.417.659.806.599.524-.082 1.057.095 1.416.513.36.418.466.977.296 1.474-.116.351.073.731.424.848.351.116.731-.073.848-.424.315-.956.129-2.062-.533-2.832zm3.182-2.717c-1.423-1.667-3.527-2.357-5.527-2.044-.389.06-.659.417-.599.806.06.389.417.659.806.599 1.494-.234 3.043.28 4.095 1.512 1.053 1.232 1.357 2.906.912 4.399-.109.351.09.723.441.832.351.109.723-.09.832-.441.578-1.988.189-4.166-1.26-5.663z"/></svg>'
        };
        return icons[platform.toLowerCase()] || icons.facebook;
    }

    // ==========================================
    // 主函数
    // ==========================================

    function init() {
        console.log('[LiveGigs] DataLoader v3.2 starting on', PAGE_TYPE);

        // 根据页面类型加载不同数据
        if (PAGE_TYPE === 'events') {
            renderEvents(EVENTS_DATA.events);
            renderAutoScroll(EVENTS_DATA.carousel);
            renderPosters(EVENTS_DATA.posters);
            renderFooter(EVENTS_DATA.footer);
        } else if (PAGE_TYPE === 'cn') {
            renderPosters(CN_DATA.posters);
            renderFooter(CN_DATA.footer);
        } else {
            // index 和其他页面
            renderPosters(INDEX_DATA.posters);
            renderFooter(INDEX_DATA.footer);
        }

        console.log('[LiveGigs] Render complete for', PAGE_TYPE);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露到全局
    window.LiveGigsData = {
        refresh: init,
        pageType: PAGE_TYPE,
        data: PAGE_TYPE === 'events' ? EVENTS_DATA : (PAGE_TYPE === 'cn' ? CN_DATA : INDEX_DATA)
    };

})();
