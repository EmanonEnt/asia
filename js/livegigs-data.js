// LiveGigs Asia - Data Loader
// 版本：2025-02-12 修复版

const baseUrl = 'https://emanonent.github.io/asia/content';

console.log('[LiveGigs] Data loader loaded, baseUrl:', baseUrl);

const pageConfigs = {
    index: { json: 'banners.json', render: renderIndex },
    cn: { json: 'banners.json', render: renderCN },
    events: { json: 'events.json', render: renderEvents },
    partners: { json: 'partners.json', render: renderPartners },
    privacy: { json: 'footer-global.json', render: renderFooterOnly },
    accessibility: { json: 'footer-global.json', render: renderFooterOnly }
};

async function loadAndRender(pageName) {
    console.log('[LiveGigs] loadAndRender called for:', pageName);

    const config = pageConfigs[pageName];
    if (!config) {
        console.log('[LiveGigs] Unknown page:', pageName);
        return;
    }

    const url = baseUrl + '/' + config.json + '?t=' + Date.now();
    console.log('[LiveGigs] Fetching:', url);

    try {
        const response = await fetch(url);
        console.log('[LiveGigs] Response status:', response.status);

        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();
        console.log('[LiveGigs] Data loaded:', data);
        console.log('[LiveGigs] Events:', data.events ? data.events.length : 0);

        config.render(data);
        console.log('[LiveGigs] Render complete for:', pageName);

    } catch (error) {
        console.error('[LiveGigs] Error:', error);
    }
}

function renderEvents(data) {
    console.log('[LiveGigs] renderEvents called');

    // 更新活动
    if (data.events && data.events.length > 0) {
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            console.log('[LiveGigs] Updating events grid with', data.events.length, 'events');

            const html = data.events.map((event, index) => {
                const imageUrl = event.poster || event.image || './image/placeholder.jpg';
                const btnText = event.buttonText || 'Details';
                const btnLink = event.link || '#';

                let statusClass = 'countdown';
                let statusText = 'COMING SOON';
                if (event.soldOut) {
                    statusClass = 'soldout';
                    statusText = typeof event.soldOut === 'string' ? event.soldOut : 'SOLD OUT';
                } else if (event.onTour) {
                    statusClass = 'ontour';
                    statusText = typeof event.onTour === 'string' ? event.onTour : 'ON TOUR';
                }

                const isHidden = index >= 3 ? 'hidden' : '';

                return `<div class="event-card ${isHidden}" data-event-id="${event.id || index}">
                    <img src="${imageUrl}" alt="${event.title}" class="event-poster">
                    <div class="event-status ${statusClass}">${statusText}</div>
                    <div class="event-content">
                        <h3 class="event-name">${event.title}</h3>
                        <div class="event-details">${event.date || 'TBA'} | ${event.venue || 'TBA'}</div>
                        <div class="event-venue">${event.venue || ''}</div>
                        <a href="${btnLink}" class="event-btn" target="_blank">${btnText}</a>
                    </div>
                </div>`;
            }).join('');

            grid.innerHTML = html;

            // Load More按钮
            const loadMore = document.getElementById('loadMoreContainer');
            if (loadMore) {
                if (data.events.length > 3) {
                    loadMore.classList.add('visible');
                } else {
                    loadMore.classList.remove('visible');
                }
            }

            console.log('[LiveGigs] Events grid updated');
        } else {
            console.log('[LiveGigs] eventsGrid not found');
        }
    }

    // 更新轮播
    if (data.carousel && data.carousel.length > 0) {
        const track = document.getElementById('autoScrollTrack');
        if (track) {
            const items = data.carousel.map(item => `
                <div class="auto-scroll-item">
                    <div class="auto-scroll-overlay"></div>
                    <img src="${item.image}" alt="${item.title}">
                    <div class="auto-scroll-info">
                        <h4 class="auto-scroll-title">${item.title}</h4>
                        <div class="auto-scroll-meta">${item.date || ''} / ${item.venue || ''}</div>
                    </div>
                </div>
            `).join('');
            const clones = items; // 克隆一份
            track.innerHTML = items + clones;
        }
    }

    // 更新海报
    if (data.posters && data.posters.length >= 3) {
        for (let i = 1; i <= 3; i++) {
            const poster = document.querySelector('[data-poster-id="' + i + '"]');
            if (poster && data.posters[i-1]) {
                const img = poster.querySelector('img');
                const title = poster.querySelector('.poster-title');
                if (img && data.posters[i-1].image) img.src = data.posters[i-1].image;
                if (title && data.posters[i-1].title) title.textContent = data.posters[i-1].title;
            }
        }
    }

    // 更新底部
    if (data.footer) {
        renderFooter(data.footer);
    }
}

