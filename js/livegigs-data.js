// LiveGigs Asia - Data Loader
// 只加载数据，不改变前端设计和效果

const baseUrl = 'https://emanonent.github.io/asia/content';

// 页面配置
const pageConfigs = {
    index: { json: 'banners.json', render: renderIndex },
    cn: { json: 'banners.json', render: renderCN },
    events: { json: 'events.json', render: renderEvents },
    partners: { json: 'partners.json', render: renderPartners },
    privacy: { json: 'footer-global.json', render: renderFooterOnly },
    accessibility: { json: 'footer-global.json', render: renderFooterOnly }
};

// 主加载函数
async function loadAndRender(pageName) {
    const config = pageConfigs[pageName];
    if (!config) return;

    try {
        const response = await fetch(`${baseUrl}/${config.json}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        config.render(data);
    } catch (error) {
        console.log('Using static content');
    }
}

// Events页面 - 只更新数据，不改变设计
function renderEvents(data) {
    // 1. 更新轮播海报 (carousel)
    if (data.carousel && data.carousel.length > 0) {
        const track = document.getElementById('autoScrollTrack');
        if (track) {
            // 保留原有设计和克隆项逻辑，只更新内容
            const items = data.carousel.map((item, index) => `
                <div class="auto-scroll-item" data-editable="auto-${index+1}" data-date="${item.date || ''}" data-time="${item.time || '20:00'}">
                    <div class="auto-scroll-overlay"></div>
                    <img src="${item.image}" alt="${item.title}" data-editable="auto-${index+1}-image" data-src="${item.image}">
                    <div class="auto-scroll-info">
                        <h4 class="auto-scroll-title" data-editable="auto-${index+1}-title" data-text="${item.title}">${item.title}</h4>
                        <div class="auto-scroll-meta" data-editable="auto-${index+1}-meta" data-text="${item.date || ''} / ${item.venue || ''}">${item.date || ''} / ${item.venue || ''}</div>
                    </div>
                </div>
            `).join('');

            // 克隆一份实现无缝滚动
            const clones = data.carousel.map((item, index) => `
                <div class="auto-scroll-item" data-editable="auto-${index+1}-clone">
                    <div class="auto-scroll-overlay"></div>
                    <img src="${item.image}" alt="${item.title}">
                    <div class="auto-scroll-info">
                        <h4 class="auto-scroll-title">${item.title}</h4>
                        <div class="auto-scroll-meta">${item.date || ''} / ${item.venue || ''}</div>
                    </div>
                </div>
            `).join('');

            track.innerHTML = items + clones;
        }
    }

    // 2. 更新3个海报区域
    if (data.posters && data.posters.length >= 3) {
        // 海报1
        const p1 = document.querySelector('[data-poster-id="1"]');
        if (p1 && data.posters[0]) {
            const img = p1.querySelector('img');
            const title = p1.querySelector('.poster-title');
            const link = p1.querySelector('.poster-link');
            if (img) { img.src = data.posters[0].image; img.setAttribute('data-src', data.posters[0].image); }
            if (title) { title.textContent = data.posters[0].title || ''; title.setAttribute('data-text', data.posters[0].title || ''); }
            if (link && data.posters[0].link) { link.href = data.posters[0].link; }
        }

        // 海报2 - 轮播
        const p2 = document.querySelector('[data-poster-id="2"]');
        if (p2 && data.posters[1]) {
            // 如果是轮播模式
            if (data.posters[1].carousel && data.posters[1].carousel.length > 0) {
                const carousel = p2.querySelector('.poster-carousel');
                if (carousel) {
                    const images = carousel.querySelectorAll('img:not(.active)');
                    data.posters[1].carousel.forEach((slide, idx) => {
                        if (images[idx]) {
                            images[idx].src = slide.image;
                            images[idx].setAttribute('data-src', slide.image);
                        }
                    });
                }
                const title = p2.querySelector('.poster-title');
                if (title) { title.textContent = data.posters[1].title || 'Epic Past Gigs'; }
            } else {
                // 单图模式
                const img = p2.querySelector('img.active') || p2.querySelector('img');
                if (img) { img.src = data.posters[1].image; img.setAttribute('data-src', data.posters[1].image); }
            }
        }

        // 海报3
        const p3 = document.querySelector('[data-poster-id="3"]');
        if (p3 && data.posters[2]) {
            const img = p3.querySelector('img');
            const title = p3.querySelector('.poster-title');
            const link = p3.querySelector('.poster-link');
            if (img) { img.src = data.posters[2].image; img.setAttribute('data-src', data.posters[2].image); }
            if (title) { title.textContent = data.posters[2].title || ''; title.setAttribute('data-text', data.posters[2].title || ''); }
            if (link && data.posters[2].link) { link.href = data.posters[2].link; }
        }
    }

    // 3. 更新自主活动 - THE EVENTS WE'VE MANAGED
    if (data.events && data.events.length > 0) {
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            // 生成活动卡片HTML，保持原有设计类名和结构
            const eventsHtml = data.events.map((event, index) => {
                const statusClass = event.soldOut ? 'soldout' : (event.onTour ? 'ontour' : 'countdown');
                const statusText = event.soldOut ? 'SOLD OUT' : (event.onTour ? 'ON TOUR' : (event.countdown || 'COMING SOON'));
                const isHidden = index >= 3 ? 'hidden' : '';

                return `
                <div class="event-card ${isHidden}" data-editable="event-${index+1}" data-event-id="${index+1}">
                    <img src="${event.image}" alt="${event.title}" class="event-poster" data-editable="event-${index+1}-image" data-src="${event.image}">
                    <div class="event-status ${statusClass}" data-editable="event-${index+1}-status" data-status-type="${statusClass}" data-text="${statusText}" ${event.date ? 'data-countdown-date="' + event.date + '"' : ''}>${statusText}</div>
                    <div class="event-content">
                        <h3 class="event-name" data-editable="event-${index+1}-name" data-text="${event.title}">${event.title}</h3>
                        <div class="event-details" data-editable="event-${index+1}-details" data-text="${event.date || 'TBA'} | ${event.venue || 'TBA'}">${event.date || 'TBA'} | ${event.venue || 'TBA'}</div>
                        <div class="event-venue" data-editable="event-${index+1}-venue" data-text="${event.venue || ''}">${event.venue || ''}</div>
                        ${event.link ? `<a href="${event.link}" class="event-btn" target="_blank" data-editable="event-${index+1}-btn" data-text="${event.button_text || 'Details'}" data-href="${event.link}">${event.button_text || 'Details'}</a>` : ''}
                    </div>
                </div>
                `;
            }).join('');

            grid.innerHTML = eventsHtml;

            // 控制Load More按钮
            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (loadMoreContainer) {
                if (data.events.length > 3) {
                    loadMoreContainer.classList.add('visible');
                } else {
                    loadMoreContainer.classList.remove('visible');
                }
            }

            // 重新初始化倒计时
            if (typeof initCountdowns === 'function') {
                initCountdowns();
            }
        }
    }

    // 4. 更新底部
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// Index页面
function renderIndex(data) {
    // 更新Banner
    if (data.banners && data.banners.length > 0) {
        // Banner更新逻辑（如果有banner容器）
        const bannerSlides = document.querySelectorAll('.banner-slide');
        data.banners.forEach((banner, index) => {
            if (bannerSlides[index]) {
                bannerSlides[index].style.backgroundImage = `url('${banner.image}')`;
                const title = bannerSlides[index].querySelector('h2');
                const btn = bannerSlides[index].querySelector('.banner-btn');
                if (title) title.textContent = banner.title || '';
                if (btn) {
                    btn.textContent = banner.button_text || '';
                    btn.href = banner.link || '#';
                }
            }
        });
    }

    // 更新海报
    if (data.posters) {
        updatePosters(data.posters);
    }

    // 更新底部
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// CN页面（同Index）
function renderCN(data) {
    renderIndex(data);
}

// Partners页面
function renderPartners(data) {
    // 更新4个Banner
    if (data.banners) {
        for (let i = 1; i <= 4; i++) {
            const banner = data.banners[`banner${i}`];
            if (banner) {
                const bannerEl = document.getElementById(`banner-${i}`);
                if (bannerEl) {
                    if (banner.background) bannerEl.style.backgroundImage = `url('${banner.background}')`;
                    const logo = bannerEl.querySelector('.banner-logo');
                    const title = bannerEl.querySelector('.banner-title');
                    const details = bannerEl.querySelector('.banner-details');
                    const btn = bannerEl.querySelector('.banner-btn');

                    if (logo && banner.logo) { logo.src = banner.logo; logo.style.display = 'block'; }
                    if (title) { title.textContent = banner.title || ''; title.style.display = banner.title ? 'block' : 'none'; }
                    if (details) { details.textContent = banner.details || ''; details.style.display = banner.details ? 'block' : 'none'; }
                    if (btn) { 
                        btn.textContent = banner.button_text || 'Learn More'; 
                        btn.href = banner.link || '#';
                        btn.style.display = banner.button_text ? 'inline-block' : 'none';
                    }
                }
            }
        }
    }

    // 更新合作伙伴Logo
    if (data.collaborators && data.collaborators.length > 0) {
        const grid = document.getElementById('collaborators-grid');
        if (grid) {
            grid.innerHTML = data.collaborators.map(logo => `
                <div class="collaborator-logo">
                    <img src="${logo.image}" alt="${logo.name || 'Partner'}" 
                         style="width: ${logo.width || 180}px; height: ${logo.height || 110}px; object-fit: contain;">
                </div>
            `).join('');
        }
    }

    // 更新底部
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// 仅底部页面
function renderFooterOnly(data) {
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// 辅助函数：更新海报
function updatePosters(posters) {
    if (!posters || posters.length < 3) return;

    // 海报1
    const p1 = document.querySelector('[data-poster-id="1"]');
    if (p1) {
        const img = p1.querySelector('img');
        const title = p1.querySelector('.poster-title');
        const link = p1.querySelector('.poster-link');
        if (img && posters[0].image) img.src = posters[0].image;
        if (title && posters[0].title) title.textContent = posters[0].title;
        if (link && posters[0].link) link.href = posters[0].link;
    }

    // 海报2
    const p2 = document.querySelector('[data-poster-id="2"]');
    if (p2 && posters[1]) {
        if (posters[1].carousel && posters[1].carousel.length > 0) {
            // 轮播模式
            const carouselImages = p2.querySelectorAll('.poster-carousel img');
            posters[1].carousel.forEach((slide, idx) => {
                if (carouselImages[idx]) carouselImages[idx].src = slide.image;
            });
        } else if (posters[1].image) {
            // 单图模式
            const img = p2.querySelector('img');
            if (img) img.src = posters[1].image;
        }
    }

    // 海报3
    const p3 = document.querySelector('[data-poster-id="3"]');
    if (p3) {
        const img = p3.querySelector('img');
        const title = p3.querySelector('.poster-title');
        const link = p3.querySelector('.poster-link');
        if (img && posters[2].image) img.src = posters[2].image;
        if (title && posters[2].title) title.textContent = posters[2].title;
        if (link && posters[2].link) link.href = posters[2].link;
    }
}

// 辅助函数：更新底部
function renderFooter(footerData) {
    if (!footerData) return;

    // 社交链接
    if (footerData.social && footerData.social.length > 0) {
        const container = document.getElementById('socialContainer');
        if (container) {
            container.innerHTML = footerData.social.map(social => `
                <a href="${social.url}" class="social-icon" target="_blank" title="${social.name}">
                    <img src="${social.icon}" alt="${social.name}" style="width: 20px; height: 20px;">
                </a>
            `).join('');
        }
    }

    // 版权文字
    if (footerData.copyright) {
        const copyrightEl = document.querySelector('.footer-bottom .copyright');
        if (copyrightEl) copyrightEl.textContent = footerData.copyright;
    }
}

// 自动检测页面并加载
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('events')) {
        loadAndRender('events');
    } else if (path.includes('partners')) {
        loadAndRender('partners');
    } else if (path.includes('cn')) {
        loadAndRender('cn');
    } else if (path.includes('privacy')) {
        loadAndRender('privacy');
    } else if (path.includes('accessibility')) {
        loadAndRender('accessibility');
    } else {
        loadAndRender('index');
    }
});

// 全局API
window.LiveGigsData = {
    loadAndRender: loadAndRender,
    refresh: function(page) {
        loadAndRender(page || 'index');
    }
};