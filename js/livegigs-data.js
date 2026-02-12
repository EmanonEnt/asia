/**
 * LiveGigs Asia - Data Loader
 * 自动从 JSON 文件加载数据并渲染到页面
 * 修复版：支持 load more 功能（≤3个不显示，>3个显示）
 */

const LiveGigsData = {
    // 使用 GitHub Pages 路径（同域名，无 CORS 问题）
    baseUrl: 'https://emanonent.github.io/asia/content',

    // 页面类型映射
    pageTypes: {
        'index': ['banners', 'posters_index', 'footer_global'],
        'cn': ['banners', 'posters_cn', 'footer_cn'],
        'events': ['events', 'footer_global'],
        'partners': ['partners_banners', 'collaborators', 'footer_global'],
        'privacy': ['footer_global'],
        'accessibility': ['footer_global']
    },

    // 加载单个 JSON 文件
    load: async function(filename) {
        try {
            const url = `${this.baseUrl}/${filename}.json`;
            console.log('[LiveGigs] Loading:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`[LiveGigs] Loaded ${filename}.json successfully`);
            return data;
        } catch (error) {
            console.error(`[LiveGigs] Error loading ${filename}.json:`, error);
            return null;
        }
    },

    // 渲染 Banner
    renderBanners: function(data) {
        if (!data || !data.banners) return;

        const slider = document.getElementById('rebelSlider');
        if (!slider) return;

        slider.innerHTML = '';

        data.banners.forEach((banner, index) => {
            const slide = document.createElement('div');
            slide.className = 'rebel-slide';
            slide.setAttribute('data-editable', `banner-slide-${index + 1}`);

            slide.innerHTML = `
                <img src="${banner.image}" alt="${banner.title}" class="rebel-poster"
                     onerror="this.src='https://via.placeholder.com/1920x1080/1a0000/8b0000?text=BANNER+${index + 1}'">
                <div class="rebel-content">
                    <h2>${banner.title}</h2>
                    <button class="neon-btn" onclick="window.open('${banner.buttonLink}', '_blank')">${banner.buttonText}</button>
                </div>
            `;

            slider.appendChild(slide);
        });

        this.initSlider();
    },

    // 渲染海报
    renderPosters: function(data, pageType) {
        if (!data || !data.posters) return;

        const container = document.querySelector('.posters-container');
        if (!container) return;

        container.innerHTML = '';

        data.posters.forEach((poster, index) => {
            const posterDiv = document.createElement('div');
            posterDiv.className = index === 0 ? 'poster-item' : 'poster-item-alt';
            posterDiv.setAttribute('data-poster-id', index + 1);
            posterDiv.setAttribute('data-link', poster.link);

            posterDiv.innerHTML = `
                <img src="${poster.image}" alt="${poster.title}"
                     onerror="this.src='https://via.placeholder.com/400x600/1a0000/8b0000?text=POSTER+${index + 1}'">
                <div class="poster-overlay">
                    <div class="poster-title">${poster.title}</div>
                    <a href="${poster.link}" target="_blank" class="poster-link" onclick="event.stopPropagation();">${poster.linkText} →</a>
                </div>
            `;

            container.appendChild(posterDiv);
        });
    },

    // 渲染活动列表 - 支持 load more
    renderEvents: function(data) {
        if (!data || !data.events || !Array.isArray(data.events)) {
            console.log('[LiveGigs] No events data found');
            return;
        }

        const container = document.getElementById('eventsGrid');
        if (!container) {
            console.log('[LiveGigs] eventsGrid not found');
            return;
        }

        const events = data.events;
        console.log(`[LiveGigs] Rendering ${events.length} events`);

        // 清空现有内容
        container.innerHTML = '';

        // 渲染所有活动（初始显示3个，其余隐藏）
        events.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.setAttribute('data-event-id', event.id || `event-${index}`);

            // 前3个显示，后面的隐藏（用于 load more）
            if (index >= 3) {
                eventCard.classList.add('event-hidden');
                eventCard.style.display = 'none';
            }

            // 构建标签
            let tags = '';
            if (event.onTour) tags += '<span class="event-tag on-tour">ON TOUR</span>';
            if (event.soldOut) tags += '<span class="event-tag sold-out">SOLD OUT</span>';

            // 处理空字段 - 如果为空则不显示
            const dateHtml = event.date ? `<p class="event-date">${event.date}</p>` : '';
            const venueHtml = event.venue ? `<p class="event-location">${event.venue}</p>` : '';
            const timeHtml = event.time ? `<p class="event-time">${event.time}</p>` : '';
            const ticketHtml = event.ticket ? `<p class="event-ticket">${event.ticket}</p>` : '';
            const detailsHtml = event.details ? `<p class="event-details">${event.details}</p>` : '';

            // 按钮 - 如果没有链接则不显示或禁用
            let buttonHtml = '';
            if (event.buttonText) {
                if (event.link && event.link !== '#') {
                    buttonHtml = `<a href="${event.link}" class="event-btn" target="_blank">${event.buttonText}</a>`;
                } else {
                    buttonHtml = `<button class="event-btn" disabled>${event.buttonText}</button>`;
                }
            }

            eventCard.innerHTML = `
                <div class="event-poster-wrapper">
                    <img src="${event.poster || './image/default-event.jpg'}" alt="${event.title}" class="event-poster"
                         onerror="this.src='https://via.placeholder.com/400x600/1a0000/8b0000?text=EVENT+${index + 1}'">
                    ${tags}
                </div>
                <div class="event-info">
                    <h3 class="event-title">${event.title || 'Untitled Event'}</h3>
                    ${dateHtml}
                    ${venueHtml}
                    ${timeHtml}
                    ${ticketHtml}
                    ${detailsHtml}
                    ${buttonHtml}
                </div>
            `;

            container.appendChild(eventCard);
        });

        // 处理 load more 按钮
        this.handleLoadMore(events.length);
    },

    // 处理 load more 按钮
    handleLoadMore: function(totalEvents) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (!loadMoreBtn) {
            console.log('[LiveGigs] loadMoreBtn not found');
            return;
        }

        // ≤3个活动：隐藏 load more 按钮
        if (totalEvents <= 3) {
            loadMoreBtn.style.display = 'none';
            console.log('[LiveGigs] Load more hidden (≤3 events)');
        } else {
            // >3个活动：显示 load more 按钮
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = 'LOAD MORE';

            // 移除旧的事件监听器（避免重复）
            const newBtn = loadMoreBtn.cloneNode(true);
            loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);

            // 添加新的事件监听器
            newBtn.addEventListener('click', function() {
                const hiddenEvents = document.querySelectorAll('.event-hidden');

                if (hiddenEvents.length > 0) {
                    // 显示隐藏的活动
                    hiddenEvents.forEach(el => {
                        el.style.display = 'block';
                        el.classList.remove('event-hidden');
                    });

                    // 隐藏按钮
                    newBtn.style.display = 'none';
                    console.log('[LiveGigs] All events shown');
                }
            });

            console.log(`[LiveGigs] Load more shown (${totalEvents} events, 3 visible)`);
        }
    },

    // 渲染底部
    renderFooter: function(data) {
        if (!data) return;

        // 更新邮箱
        if (data.email) {
            const emailEl = document.querySelector('[data-editable="footer-email"] a');
            if (emailEl) {
                emailEl.href = `mailto:${data.email}`;
                emailEl.textContent = data.email;
            }
        }

        // 更新电话
        if (data.phone) {
            const phoneEl = document.querySelector('[data-editable="footer-phone"] a');
            if (phoneEl) {
                phoneEl.href = `tel:${data.phone}`;
                phoneEl.textContent = data.phone;
            }
        }

        // 更新地址
        if (data.address) {
            const addressEl = document.querySelector('[data-editable="footer-address"]');
            if (addressEl) {
                addressEl.innerHTML = data.address.replace(/\n/g, '<br>');
            }
        }

        // 更新版权
        if (data.copyright) {
            const copyrightEl = document.querySelector('[data-editable="footer-copyright"]');
            if (copyrightEl) {
                copyrightEl.textContent = data.copyright;
            }
        }

        // 更新社交链接
        if (data.social && Array.isArray(data.social)) {
            const socialContainer = document.getElementById('socialContainer');
            if (socialContainer) {
                socialContainer.innerHTML = '';
                data.social.forEach(social => {
                    if (social.url && social.platform) {
                        const a = document.createElement('a');
                        a.href = social.url;
                        a.className = 'social-icon';
                        a.title = social.platform;
                        a.setAttribute('data-platform', social.platform);
                        a.innerHTML = this.getSocialIcon(social.platform);
                        socialContainer.appendChild(a);
                    }
                });
            }
        }
    },

    // 获取社交图标 SVG
    getSocialIcon: function(platform) {
        const icons = {
            'facebook': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            'instagram': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>',
            'youtube': '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            'x': '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
        };
        return icons[platform.toLowerCase()] || icons['facebook'];
    },

    // 初始化轮播
    initSlider: function() {
        const slider = document.getElementById('rebelSlider');
        if (!slider) return;

        let currentSlide = 0;
        const slides = slider.querySelectorAll('.rebel-slide');
        if (slides.length === 0) return;

        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 5000);
    },

    // 加载并渲染所有数据
    loadAndRender: async function(pageType) {
        console.log(`[LiveGigs] Starting data load for: ${pageType}`);

        const files = this.pageTypes[pageType] || [];

        for (const file of files) {
            const data = await this.load(file);
            if (!data) continue;

            // 根据文件名决定如何渲染
            if (file.includes('banners')) {
                this.renderBanners(data);
            } else if (file.includes('posters')) {
                this.renderPosters(data, pageType);
            } else if (file === 'events') {
                // events.json 包含活动数据
                this.renderEvents(data);
            } else if (file.includes('footer')) {
                this.renderFooter(data);
            }
        }

        console.log(`[LiveGigs] Data loading complete for: ${pageType}`);
    }
};

// 导出供全局使用
window.LiveGigsData = LiveGigsData;
