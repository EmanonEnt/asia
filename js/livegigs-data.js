// LiveGigs Asia - Data Loader
// 修复：适配底部区域JSON结构

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
    if (!config) {
        console.log('[LiveGigs] Unknown page:', pageName);
        return;
    }

    console.log('[LiveGigs] Loading:', `${baseUrl}/${config.json}`);

    try {
        const response = await fetch(`${baseUrl}/${config.json}?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[LiveGigs] Data loaded successfully:', pageName);
        console.log('[LiveGigs] Events count:', data.events ? data.events.length : 0);

        config.render(data);

    } catch (error) {
        console.error('[LiveGigs] Error loading data:', error);
    }
}

// Events页面
function renderEvents(data) {
    console.log('[LiveGigs] Rendering events page...');

    // 1. 更新轮播海报
    if (data.carousel && data.carousel.length > 0) {
        const track = document.getElementById('autoScrollTrack');
        if (track) {
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
            console.log('[LiveGigs] Carousel updated:', data.carousel.length, 'items');
        }
    }

    // 2. 更新3个海报区域
    if (data.posters && data.posters.length >= 3) {
        const p1 = document.querySelector('[data-poster-id="1"]');
        if (p1 && data.posters[0]) {
            const img = p1.querySelector('img');
            const title = p1.querySelector('.poster-title');
            const link = p1.querySelector('.poster-link');
            if (img && data.posters[0].image) { 
                img.src = data.posters[0].image; 
                img.setAttribute('data-src', data.posters[0].image); 
            }
            if (title && data.posters[0].title) { 
                title.textContent = data.posters[0].title; 
                title.setAttribute('data-text', data.posters[0].title); 
            }
            if (link && data.posters[0].link) { 
                link.href = data.posters[0].link; 
                p1.setAttribute('data-link', data.posters[0].link);
            }
        }

        const p2 = document.querySelector('[data-poster-id="2"]');
        if (p2 && data.posters[1]) {
            const carousel = p2.querySelector('.poster-carousel');
            if (carousel && data.posters[1].carousel && data.posters[1].carousel.length > 0) {
                const images = carousel.querySelectorAll('img');
                data.posters[1].carousel.forEach((slide, idx) => {
                    if (images[idx] && slide.image) {
                        images[idx].src = slide.image;
                        images[idx].setAttribute('data-src', slide.image);
                    }
                });
            } else {
                const img = p2.querySelector('img.active') || p2.querySelector('img');
                if (img && data.posters[1].image) { 
                    img.src = data.posters[1].image; 
                    img.setAttribute('data-src', data.posters[1].image); 
                }
            }
            const title = p2.querySelector('.poster-title');
            if (title && data.posters[1].title) { 
                title.textContent = data.posters[1].title; 
            }
        }

        const p3 = document.querySelector('[data-poster-id="3"]');
        if (p3 && data.posters[2]) {
            const img = p3.querySelector('img');
            const title = p3.querySelector('.poster-title');
            const link = p3.querySelector('.poster-link');
            if (img && data.posters[2].image) { 
                img.src = data.posters[2].image; 
                img.setAttribute('data-src', data.posters[2].image); 
            }
            if (title && data.posters[2].title) { 
                title.textContent = data.posters[2].title; 
            }
            if (link && data.posters[2].link) { 
                link.href = data.posters[2].link; 
            }
        }
        console.log('[LiveGigs] Posters updated');
    }

    // 3. 更新自主活动
    if (data.events && data.events.length > 0) {
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            const eventsHtml = data.events.map((event, index) => {
                const imageUrl = event.poster || event.image || './image/placeholder.jpg';
                const btnText = event.buttonText || event.button_text || 'Details';
                const btnLink = event.link || '#';

                let statusClass = 'countdown';
                let statusText = 'COMING SOON';
                if (event.soldOut) {
                    statusClass = 'soldout';
                    statusText = typeof event.soldOut === 'string' ? event.soldOut : 'SOLD OUT';
                } else if (event.onTour) {
                    statusClass = 'ontour';
                    statusText = typeof event.onTour === 'string' ? event.onTour : 'ON TOUR';
                } else if (event.countdown) {
                    statusText = event.countdown;
                }

                const isHidden = index >= 3 ? 'hidden' : '';

                return `
                <div class="event-card ${isHidden}" data-editable="event-${index+1}" data-event-id="${event.id || (index+1)}">
                    <img src="${imageUrl}" alt="${event.title}" class="event-poster" 
                         data-editable="event-${index+1}-image" data-src="${imageUrl}">
                    <div class="event-status ${statusClass}" data-editable="event-${index+1}-status" 
                         data-status-type="${statusClass}" data-text="${statusText}" 
                         ${event.date ? 'data-countdown-date="' + event.date + '"' : ''}>${statusText}</div>
                    <div class="event-content">
                        <h3 class="event-name" data-editable="event-${index+1}-name" data-text="${event.title}">${event.title}</h3>
                        <div class="event-details" data-editable="event-${index+1}-details" 
                             data-text="${event.date || 'TBA'} | ${event.venue || 'TBA'}">${event.date || 'TBA'} | ${event.venue || 'TBA'}</div>
                        <div class="event-venue" data-editable="event-${index+1}-venue" data-text="${event.venue || ''}">${event.venue || ''}</div>
                        ${btnLink ? `<a href="${btnLink}" class="event-btn" target="_blank" 
                             data-editable="event-${index+1}-btn" data-text="${btnText}" 
                             data-href="${btnLink}">${btnText}</a>` : ''}
                    </div>
                </div>
                `;
            }).join('');

            grid.innerHTML = eventsHtml;
            console.log('[LiveGigs] Events rendered:', data.events.length, 'cards');

            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (loadMoreContainer) {
                if (data.events.length > 3) {
                    loadMoreContainer.classList.add('visible');
                } else {
                    loadMoreContainer.classList.remove('visible');
                }
            }

            if (typeof initCountdowns === 'function') {
                setTimeout(initCountdowns, 100);
            }
        }
    }

    // 4. 更新底部 - 关键修复
    if (data.footer) {
        renderFooter(data.footer);
        console.log('[LiveGigs] Footer updated');
    }

    console.log('[LiveGigs] Data loading complete for: events');
}

// Index页面
function renderIndex(data) {
    if (data.banners && data.banners.length > 0) {
        const bannerContainer = document.getElementById('banner-container');
        if (bannerContainer) {
            bannerContainer.innerHTML = data.banners.map(banner => `
                <div class="banner-slide" style="background-image: url('${banner.image}');">
                    <div class="banner-content">
                        <h2>${banner.title || ''}</h2>
                        ${banner.button_text ? `<a href="${banner.link || '#'}" class="banner-btn">${banner.button_text}</a>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    if (data.posters) {
        updatePosters(data.posters);
    }

    if (data.footer) {
        renderFooter(data.footer);
    }
}

// CN页面
function renderCN(data) {
    renderIndex(data);
}

// Partners页面
function renderPartners(data) {
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
                    if (btn) { btn.textContent = banner.button_text || 'Learn More'; btn.href = banner.link || '#'; btn.style.display = banner.button_text ? 'inline-block' : 'none'; }
                }
            }
        }
    }

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

    const p1 = document.querySelector('[data-poster-id="1"]');
    if (p1 && posters[0]) {
        const img = p1.querySelector('img');
        const title = p1.querySelector('.poster-title');
        const link = p1.querySelector('.poster-link');
        if (img && posters[0].image) img.src = posters[0].image;
        if (title && posters[0].title) title.textContent = posters[0].title;
        if (link && posters[0].link) link.href = posters[0].link;
    }

    const p2 = document.querySelector('[data-poster-id="2"]');
    if (p2 && posters[1]) {
        if (posters[1].carousel && posters[1].carousel.length > 0) {
            const carouselImages = p2.querySelectorAll('.poster-carousel img');
            posters[1].carousel.forEach((slide, idx) => {
                if (carouselImages[idx] && slide.image) carouselImages[idx].src = slide.image;
            });
        } else if (posters[1].image) {
            const img = p2.querySelector('img');
            if (img) img.src = posters[1].image;
        }
    }

    const p3 = document.querySelector('[data-poster-id="3"]');
    if (p3 && posters[2]) {
        const img = p3.querySelector('img');
        const title = p3.querySelector('.poster-title');
        const link = p3.querySelector('.poster-link');
        if (img && posters[2].image) img.src = posters[2].image;
        if (title && posters[2].title) title.textContent = posters[2].title;
        if (link && posters[2].link) link.href = posters[2].link;
    }
}

// 关键修复：底部区域渲染 - 适配实际JSON结构
function renderFooter(footerData) {
    if (!footerData) return;

    console.log('[LiveGigs] Rendering footer...');

    // 1. 更新社交链接 - 使用platform字段生成SVG图标
    if (footerData.social && footerData.social.length > 0) {
        const container = document.getElementById('socialContainer');
        if (container) {
            // SVG图标定义
            const icons = {
                facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
                instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
                youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
                x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
            };

            container.innerHTML = footerData.social.map(social => {
                const iconSvg = icons[social.platform] || icons.facebook;
                return `<a href="${social.url}" class="social-icon" target="_blank" title="${social.name}" data-platform="${social.platform}">${iconSvg}</a>`;
            }).join('');

            console.log('[LiveGigs] Social links updated:', footerData.social.length);
        }
    }

    // 2. 更新版权文字
    if (footerData.copyright) {
        const copyrightEl = document.querySelector('.footer-bottom .copyright');
        if (copyrightEl) {
            copyrightEl.textContent = footerData.copyright;
            console.log('[LiveGigs] Copyright updated');
        }
    }

    // 3. 更新邮箱
    if (footerData.email) {
        const emailEl = document.querySelector('.footer-contact-left a[href^="mailto"]');
        if (emailEl) {
            emailEl.href = 'mailto:' + footerData.email;
            emailEl.textContent = footerData.email;
        }
    }

    // 4. 更新电话
    if (footerData.phone) {
        const phoneEl = document.querySelector('.footer-contact-left a[href^="tel"]');
        if (phoneEl) {
            phoneEl.href = 'tel:' + footerData.phone.replace(/\s/g, '');
            phoneEl.textContent = footerData.phone;
        }
    }

    // 5. 更新地址
    if (footerData.address) {
        const addressEl = document.querySelector('.footer-contact-right .contact-item');
        if (addressEl) {
            addressEl.innerHTML = footerData.address.replace(/\n/g, '<br>');
        }
    }

    // 6. 更新制作单位logo
    if (footerData.producer) {
        const producerEl = document.querySelector('.producer-logo');
        if (producerEl) {
            producerEl.src = footerData.producer;
        }
    }
}

// 自动检测页面并加载
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    console.log('[LiveGigs] Page detected:', path);

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