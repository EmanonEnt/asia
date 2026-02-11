// LiveGigs Asia - Data Loader v2.0
// 从 content/*.json 加载数据并渲染到页面

const CONTENT_BASE = './content/';

// 页面配置映射
const PAGE_CONFIG = {
    'index': { 
        posters: 'index-posters.json', 
        banners: 'banners.json', 
        footer: 'footer.json',
        pageType: 'index'
    },
    'cn': { 
        posters: 'cn-posters.json', 
        banners: 'banners.json', 
        footer: 'footer.json',
        pageType: 'cn'
    },
    'events': { 
        posters: 'events-posters.json', 
        events: 'events-managed.json', 
        footer: 'footer.json',
        pageType: 'events'
    },
    'partners': { 
        partners: 'partners-banners.json', 
        collaborators: 'collaborators.json', 
        footer: 'footer.json',
        pageType: 'partners'
    }
};

// 获取当前页面名称
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');

    if (filename === 'cn' || filename === 'livegigscn') return 'cn';
    if (filename === 'events') return 'events';
    if (filename === 'partners') return 'partners';
    if (filename === 'privacy' || filename === 'accessibility') return 'index';
    return 'index';
}

// 加载JSON数据
async function loadData(filename) {
    try {
        // 添加时间戳防止缓存
        const response = await fetch(CONTENT_BASE + filename + '?t=' + Date.now());
        if (!response.ok) {
            console.warn('Failed to load:', filename);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error('Data load error:', e);
        return null;
    }
}

// ========== BANNER 渲染 ==========
function renderBanners(banners) {
    if (!banners || !Array.isArray(banners)) return;

    const container = document.getElementById('banner-container') || document.querySelector('.banner-slider');
    if (!container) return;

    // 过滤启用的banner并按排序
    const activeBanners = banners
        .filter(b => b.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (activeBanners.length === 0) return;

    container.innerHTML = activeBanners.map((banner, index) => `
        <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}" 
             style="background-image: url('${banner.image}');">
            <div class="banner-content">
                <h2 class="banner-title">${banner.title || ''}</h2>
                ${banner.button_text ? `
                    <a href="${banner.link || '#'}" class="banner-btn" 
                       ${banner.link && banner.link.startsWith('http') ? 'target="_blank"' : ''}>
                        ${banner.button_text}
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');

    // 初始化轮播
    if (activeBanners.length > 1) {
        initBannerCarousel(activeBanners.length);
    }
}

function initBannerCarousel(count) {
    let current = 0;
    const slides = document.querySelectorAll('.banner-slide');

    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % count;
        slides[current].classList.add('active');
    }, 5000);
}

// ========== 海报区域渲染 ==========
function renderPosters(posters, pageType) {
    if (!posters || !Array.isArray(posters)) return;

    // 海报1
    renderSinglePoster('poster1', posters[0], 1);

    // 海报2 - Events页面特殊处理（滚播）
    if (pageType === 'events' && posters[1] && posters[1].carousel === true && posters[1].carousel_images) {
        renderCarouselPoster('poster2', posters[1].carousel_images);
    } else {
        renderSinglePoster('poster2', posters[1], 2);
    }

    // 海报3
    renderSinglePoster('poster3', posters[2], 3);
}

function renderSinglePoster(elementId, poster, index) {
    if (!poster) return;

    // 支持多种选择器
    let container = document.getElementById(elementId);
    if (!container) {
        container = document.querySelector(`.poster-section:nth-child(${index})`) || 
                   document.querySelector(`[data-poster="${index}"]`);
    }
    if (!container) return;

    const imgSrc = poster.image || '';
    const title = poster.title || '';
    const linkText = poster.link_text || '';
    const link = poster.link || '#';
    const isExternal = link.startsWith('http');

    container.innerHTML = `
        <div class="poster-card">
            <img src="${imgSrc}" alt="${title}" onerror="this.style.opacity='0'">
            <div class="poster-overlay">
                <h3 class="poster-title">${title}</h3>
                ${linkText ? `
                    <a href="${link}" class="poster-link" ${isExternal ? 'target="_blank"' : ''}>
                        ${linkText}
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

function renderCarouselPoster(elementId, carouselImages) {
    if (!Array.isArray(carouselImages) || carouselImages.length === 0) return;

    let container = document.getElementById(elementId);
    if (!container) {
        container = document.querySelector('.poster-section:nth-child(2)') || 
                   document.querySelector('[data-poster="2"]');
    }
    if (!container) return;

    const imagesHtml = carouselImages.map((img, idx) => {
        const isExternal = img.link && img.link.startsWith('http');
        return `
            <div class="carousel-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                <img src="${img.image}" alt="${img.title}" onerror="this.style.display='none'">
                <div class="carousel-overlay">
                    <h3 class="carousel-title">${img.title || ''}</h3>
                    ${img.link_text ? `
                        <a href="${img.link || '#'}" class="carousel-link" ${isExternal ? 'target="_blank"' : ''}>
                            ${img.link_text}
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    const dotsHtml = carouselImages.length > 1 ? `
        <div class="carousel-dots">
            ${carouselImages.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
        </div>
    ` : '';

    container.innerHTML = `
        <div class="poster-carousel">
            <div class="carousel-container">
                ${imagesHtml}
            </div>
            ${dotsHtml}
        </div>
    `;

    // 初始化滚播
    if (carouselImages.length > 1) {
        initPosterCarousel(carouselImages.length);
    }
}

function initPosterCarousel(count) {
    let current = 0;
    const container = document.querySelector('.poster-carousel');
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.carousel-dots .dot');

    function showSlide(index) {
        slides[current].classList.remove('active');
        if (dots.length) dots[current].classList.remove('active');
        current = index;
        slides[current].classList.add('active');
        if (dots.length) dots[current].classList.add('active');
    }

    // 自动轮播
    setInterval(() => {
        showSlide((current + 1) % count);
    }, 4000);

    // 点击dot切换
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => showSlide(idx));
    });
}

// ========== 倒计时计算 ==========
function getCountdown(targetDate) {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) return 'LIVE NOW';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 30) return `${Math.floor(days/30)} MONTHS LEFT`;
    if (days > 0) return `${days} DAYS LEFT`;
    return `${hours} HOURS LEFT`;
}

