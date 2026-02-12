// LiveGigs Data Loader - 修复版 v2
// 统一字段名映射，支持后台数据格式

(function() {
    'use strict';

    // 配置 - 使用相对路径
    const CONFIG = {
        baseUrl: './content',
        cacheBust: true
    };

    // 页面配置映射
    const PAGE_CONFIG = {
        'index': {
            banners: 'banners.json',
            posters: 'posters-index.json',
            footer: 'footer-global.json'
        },
        'cn': {
            banners: 'banners.json',
            posters: 'posters-cn.json',
            footer: 'footer-cn.json'
        },
        'events': {
            carousel: 'carousel.json',
            managed: 'events-managed.json',
            posters: 'posters-events.json',
            footer: 'footer-global.json'
        },
        'partners': {
            banners: 'partners-banners.json',
            collaborators: 'collaborators.json',
            footer: 'footer-global.json'
        },
        'privacy': {
            footer: 'footer-global.json'
        },
        'accessibility': {
            footer: 'footer-global.json'
        }
    };

    // 获取当前页面类型
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('cn')) return 'cn';
        if (path.includes('events')) return 'events';
        if (path.includes('partners')) return 'partners';
        if (path.includes('privacy')) return 'privacy';
        if (path.includes('accessibility')) return 'accessibility';
        return 'index';
    }

    // 带缓存清除的fetch
    async function fetchJSON(filename) {
        try {
            const url = CONFIG.cacheBust ? 
                `${CONFIG.baseUrl}/${filename}?t=${Date.now()}` : 
                `${CONFIG.baseUrl}/${filename}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    // 安全设置文本内容
    function setText(selector, text, parent = document) {
        if (!text) return;
        const el = parent.querySelector(selector);
        if (el) el.textContent = text;
    }

    // 安全设置HTML内容
    function setHTML(selector, html, parent = document) {
        if (!html) return;
        const el = parent.querySelector(selector);
        if (el) el.innerHTML = html;
    }

    // 安全设置属性
    function setAttr(selector, attr, value, parent = document) {
        if (!value) return;
        const el = parent.querySelector(selector);
        if (el) el.setAttribute(attr, value);
    }

    // 安全设置图片
    function setImage(selector, src, parent = document) {
        if (!src) return;
        const el = parent.querySelector(selector);
        if (el) {
            el.src = src;
            el.onerror = function() {
                this.style.display = 'none';
            };
        }
    }

    // 设置链接（新窗口打开）
    function setLink(selector, href, parent = document) {
        if (!href) return;
        const el = parent.querySelector(selector);
        if (el) {
            el.href = href;
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    }

    // 统一获取字段值（支持多种字段名）
    function getField(obj, ...fields) {
        for (let field of fields) {
            if (obj && obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
                return obj[field];
            }
        }
        return '';
    }

    // 渲染Banner区域
    function renderBanners(data) {
        if (!data) return;

        // 支持两种格式：直接数组 或 {banners: [...]}
        const banners = Array.isArray(data) ? data : (data.banners || []);

        banners.forEach((banner, index) => {
            const i = index + 1;

            // 背景图
            setImage(`#banner${i}-bg`, getField(banner, 'image'), document);
            setImage(`.banner${i}-bg`, getField(banner, 'image'), document);

            // Logo图
            setImage(`#banner${i}-logo`, getField(banner, 'logo'), document);
            setImage(`.banner${i}-logo`, getField(banner, 'logo'), document);

            // 手机图（banner1专用）
            setImage(`#banner1-phone`, getField(banner, 'phoneImage', 'phone_image'), document);

            // 标题
            setText(`#banner${i}-title`, getField(banner, 'title'), document);
            setText(`.banner${i}-title`, getField(banner, 'title'), document);

            // 副标题
            setHTML(`#banner${i}-subtitle`, getField(banner, 'subtitle'), document);
            setHTML(`.banner${i}-subtitle`, getField(banner, 'subtitle'), document);

            // 详情/描述
            setText(`#banner${i}-desc`, getField(banner, 'description', 'desc'), document);
            setText(`.banner${i}-desc`, getField(banner, 'description', 'desc'), document);

            // 按钮文字（支持 buttonText 和 button_text）
            const btnText = getField(banner, 'buttonText', 'button_text', 'btnText');
            setText(`#banner${i}-btn`, btnText, document);
            setText(`.banner${i}-btn`, btnText, document);

            // 按钮链接（支持 buttonLink 和 link）
            const btnLink = getField(banner, 'buttonLink', 'button_link', 'link');
            setLink(`#banner${i}-link`, btnLink, document);
            setLink(`.banner${i}-link`, btnLink, document);
            setLink(`#banner${i}-btn`, btnLink, document);
            setLink(`.banner${i}-btn`, btnLink, document);
        });
    }

    // 渲染海报区域
    function renderPosters(data) {
        if (!data) return;

        // 支持两种格式：直接数组 或 {posters: [...]}
        const posters = Array.isArray(data) ? data : (data.posters || []);

        posters.forEach((poster, index) => {
            const i = index + 1;

            // 海报图片
            setImage(`#poster${i}-img`, getField(poster, 'image'), document);
            setImage(`.poster${i}-img`, getField(poster, 'image'), document);

            // 标题
            setText(`#poster${i}-title`, getField(poster, 'title'), document);
            setText(`.poster${i}-title`, getField(poster, 'title'), document);

            // 按钮文字（支持 link_text, linkText, buttonText, button_text）
            const btnText = getField(poster, 'linkText', 'link_text', 'buttonText', 'button_text');
            setText(`#poster${i}-btn`, btnText, document);
            setText(`.poster${i}-btn`, btnText, document);

            // 链接（支持 link, buttonLink, button_link）
            const link = getField(poster, 'link', 'buttonLink', 'button_link');
            setLink(`#poster${i}-link`, link, document);
            setLink(`.poster${i}-link`, link, document);
            setLink(`#poster${i}-btn`, link, document);
            setLink(`.poster${i}-btn`, link, document);
        });

        // 处理海报2滚播（如果启用）
        if (posters[1] && (posters[1].carousel === true || posters[1].carousel === 'true')) {
            const slides = posters[1].carouselImages || posters[1].slides || [posters[1]];
            if (slides && slides.length > 0) {
                renderPoster2Carousel(slides, posters[1]);
            }
        }
    }

    // 渲染海报2滚播
    function renderPoster2Carousel(slides, poster2Data) {
        const container = document.querySelector('#poster2-carousel') || 
                         document.querySelector('.poster2-carousel') ||
                         document.querySelector('.poster-slider') ||
                         document.querySelector('#poster2') ||
                         document.querySelector('.poster2');

        if (!container) return;

        // 保存原始容器类名和样式
        const originalClass = container.className;

        // 生成滚播HTML
        let html = '<div class="carousel-wrapper">';
        slides.forEach((slide, index) => {
            const img = getField(slide, 'image');
            const title = getField(slide, 'title') || getField(poster2Data, 'title');
            const btnText = getField(slide, 'linkText', 'link_text', 'buttonText', 'button_text') || 
                           getField(poster2Data, 'linkText', 'link_text', 'buttonText', 'button_text');
            const link = getField(slide, 'link', 'buttonLink', 'button_link') || 
                        getField(poster2Data, 'link', 'buttonLink', 'button_link');

            html += `
                <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                    ${img ? `<img src="${img}" alt="${title}" style="width:100%;height:auto;" onerror="this.style.display='none'">` : ''}
                    <div class="poster-content">
                        ${title ? `<h3>${title}</h3>` : ''}
                        ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="poster-btn">${btnText || 'View Details'}</a>` : ''}
                    </div>
                </div>
            `;
        });

        // 添加导航按钮
        if (slides.length > 1) {
            html += `
                <button class="carousel-prev" onclick="window.LiveGigsCarousel.move(-1)" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);z-index:10;">❮</button>
                <button class="carousel-next" onclick="window.LiveGigsCarousel.move(1)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:10;">❯</button>
                <div class="carousel-dots" style="text-align:center;margin-top:10px;">
                    ${slides.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="window.LiveGigsCarousel.goTo(${i})" style="cursor:pointer;margin:0 5px;">●</span>`).join('')}
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // 初始化滚播控制
        initCarousel(slides.length);
    }

    // 滚播控制
    let carouselInterval;
    let currentSlide = 0;
    let totalSlides = 0;

    function initCarousel(total) {
        totalSlides = total;
        if (total <= 1) return;

        // 自动轮播（5秒）
        carouselInterval = setInterval(() => {
            moveCarousel(1);
        }, 5000);

        // 暴露全局控制对象
        window.LiveGigsCarousel = {
            move: function(direction) {
                const slides = document.querySelectorAll('.carousel-slide');
                const dots = document.querySelectorAll('.carousel-dots .dot');

                if (slides.length === 0) return;

                slides[currentSlide].style.display = 'none';
                slides[currentSlide].classList.remove('active');
                if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

                currentSlide = (currentSlide + direction + totalSlides) % totalSlides;

                slides[currentSlide].style.display = 'block';
                slides[currentSlide].classList.add('active');
                if (dots[currentSlide]) dots[currentSlide].classList.add('active');
            },
            goTo: function(index) {
                const slides = document.querySelectorAll('.carousel-slide');
                const dots = document.querySelectorAll('.carousel-dots .dot');

                if (slides.length === 0 || index < 0 || index >= totalSlides) return;

                slides[currentSlide].style.display = 'none';
                slides[currentSlide].classList.remove('active');
                if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

                currentSlide = index;

                slides[currentSlide].style.display = 'block';
                slides[currentSlide].classList.add('active');
                if (dots[currentSlide]) dots[currentSlide].classList.add('active');
            }
        };
    }

    // 渲染Events自主活动
    function renderEventsManaged(data) {
        if (!data) return;

        // 支持两种格式：直接数组 或 {events: [...]}
        const events = Array.isArray(data) ? data : (data.events || []);

        const container = document.querySelector('#events-managed') || 
                         document.querySelector('.events-managed') ||
                         document.querySelector('.events-grid');

        if (!container) return;

        const showLoadMore = events.length > 3;
        const displayEvents = events.slice(0, 3); // 先显示3个

        let html = '';
        displayEvents.forEach((event, index) => {
            const title = getField(event, 'title');
            const date = getField(event, 'date');
            const location = getField(event, 'location');
            const time = getField(event, 'time');
            const details = getField(event, 'details', 'description', 'desc');
            const image = getField(event, 'image');
            const status = getField(event, 'status');
            const btnText = getField(event, 'buttonText', 'button_text', 'btnText');
            const link = getField(event, 'link', 'buttonLink', 'button_link');

            html += `
                <div class="event-card" data-index="${index}">
                    <div class="event-image">
                        ${image ? `<img src="${image}" alt="${title}" onerror="this.style.display='none'">` : ''}
                        ${status ? `<span class="event-status ${status.toLowerCase().replace(' ', '-')}">${status.toUpperCase()}</span>` : ''}
                    </div>
                    <div class="event-info">
                        <h3>${title}</h3>
                        <p class="event-date">${date}</p>
                        <p class="event-location">${location}</p>
                        <p class="event-time">${time}</p>
                        <p class="event-details">${details}</p>
                        ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="event-btn">${btnText || 'Get Tickets'}</a>` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 添加Load More按钮
        const existingBtn = document.querySelector('.load-more-btn');
        if (existingBtn) existingBtn.remove();

        if (showLoadMore) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.onclick = function() {
                const remainingEvents = events.slice(3);
                remainingEvents.forEach(event => {
                    const title = getField(event, 'title');
                    const date = getField(event, 'date');
                    const location = getField(event, 'location');
                    const time = getField(event, 'time');
                    const details = getField(event, 'details', 'description', 'desc');
                    const image = getField(event, 'image');
                    const status = getField(event, 'status');
                    const btnText = getField(event, 'buttonText', 'button_text');
                    const link = getField(event, 'link', 'buttonLink', 'button_link');

                    const card = document.createElement('div');
                    card.className = 'event-card';
                    card.innerHTML = `
                        <div class="event-image">
                            ${image ? `<img src="${image}" alt="${title}" onerror="this.style.display='none'">` : ''}
                            ${status ? `<span class="event-status ${status.toLowerCase().replace(' ', '-')}">${status.toUpperCase()}</span>` : ''}
                        </div>
                        <div class="event-info">
                            <h3>${title}</h3>
                            <p class="event-date">${date}</p>
                            <p class="event-location">${location}</p>
                            <p class="event-time">${time}</p>
                            <p class="event-details">${details}</p>
                            ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="event-btn">${btnText || 'Get Tickets'}</a>` : ''}
                        </div>
                    `;
                    container.appendChild(card);
                });
                this.style.display = 'none';
            };
            container.parentNode.appendChild(loadMoreBtn);
        }
    }

    // 渲染Events滚播海报
    function renderEventsCarousel(data) {
        if (!data) return;

        // 支持两种格式：直接数组 或 {slides: [...]}
        const slides = Array.isArray(data) ? data : (data.slides || []);

        const container = document.querySelector('#events-carousel') || 
                         document.querySelector('.events-carousel');

        if (!container) return;

        let html = '';
        slides.forEach((slide, index) => {
            const title = getField(slide, 'title');
            const time = getField(slide, 'time');
            const location = getField(slide, 'location');
            const details = getField(slide, 'details', 'description', 'desc');
            const image = getField(slide, 'image');
            const link = getField(slide, 'link');

            html += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}" style="display: ${index === 0 ? 'block' : 'none'};">
                    ${image ? `<img src="${image}" alt="${title}" onerror="this.style.display='none'">` : ''}
                    <div class="carousel-caption">
                        <h3>${title}</h3>
                        <p>${time}</p>
                        <p>${location}</p>
                        <p>${details}</p>
                        ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer">Learn More</a>` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // 渲染Partners Banner
    function renderPartnersBanners(data) {
        if (!data) return;

        // 支持两种格式：直接数组 或 {banners: [...]}
        const banners = Array.isArray(data) ? data : (data.banners || []);

        banners.forEach((banner, index) => {
            const i = index + 1;

            // 背景图（支持 background 和 image）
            const bgImage = getField(banner, 'background', 'image');
            setImage(`#partner-banner${i}-bg`, bgImage, document);
            setImage(`.partner-banner${i}-bg`, bgImage, document);

            // Logo
            setImage(`#partner-banner${i}-logo`, getField(banner, 'logo'), document);
            setImage(`.partner-banner${i}-logo`, getField(banner, 'logo'), document);

            // 标题
            setText(`#partner-banner${i}-title`, getField(banner, 'title'), document);
            setText(`.partner-banner${i}-title`, getField(banner, 'title'), document);

            // 详情/描述
            setText(`#partner-banner${i}-desc`, getField(banner, 'description', 'desc'), document);
            setText(`.partner-banner${i}-desc`, getField(banner, 'description', 'desc'), document);

            // 按钮文字
            const btnText = getField(banner, 'buttonText', 'button_text');
            setText(`#partner-banner${i}-btn`, btnText, document);
            setText(`.partner-banner${i}-btn`, btnText, document);

            // 按钮链接
            const btnLink = getField(banner, 'buttonLink', 'button_link', 'link');
            setLink(`#partner-banner${i}-link`, btnLink, document);
            setLink(`.partner-banner${i}-link`, btnLink, document);
            setLink(`#partner-banner${i}-btn`, btnLink, document);
            setLink(`.partner-banner${i}-btn`, btnLink, document);
        });
    }

    // 渲染Collaborators
    function renderCollaborators(data) {
        if (!data) return;

        // 支持两种格式：直接数组 或 {logos: [...]}
        const logos = Array.isArray(data) ? data : (data.logos || []);

        const container = document.querySelector('#collaborators') || 
                         document.querySelector('.collaborators-grid') ||
                         document.querySelector('.partners-logos');

        if (!container) return;

        let html = '';
        logos.forEach(logo => {
            const name = getField(logo, 'name');
            const image = getField(logo, 'image');
            const link = getField(logo, 'link');

            if (link) {
                html += `
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class="collaborator-logo">
                        ${image ? `<img src="${image}" alt="${name}" onerror="this.style.display='none'">` : ''}
                        ${name ? `<span>${name}</span>` : ''}
                    </a>
                `;
            } else {
                html += `
                    <div class="collaborator-logo">
                        ${image ? `<img src="${image}" alt="${name}" onerror="this.style.display='none'">` : ''}
                        ${name ? `<span>${name}</span>` : ''}
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    }

    // 渲染底部区域
    function renderFooter(data) {
        if (!data) return;

        // 标题
        setText('#footer-title', getField(data, 'title'), document);
        setText('.footer-title', getField(data, 'title'), document);

        // 联系信息（支持多种字段名）
        const email = getField(data, 'email');
        const phone = getField(data, 'phone');
        const address = getField(data, 'address', 'contact');

        setText('#footer-email', email, document);
        setText('.footer-email', email, document);
        setLink('#footer-email-link', email ? `mailto:${email}` : '', document);

        setText('#footer-phone', phone, document);
        setText('.footer-phone', phone, document);
        setLink('#footer-phone-link', phone ? `tel:${phone}` : '', document);

        setText('#footer-address', address, document);
        setText('.footer-address', address, document);

        // 版权
        const copyright = getField(data, 'copyright');
        setText('#footer-copyright', copyright, document);
        setText('.copyright', copyright, document);

        // 社交媒体
        const social = data.social || data.socials || [];
        if (social.length > 0) {
            const socialContainer = document.querySelector('#socialContainer') || 
                                   document.querySelector('#footer-social') ||
                                   document.querySelector('.footer-social');

            if (socialContainer) {
                let html = '';
                social.forEach(item => {
                    const platform = getField(item, 'platform', 'icon', 'name');
                    const name = getField(item, 'name', 'platform');
                    const link = getField(item, 'link', 'url');

                    const iconSvg = getSocialIcon(platform || name);
                    html += `
                        <a href="${link}" target="_blank" rel="noopener noreferrer" 
                           class="social-icon" title="${name || platform}">
                            ${iconSvg}
                        </a>
                    `;
                });
                socialContainer.innerHTML = html;
            }
        }

        // 制作单位Logo
        setImage('#producer-logo', getField(data, 'producerLogo', 'producer'), document);
        setImage('.producer-logo img', getField(data, 'producerLogo', 'producer'), document);
    }

    // 获取社交媒体图标SVG
    function getSocialIcon(platform) {
        const icons = {
            'facebook': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            'instagram': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            'youtube': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            'x': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'twitter': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'weibo': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.402-.649.386-1.031.426-1.922.008-2.557-.781-1.19-2.924-1.126-5.354-.034 0 0-.767.334-.571-.271.376-1.217.32-2.234-.266-2.822-1.331-1.335-4.869.047-7.91 3.087C1.167 10.845 0 13.071 0 15.012 0 18.618 4.387 21 8.677 21c5.631 0 9.381-3.264 9.381-5.856 0-1.571-1.326-2.462-1.999-2.495z"/></svg>',
            'xiaohongshu': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.615 14.615h-2.77v-4.615h-2.77v4.615H8.308V7.385h2.77v4.615h2.77V7.385h2.77v9.23z"/></svg>',
            'wechat': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>',
            'miniprogram': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        };

        return icons[platform?.toLowerCase()] || icons['facebook'];
    }

    // 主加载函数
    async function loadAndRender(pageType) {
        const config = PAGE_CONFIG[pageType];
        if (!config) return;

        console.log(`Loading data for ${pageType}...`);

        // 加载所有需要的数据
        const promises = [];
        const data = {};

        if (config.banners) {
            promises.push(fetchJSON(config.banners).then(d => { data.banners = d; }));
        }
        if (config.posters) {
            promises.push(fetchJSON(config.posters).then(d => { data.posters = d; }));
        }
        if (config.carousel) {
            promises.push(fetchJSON(config.carousel).then(d => { data.carousel = d; }));
        }
        if (config.managed) {
            promises.push(fetchJSON(config.managed).then(d => { data.managed = d; }));
        }
        if (config.footer) {
            promises.push(fetchJSON(config.footer).then(d => { data.footer = d; }));
        }
        if (config.collaborators) {
            promises.push(fetchJSON(config.collaborators).then(d => { data.collaborators = d; }));
        }

        await Promise.all(promises);

        // 渲染各个区域
        if (data.banners) renderBanners(data.banners);
        if (data.posters) renderPosters(data.posters);
        if (data.carousel) renderEventsCarousel(data.carousel);
        if (data.managed) renderEventsManaged(data.managed);
        if (data.collaborators) renderCollaborators(data.collaborators);
        if (data.footer) renderFooter(data.footer);

        console.log(`Data loaded for ${pageType}`);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadAndRender(getCurrentPage());
        });
    } else {
        loadAndRender(getCurrentPage());
    }

    // 暴露全局函数供手动刷新
    window.LiveGigsData = {
        refresh: () => loadAndRender(getCurrentPage()),
        loadPage: loadAndRender
    };

})();