function renderFooter(footerData) {
    if (!footerData) return;

    // 社交链接
    if (footerData.social && footerData.social.length > 0) {
        const container = document.getElementById('socialContainer');
        if (container) {
            const icons = {
                facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
                instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
                youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
                x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
            };

            container.innerHTML = footerData.social.map(s => 
                `<a href="${s.url}" class="social-icon" target="_blank" title="${s.name}">${icons[s.platform] || icons.facebook}</a>`
            ).join('');
        }
    }

    // 版权
    if (footerData.copyright) {
        const el = document.querySelector('.footer-bottom .copyright');
        if (el) el.textContent = footerData.copyright;
    }

    // 邮箱
    if (footerData.email) {
        const el = document.querySelector('.footer-contact-left a[href^="mailto"]');
        if (el) {
            el.href = 'mailto:' + footerData.email;
            el.textContent = footerData.email;
        }
    }

    // 电话
    if (footerData.phone) {
        const el = document.querySelector('.footer-contact-left a[href^="tel"]');
        if (el) {
            el.href = 'tel:' + footerData.phone.replace(/\s/g, '');
            el.textContent = footerData.phone;
        }
    }
}

function renderIndex(data) {
    if (data.banners && data.banners.length > 0) {
        const container = document.getElementById('banner-container');
        if (container) {
            container.innerHTML = data.banners.map(b => `
                <div class="banner-slide" style="background-image: url('${b.image}');">
                    <div class="banner-content">
                        <h2>${b.title || ''}</h2>
                        ${b.button_text ? `<a href="${b.link || '#'}" class="banner-btn">${b.button_text}</a>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }
    if (data.posters) {
        for (let i = 1; i <= 3; i++) {
            const p = document.querySelector('[data-poster-id="' + i + '"]');
            if (p && data.posters[i-1]) {
                const img = p.querySelector('img');
                const title = p.querySelector('.poster-title');
                if (img && data.posters[i-1].image) img.src = data.posters[i-1].image;
                if (title && data.posters[i-1].title) title.textContent = data.posters[i-1].title;
            }
        }
    }
    if (data.footer) renderFooter(data.footer);
}

function renderCN(data) { renderIndex(data); }

function renderPartners(data) {
    if (data.banners) {
        for (let i = 1; i <= 4; i++) {
            const b = data.banners['banner' + i];
            if (b) {
                const el = document.getElementById('banner-' + i);
                if (el) {
                    if (b.background) el.style.backgroundImage = 'url(' + b.background + ')';
                    const logo = el.querySelector('.banner-logo');
                    const title = el.querySelector('.banner-title');
                    const btn = el.querySelector('.banner-btn');
                    if (logo && b.logo) logo.src = b.logo;
                    if (title) title.textContent = b.title || '';
                    if (btn) {
                        btn.textContent = b.button_text || 'Learn More';
                        btn.href = b.link || '#';
                    }
                }
            }
        }
    }
    if (data.collaborators) {
        const grid = document.getElementById('collaborators-grid');
        if (grid) {
            grid.innerHTML = data.collaborators.map(c => `
                <div class="collaborator-logo">
                    <img src="${c.image}" alt="${c.name || ''}" style="width:180px;height:110px;object-fit:contain;">
                </div>
            `).join('');
        }
    }
    if (data.footer) renderFooter(data.footer);
}

function renderFooterOnly(data) {
    if (data.footer) renderFooter(data.footer);
}

// 页面加载完成后自动执行
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    console.log('[LiveGigs] Page path:', path);

    if (path.indexOf('events') !== -1) {
        loadAndRender('events');
    } else if (path.indexOf('partners') !== -1) {
        loadAndRender('partners');
    } else if (path.indexOf('cn') !== -1) {
        loadAndRender('cn');
    } else if (path.indexOf('privacy') !== -1) {
        loadAndRender('privacy');
    } else if (path.indexOf('accessibility') !== -1) {
        loadAndRender('accessibility');
    } else {
        loadAndRender('index');
    }
});

window.LiveGigsData = { loadAndRender: loadAndRender };