// ========== Events 活动列表渲染 ==========
function renderEvents(events) {
    if (!events || !Array.isArray(events)) return;

    const container = document.getElementById('events-managed') || 
                     document.querySelector('.events-grid') ||
                     document.getElementById('events-container');
    if (!container) return;

    // 只显示前6个
    const displayEvents = events.slice(0, 6);

    container.innerHTML = displayEvents.map(evt => {
        const countdown = getCountdown(evt.date);
        const statusClass = evt.status === 'soldout' ? 'sold-out' : 
                           evt.status === 'ontour' ? 'on-tour' : '';
        const statusText = evt.status === 'soldout' ? 'SOLD OUT' : 
                          evt.status === 'ontour' ? 'ON TOUR' : '';
        const isExternal = evt.link && evt.link.startsWith('http');

        return `
            <div class="event-card ${statusClass}">
                <div class="event-image">
                    <img src="${evt.image}" alt="${evt.title}" onerror="this.src='./image/placeholder.jpg'">
                    ${statusText ? `<span class="event-badge ${evt.status}">${statusText}</span>` : ''}
                    ${countdown && !evt.status ? `<span class="event-countdown">${countdown}</span>` : ''}
                </div>
                <div class="event-info">
                    <h3 class="event-title">${evt.title}</h3>
                    <p class="event-meta">
                        <span class="event-date">${evt.date || ''}</span>
                        <span class="event-location">${evt.location || ''}</span>
                        <span class="event-time">${evt.time || ''}</span>
                    </p>
                    ${evt.ticket ? `<p class="event-ticket">${evt.ticket}</p>` : ''}
                    ${evt.description ? `<p class="event-desc">${evt.description}</p>` : ''}
                    <a href="${evt.link || '#'}" class="event-btn" ${isExternal ? 'target="_blank"' : ''}>
                        ${evt.button_text || 'Get Tickets →'}
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Load More 按钮
    if (events.length > 6) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        loadMoreContainer.innerHTML = `<button class="load-more-btn" onclick="loadMoreEvents()">Load More</button>`;
        container.appendChild(loadMoreContainer);
    }
}

// ========== Partners Banner 渲染 ==========
function renderPartnersBanners(banners) {
    if (!banners || !Array.isArray(banners)) return;

    banners.forEach((banner, index) => {
        const container = document.getElementById(`partner-banner-${index + 1}`) ||
                         document.querySelector(`.partner-banner-${index + 1}`) ||
                         document.querySelector(`[data-banner="${index + 1}"]`);
        if (!container) return;

        const isExternal = banner.link && banner.link.startsWith('http');

        container.innerHTML = `
            <div class="partner-banner-inner" style="background-image: url('${banner.background}')">
                ${banner.logo ? `<img src="${banner.logo}" class="partner-logo" alt="" onerror="this.style.display='none'">` : ''}
                <div class="partner-content">
                    <h3>${banner.title || ''}</h3>
                    ${banner.description ? `<p>${banner.description}</p>` : ''}
                    ${banner.button_text ? `
                        <a href="${banner.link || '#'}" class="partner-btn" ${isExternal ? 'target="_blank"' : ''}>
                            ${banner.button_text}
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    });
}

// ========== Collaborators 渲染 ==========
function renderCollaborators(collaborators) {
    if (!collaborators || !Array.isArray(collaborators)) return;

    const container = document.getElementById('collaborators-container') ||
                     document.querySelector('.collaborators-grid');
    if (!container) return;

    container.innerHTML = collaborators.map(logo => `
        <div class="collaborator-item">
            <img src="${logo}" alt="Partner" onerror="this.style.display='none'">
        </div>
    `).join('');
}

// ========== Footer 渲染 ==========
function renderFooter(footerData, isCN = false) {
    if (!footerData) return;

    const container = document.getElementById('footer-container') ||
                     document.querySelector('footer') ||
                     document.querySelector('.footer');
    if (!container) return;

    const data = isCN ? (footerData.cn || footerData) : (footerData.global || footerData);

    const socialHtml = (data.social || []).map(s => {
        const isExternal = s.url && s.url.startsWith('http');
        return `
            <a href="${s.url}" class="social-link" ${isExternal ? 'target="_blank"' : ''} title="${s.name}">
                <span class="social-icon icon-${s.icon}">${s.name[0]}</span>
            </a>
        `;
    }).join('');

    container.innerHTML = `
        <div class="footer-content">
            <div class="footer-brand">
                <span class="footer-logo">LIVEGIGS</span>
                <span class="footer-asia">(ASIA)</span>
            </div>
            <div class="footer-social">${socialHtml}</div>
            <p class="footer-copyright">${data.copyright || ''}</p>
            ${data.producer ? `
                <div class="footer-producer">
                    <img src="${data.producer}" alt="EMANON" onerror="this.style.display='none'">
                </div>
            ` : ''}
        </div>
    `;
}

// ========== Load More 功能 ==========
window.loadMoreEvents = async function() {
    const events = await loadData('events-managed.json');
    if (!events || !Array.isArray(events)) return;

    const container = document.getElementById('events-managed') || 
                     document.querySelector('.events-grid');
    if (!container) return;

    // 移除Load More按钮
    const loadMoreBtn = container.querySelector('.load-more-container');
    if (loadMoreBtn) loadMoreBtn.remove();

    // 渲染全部活动
    const allEvents = events.map(evt => {
        const countdown = getCountdown(evt.date);
        const statusClass = evt.status === 'soldout' ? 'sold-out' : 
                           evt.status === 'ontour' ? 'on-tour' : '';
        const statusText = evt.status === 'soldout' ? 'SOLD OUT' : 
                          evt.status === 'ontour' ? 'ON TOUR' : '';
        const isExternal = evt.link && evt.link.startsWith('http');

        return `
            <div class="event-card ${statusClass}">
                <div class="event-image">
                    <img src="${evt.image}" alt="${evt.title}" onerror="this.src='./image/placeholder.jpg'">
                    ${statusText ? `<span class="event-badge ${evt.status}">${statusText}</span>` : ''}
                    ${countdown && !evt.status ? `<span class="event-countdown">${countdown}</span>` : ''}
                </div>
                <div class="event-info">
                    <h3 class="event-title">${evt.title}</h3>
                    <p class="event-meta">
                        <span class="event-date">${evt.date || ''}</span>
                        <span class="event-location">${evt.location || ''}</span>
                        <span class="event-time">${evt.time || ''}</span>
                    </p>
                    ${evt.ticket ? `<p class="event-ticket">${evt.ticket}</p>` : ''}
                    ${evt.description ? `<p class="event-desc">${evt.description}</p>` : ''}
                    <a href="${evt.link || '#'}" class="event-btn" ${isExternal ? 'target="_blank"' : ''}>
                        ${evt.button_text || 'Get Tickets →'}
                    </a>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = allEvents;
};

// ========== 主初始化 ==========
document.addEventListener('DOMContentLoaded', async function() {
    const page = getCurrentPage();
    const config = PAGE_CONFIG[page];

    if (!config) {
        console.log('No config for page:', page);
        return;
    }

    console.log('Loading data for page:', page);

    // 并行加载所有数据
    const promises = [];

    if (config.banners) {
        promises.push(loadData(config.banners).then(data => {
            if (data) renderBanners(data);
        }));
    }

    if (config.posters) {
        promises.push(loadData(config.posters).then(data => {
            if (data) renderPosters(data, config.pageType);
        }));
    }

    if (config.events) {
        promises.push(loadData(config.events).then(data => {
            if (data) renderEvents(data);
        }));
    }

    if (config.partners) {
        promises.push(loadData(config.partners).then(data => {
            if (data) renderPartnersBanners(data);
        }));
    }

    if (config.collaborators) {
        promises.push(loadData(config.collaborators).then(data => {
            if (data) renderCollaborators(data);
        }));
    }

    if (config.footer) {
        promises.push(loadData(config.footer).then(data => {
            if (data) renderFooter(data, page === 'cn');
        }));
    }

    await Promise.all(promises);
    console.log('All data loaded for page:', page);
});
