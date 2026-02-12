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
        return diffDays > 0 ? diffDays + ' DAYS' : '';
    },

    // 更新元素内容
    updateElement: function(selector, value, type = 'text') {
        const element = document.querySelector(`[data-editable="${selector}"]`);
        if (!element || !value) return false;

        switch(type) {
            case 'text':
                element.textContent = value;
                element.setAttribute('data-text', value);
                break;
            case 'html':
                element.innerHTML = value;
                break;
            case 'src':
            case 'image':
                element.src = value;
                element.setAttribute('data-src', value);
                break;
            case 'href':
            case 'link':
                if (element.tagName === 'A') {
                    element.href = value;
                } else if (element.tagName === 'BUTTON') {
                    element.onclick = function() { window.open(value, '_blank'); };
                }
                element.setAttribute('data-href', value);
                break;
            case 'poster-link':
                element.setAttribute('data-link', value);
                const linkEl = element.querySelector('.poster-link');
                if (linkEl) linkEl.href = value;
                break;
        }
        return true;
    },

    // 渲染 Banner 数据
    renderBanners: function(banners) {
        if (!banners || !Array.isArray(banners)) return;

        banners.forEach((banner, index) => {
            const i = index + 1;
            if (banner.image) this.updateElement(`banner-${i}-image`, banner.image, 'src');
            if (banner.title) this.updateElement(`banner-${i}-title`, banner.title, 'text');
            if (banner.buttonText) this.updateElement(`banner-${i}-btn`, banner.buttonText, 'text');
            if (banner.buttonLink) this.updateElement(`banner-${i}-btn`, banner.buttonLink, 'href');
        });

        console.log('[LiveGigs] Banners rendered:', banners.length);
    },

    // 渲染海报数据（支持海报2轮播）
    renderPosters: function(posters, carouselData) {
        if (!posters || !Array.isArray(posters)) return;

        // 海报1和海报3（固定）
        [0, 2].forEach(index => {
            const poster = posters[index];
            if (!poster) return;
            const i = index + 1;

            // 更新图片
            const imgEl = document.querySelector(`[data-editable="poster-${i}-image"]`);
            if (imgEl && poster.image) {
                imgEl.src = poster.image;
                imgEl.setAttribute('data-src', poster.image);
            }

            // 更新标题
            const titleEl = document.querySelector(`[data-editable="poster-${i}-title"]`);
            if (titleEl && poster.title) {
                titleEl.textContent = poster.title;
                titleEl.setAttribute('data-text', poster.title);
            }

            // 更新链接文字和链接
            const linkEl = document.querySelector(`[data-editable="poster-${i}-link-text"]`);
            if (linkEl && poster.linkText) {
                linkEl.textContent = poster.linkText;
                linkEl.setAttribute('data-text', poster.linkText);
            }

            // 更新链接地址
            const posterEl = document.querySelector(`[data-poster-id="${i}"]`);
            if (posterEl && poster.link) {
                posterEl.setAttribute('data-link', poster.link);
                const aEl = posterEl.querySelector('.poster-link');
                if (aEl) aEl.href = poster.link;
            }
        });

        // 海报2（支持轮播）
        const poster2Container = document.querySelector('[data-poster-id="2"]');
        if (poster2Container && carouselData && Array.isArray(carouselData) && carouselData.length > 0) {
            // 如果有轮播数据，启用轮播
            this.initPoster2Carousel(carouselData);
        } else if (poster2Container && posters[1]) {
            // 否则显示单张海报
            const poster = posters[1];
            const imgEl = poster2Container.querySelector('[data-editable="poster-2-image"]');
            if (imgEl && poster.image) {
                imgEl.src = poster.image;
                imgEl.setAttribute('data-src', poster.image);
            }

            const titleEl = poster2Container.querySelector('[data-editable="poster-2-title"]');
            if (titleEl && poster.title) {
                titleEl.textContent = poster.title;
                titleEl.setAttribute('data-text', poster.title);
            }

            const linkEl = poster2Container.querySelector('[data-editable="poster-2-link-text"]');
            if (linkEl && poster.linkText) {
                linkEl.textContent = poster.linkText;
                linkEl.setAttribute('data-text', poster.linkText);
            }

            if (poster.link) {
                poster2Container.setAttribute('data-link', poster.link);
                const aEl = poster2Container.querySelector('.poster-link');
                if (aEl) aEl.href = poster.link;
            }
        }

        console.log('[LiveGigs] Posters rendered');
    },

    // 初始化海报2轮播
    initPoster2Carousel: function(carouselData) {
        const container = document.querySelector('[data-poster-id="2"]');
        if (!container || !carouselData || carouselData.length === 0) return;

        // 保存轮播数据
        container.setAttribute('data-carousel', JSON.stringify(carouselData));
        container.setAttribute('data-carousel-index', '0');

        // 显示第一张
        this.showCarouselSlide(container, 0);

        // 自动轮播（5秒切换）
        if (carouselData.length > 1) {
            setInterval(() => {
                const currentIndex = parseInt(container.getAttribute('data-carousel-index') || '0');
                const nextIndex = (currentIndex + 1) % carouselData.length;
                this.showCarouselSlide(container, nextIndex);
            }, 5000);
        }

        console.log('[LiveGigs] Poster2 carousel initialized with', carouselData.length, 'slides');
    },

    // 显示轮播幻灯片
    showCarouselSlide: function(container, index) {
        const carouselData = JSON.parse(container.getAttribute('data-carousel') || '[]');
        if (!carouselData[index]) return;

        const data = carouselData[index];

        // 更新图片
        const imgEl = container.querySelector('[data-editable="poster-2-image"]');
        if (imgEl && data.image) {
            imgEl.style.opacity = '0';
            setTimeout(() => {
                imgEl.src = data.image;
                imgEl.setAttribute('data-src', data.image);
                imgEl.style.opacity = '1';
            }, 300);
        }

        // 更新标题
        const titleEl = container.querySelector('[data-editable="poster-2-title"]');
        if (titleEl && data.title) {
            titleEl.textContent = data.title;
            titleEl.setAttribute('data-text', data.title);
        }

        // 更新链接文字
        const linkTextEl = container.querySelector('[data-editable="poster-2-link-text"]');
        if (linkTextEl && data.linkText) {
            linkTextEl.textContent = data.linkText;
            linkTextEl.setAttribute('data-text', data.linkText);
        }

        // 更新链接地址
        if (data.link) {
            container.setAttribute('data-link', data.link);
            const aEl = container.querySelector('.poster-link');
            if (aEl) aEl.href = data.link;
        }

        container.setAttribute('data-carousel-index', index.toString());
    },

    // 渲染 Events 页面活动列表
    renderEvents: function(events) {
        const container = document.getElementById('eventsContainer');
        if (!container || !events || !Array.isArray(events)) {
            console.log('[LiveGigs] Events container not found or no data');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 如果没有活动，显示默认占位
        if (events.length === 0) {
            container.innerHTML = '<div class="no-events" style="text-align: center; padding: 60px 20px; color: #c0c0c0;">暂无活动，敬请期待</div>';
            this.toggleLoadMoreButton(events.length);
            return;
        }

        // 渲染每个活动
        events.forEach((event, index) => {
            const eventCard = this.createEventCard(event, index);
            container.appendChild(eventCard);
        });

        // 控制 Load More 按钮
        this.toggleLoadMoreButton(events.length);

        console.log('[LiveGigs] Events rendered:', events.length);
    },

    // 创建活动卡片
    createEventCard: function(event, index) {
        const div = document.createElement('div');
        div.className = 'event-card';
        div.setAttribute('data-event-id', index);

        // 计算倒计时
        const countdown = event.date ? this.calculateCountdown(event.date) : '';

        // 状态标签
        let statusBadge = '';
        if (event.status === 'soldout') {
            statusBadge = '<div class="event-status soldout">SOLD OUT</div>';
        } else if (event.status === 'ontour') {
            statusBadge = '<div class="event-status ontour">ON TOUR</div>';
        } else if (event.status === 'comingsoon') {
            statusBadge = '<div class="event-status comingsoon">COMING SOON</div>';
        }

        // 构建内容 - 严格按照原设计
        const dateDisplay = event.date ? this.formatDate(event.date) : 'Date TBA';
        const venueDisplay = event.venue || '';
        const description = event.description || '';

        div.innerHTML = `
            <div class="event-image-wrapper">
                <img src="${event.poster || './image/event-placeholder.jpg'}" alt="${event.title || ''}" class="event-image" loading="lazy">
                ${statusBadge}
                ${countdown ? `<div class="event-countdown">${countdown}</div>` : ''}
            </div>
            <div class="event-info">
                <h3 class="event-title">${event.title || ''}</h3>
                <div class="event-meta">
                    <span class="event-date">${dateDisplay}</span>
                    ${venueDisplay ? `<span class="event-venue">| ${venueDisplay}</span>` : ''}
                </div>
                ${description ? `<p class="event-description">${description}</p>` : ''}
                ${event.buttonText && event.buttonLink ? 
                    `<a href="${event.buttonLink}" class="event-btn" target="_blank">${event.buttonText}</a>` : ''}
            </div>
        `;

        return div;
    },

    // 格式化日期
    formatDate: function(dateStr) {
        if (!dateStr) return 'Date TBA';
        const date = new Date(dateStr);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },

    // 控制 Load More 按钮
    toggleLoadMoreButton: function(totalEvents) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        if (totalEvents <= 3) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
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
                loadMoreBtn.style.display = 'none';
            };
        }
    },

    // 渲染滚播海报区域
    renderCarousel: function(carousel) {
        if (!carousel || !Array.isArray(carousel) || carousel.length === 0) {
            console.log('[LiveGigs] No carousel data');
            return;
        }

        const container = document.getElementById('carouselContainer');
        if (!container) {
            console.log('[LiveGigs] Carousel container not found');
            return;
        }

        // 清空并重建轮播
        container.innerHTML = '';

        carousel.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <img src="${item.image || ''}" alt="${item.title || ''}">
                <div class="carousel-content">
                    <h3>${item.title || ''}</h3>
                    <p>${item.date || ''} ${item.venue ? '| ' + item.venue : ''}</p>
                    ${item.description ? `<p class="carousel-desc">${item.description}</p>` : ''}
                    ${item.link ? `<a href="${item.link}" class="carousel-link" target="_blank">${item.linkText || 'View →'}</a>` : ''}
                </div>
            `;
            container.appendChild(slide);
        });

        // 初始化轮播功能
        this.initCarouselSlider(container, carousel.length);

        console.log('[LiveGigs] Carousel rendered:', carousel.length, 'slides');
    },

    // 初始化轮播滑块
    initCarouselSlider: function(container, totalSlides) {
        let currentSlide = 0;

        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');

        const showSlide = (index) => {
            const slides = container.querySelectorAll('.carousel-slide');
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
        };

        if (prevBtn) {
            prevBtn.onclick = () => {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide(currentSlide);
            };
        }

        // 显示第一张
        showSlide(0);

        // 自动轮播
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }, 5000);
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
                        a.innerHTML = this.getSocialIcon(social.platform);
                        container.appendChild(a);
                    }
                });
            }
        }

        // 制作单位Logo
        if (footer.producer) {
            const producerEl = document.querySelector('[data-editable="footer-producer"]');
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
            twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            weibo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.402-.649.386-1.018.425-1.893.003-2.521-.793-1.17-2.966-1.109-5.419-.031 0 0-.777.34-.578-.275.381-1.215.324-2.234-.27-2.822-1.348-1.335-4.938.045-8.023 3.084C1.353 10.476 0 12.555 0 14.359c0 3.457 4.439 5.56 8.783 5.56 5.691 0 9.479-3.307 9.479-5.929 0-1.587-1.339-2.486-2.203-2.741zm.814-4.278c-.686-.803-1.697-1.135-2.658-.984-.389.06-.659.417-.599.806.06.389.417.659.806.599.524-.082 1.057.095 1.416.513.36.418.466.977.296 1.474-.116.351.073.731.424.848.351.116.731-.073.848-.424.315-.956.129-2.062-.533-2.832zm3.182-2.717c-1.423-1.667-3.527-2.357-5.527-2.044-.389.06-.659.417-.599.806.06.389.417.659.806.599 1.494-.234 3.043.28 4.095 1.512 1.053 1.232 1.357 2.906.912 4.399-.109.351.09.723.441.832.351.109.723-.09.832-.441.578-1.988.189-4.166-1.26-5.663z"/></svg>',
            wechat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>'
        };
        return icons[platform.toLowerCase()] || icons.facebook;
    },

    // 加载并渲染所有数据
    loadAndRender: async function(pageType) {
        console.log('[LiveGigs] Loading data for page:', pageType);

        // 加载 Banner 数据（index 和 cn 共用）
        if (pageType === 'index' || pageType === 'cn') {
            const banners = await this.load('banners.json');
            if (banners && banners.banners) {
                this.renderBanners(banners.banners);
            }
        }

        // 加载海报数据
        if (pageType === 'index' || pageType === 'cn' || pageType === 'events') {
            const postersFile = pageType === 'cn' ? 'cn-posters.json' : 'index-posters.json';
            const posters = await this.load(postersFile);

            // 如果是events页面，检查是否有轮播数据
            let carouselData = null;
            if (pageType === 'events') {
                const eventsData = await this.load('events.json');
                if (eventsData && eventsData.carousel) {
                    carouselData = eventsData.carousel;
                }
            }

            if (posters && posters.posters) {
                this.renderPosters(posters.posters, carouselData);
            }
        }

        // 加载 Events 页面特有数据
        if (pageType === 'events') {
            const eventsData = await this.load('events.json');
            if (eventsData) {
                // 渲染活动列表
                if (eventsData.events) {
                    this.renderEvents(eventsData.events);
                }
                // 渲染滚播海报
                if (eventsData.carousel) {
                    this.renderCarousel(eventsData.carousel);
                }
            }
        }

        // 加载 Partners 页面数据
        if (pageType === 'partners') {
            const partnersData = await this.load('partners.json');
            if (partnersData) {
                // 渲染 Partners Banner
                if (partnersData.banners) {
                    this.renderPartnersBanners(partnersData.banners);
                }
                // 渲染 Collaborators
                if (partnersData.collaborators) {
                    this.renderCollaborators(partnersData.collaborators);
                }
            }
        }

        // 加载底部数据
        const footerFile = pageType === 'cn' ? 'footer-cn.json' : 'footer-global.json';
        const footer = await this.load(footerFile);
        if (footer) {
            this.renderFooter(footer);
        }

        console.log('[LiveGigs] Data loading complete for:', pageType);
    },

    // 渲染 Partners Banner
    renderPartnersBanners: function(banners) {
        if (!banners || !Array.isArray(banners)) return;

        banners.forEach((banner, index) => {
            const i = index + 1;
            // 根据 banner 类型渲染
            const container = document.querySelector(`[data-banner-id="${i}"]`);
            if (!container) return;

            if (banner.background) {
                container.style.backgroundImage = `url(${banner.background})`;
            }
            if (banner.logo) {
                const logoEl = container.querySelector('.banner-logo');
                if (logoEl) {
                    logoEl.src = banner.logo;
                    logoEl.style.display = 'block';
                }
            }
            if (banner.title) {
                const titleEl = container.querySelector('.banner-title');
                if (titleEl) titleEl.textContent = banner.title;
            }
            if (banner.description) {
                const descEl = container.querySelector('.banner-description');
                if (descEl) descEl.textContent = banner.description;
            }
            if (banner.buttonText && banner.buttonLink) {
                const btnEl = container.querySelector('.banner-btn');
                if (btnEl) {
                    btnEl.textContent = banner.buttonText;
                    btnEl.href = banner.buttonLink;
                }
            }
        });

        console.log('[LiveGigs] Partners banners rendered:', banners.length);
    },

    // 渲染 Collaborators
    renderCollaborators: function(collaborators) {
        if (!collaborators || !Array.isArray(collaborators)) return;

        const container = document.getElementById('collaboratorsContainer');
        if (!container) return;

        container.innerHTML = '';
        collaborators.forEach(collab => {
            if (collab.logo) {
                const div = document.createElement('div');
                div.className = 'collaborator-logo';
                if (collab.link) {
                    div.innerHTML = `<a href="${collab.link}" target="_blank"><img src="${collab.logo}" alt="${collab.name || ''}"></a>`;
                } else {
                    div.innerHTML = `<img src="${collab.logo}" alt="${collab.name || ''}">`;
                }
                container.appendChild(div);
            }
        });

        console.log('[LiveGigs] Collaborators rendered:', collaborators.length);
    },

    // 强制刷新
    refresh: function(pageType) {
        console.log('[LiveGigs] Force refreshing...');
        this.loadAndRender(pageType);
    }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    const pageAttr = document.body.getAttribute('data-page');
    if (pageAttr) {
        LiveGigsData.loadAndRender(pageAttr);
    }
});

// 暴露到全局
window.LiveGigsData = LiveGigsData;
