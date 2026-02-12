// LiveGigs Asia - Data Loader
// Loads content from JSON files and renders to page

const baseUrl = 'https://emanonent.github.io/asia/content';

// Page configurations
const pageConfigs = {
    index: {
        json: 'banners.json',
        render: renderIndex
    },
    cn: {
        json: 'banners.json',
        render: renderCN
    },
    events: {
        json: 'events.json',
        render: renderEvents
    },
    partners: {
        json: 'partners.json',
        render: renderPartners
    },
    privacy: {
        json: 'footer-global.json',
        render: renderFooterOnly
    },
    accessibility: {
        json: 'footer-global.json',
        render: renderFooterOnly
    }
};

// Main load function
async function loadAndRender(pageName) {
    const config = pageConfigs[pageName];
    if (!config) {
        console.error('Unknown page:', pageName);
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/${config.json}`);
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();
        config.render(data);
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback: keep static content
    }
}

// Render Index Page
function renderIndex(data) {
    // Render banners
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

    // Render posters
    if (data.posters) {
        renderPosters(data.posters, 'posters-grid');
    }

    // Render footer
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// Render CN Page
function renderCN(data) {
    renderIndex(data); // Same structure as index
}

// Render Events Page - FIXED VERSION
function renderEvents(data) {
    // Render carousel
    if (data.carousel && data.carousel.length > 0) {
        const carouselContainer = document.getElementById('carousel-container');
        if (carouselContainer) {
            carouselContainer.innerHTML = `
                <div class="carousel-track">
                    ${data.carousel.map(item => `
                        <div class="carousel-item">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="carousel-info">
                                <p class="date">${item.date || ''}</p>
                                <h3>${item.title || ''}</h3>
                                <p class="venue">${item.venue || ''}</p>
                                ${item.link ? `<a href="${item.link}">View Details →</a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Render posters (3 posters section)
    if (data.posters) {
        renderPosters(data.posters, 'posters-grid');
    }

    // Render MANAGED EVENTS - THIS IS THE KEY FIX
    if (data.events && data.events.length > 0) {
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.innerHTML = data.events.map((event, index) => `
                <div class="event-card ${index >= 3 ? 'hidden' : ''}" data-id="${event.id || ''}">
                    <img src="${event.image || './image/placeholder.jpg'}" alt="${event.title || ''}">
                    <div class="event-info">
                        <div class="event-status">
                            ${event.onTour ? '<span class="status-badge">ON TOUR</span>' : ''}
                            ${event.soldOut ? '<span class="status-badge">SOLD OUT</span>' : ''}
                        </div>
                        <h3>${event.title || ''}</h3>
                        <div class="event-details">
                            <p><strong>Date:</strong> ${event.date || 'TBA'}</p>
                            <p><strong>Venue:</strong> ${event.venue || 'TBA'}</p>
                            <p><strong>Time:</strong> ${event.time || 'TBA'}</p>
                            ${event.ticket ? `<p><strong>Ticket:</strong> ${event.ticket}</p>` : ''}
                            ${event.details ? `<p>${event.details}</p>` : ''}
                        </div>
                        ${event.button_text && event.link ? 
                            `<a href="${event.link}" class="event-btn" target="_blank">${event.button_text}</a>` : 
                            ''}
                    </div>
                </div>
            `).join('');

            // Show/hide load more button
            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                if (data.events.length > 3) {
                    loadMoreBtn.classList.add('visible');
                } else {
                    loadMoreBtn.classList.remove('visible');
                }
            }
        }
    }

    // Render footer
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// Render Partners Page
function renderPartners(data) {
    // Render banners
    if (data.banners) {
        for (let i = 1; i <= 4; i++) {
            const banner = data.banners[`banner${i}`];
            if (banner) {
                const bannerEl = document.getElementById(`banner-${i}`);
                if (bannerEl) {
                    // Update background
                    if (banner.background) {
                        bannerEl.style.backgroundImage = `url('${banner.background}')`;
                    }
                    // Update logo
                    const logoEl = bannerEl.querySelector('.banner-logo');
                    if (logoEl && banner.logo) {
                        logoEl.src = banner.logo;
                        logoEl.style.display = 'block';
                    } else if (logoEl && !banner.logo) {
                        logoEl.style.display = 'none';
                    }
                    // Update title
                    const titleEl = bannerEl.querySelector('.banner-title');
                    if (titleEl) {
                        titleEl.textContent = banner.title || '';
                        titleEl.style.display = banner.title ? 'block' : 'none';
                    }
                    // Update details
                    const detailsEl = bannerEl.querySelector('.banner-details');
                    if (detailsEl) {
                        detailsEl.textContent = banner.details || '';
                        detailsEl.style.display = banner.details ? 'block' : 'none';
                    }
                    // Update button
                    const btnEl = bannerEl.querySelector('.banner-btn');
                    if (btnEl) {
                        btnEl.textContent = banner.button_text || 'Learn More';
                        btnEl.href = banner.link || '#';
                        btnEl.style.display = banner.button_text ? 'inline-block' : 'none';
                    }
                }
            }
        }
    }

    // Render collaborators
    if (data.collaborators && data.collaborators.length > 0) {
        const collabGrid = document.getElementById('collaborators-grid');
        if (collabGrid) {
            collabGrid.innerHTML = data.collaborators.map(logo => `
                <div class="collaborator-logo">
                    <img src="${logo.image}" alt="${logo.name || 'Partner'}" 
                         style="width: ${logo.width || 180}px; height: ${logo.height || 110}px; object-fit: contain;">
                </div>
            `).join('');
        }
    }

    // Render footer
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// Render Footer Only (for privacy/accessibility pages)
function renderFooterOnly(data) {
    if (data.footer) {
        renderFooter(data.footer);
    }
}

// Helper: Render Posters
function renderPosters(posters, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !posters) return;

    const posterArray = Array.isArray(posters) ? posters : Object.values(posters);

    container.innerHTML = posterArray.map((poster, index) => `
        <div class="poster-card" data-index="${index}">
            <img src="${poster.image}" alt="${poster.title || ''}">
            <div class="poster-info">
                <h3>${poster.title || ''}</h3>
                ${poster.link && poster.link_text ? 
                    `<a href="${poster.link}">${poster.link_text}</a>` : 
                    ''}
            </div>
        </div>
    `).join('');
}

// Helper: Render Footer
function renderFooter(footerData) {
    if (!footerData) return;

    // Update social links
    if (footerData.social && footerData.social.length > 0) {
        const socialContainer = document.getElementById('social-links');
        if (socialContainer) {
            socialContainer.innerHTML = footerData.social.map(social => `
                <a href="${social.url}" target="_blank" title="${social.name}">
                    <img src="${social.icon}" alt="${social.name}" style="width: 24px; height: 24px;">
                </a>
            `).join('');
        }
    }

    // Update copyright
    if (footerData.copyright) {
        const copyrightEl = document.querySelector('.footer-bottom p');
        if (copyrightEl) {
            copyrightEl.innerHTML = footerData.copyright;
        }
    }
}

// Auto-load based on page detection
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