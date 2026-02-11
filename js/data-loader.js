/**
 * LiveGigs Asia - Data Loader
 * 从JSON文件加载内容到页面
 */

const DataLoader = {
    basePath: './content',
    cache: {},
    
    async loadJSON(filename) {
        try {
            if (this.cache[filename]) return this.cache[filename];
            const response = await fetch(`${this.basePath}/${filename}`);
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            this.cache[filename] = data;
            return data;
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    },
    
    async loadBanners() {
        const data = await this.loadJSON('banners.json');
        if (!data || !data.banners) return [];
        return data.banners.filter(b => b.active).sort((a, b) => a.order - b.order);
    },
    
    async loadPosters(type) {
        const filename = type === 'cn' ? 'cn-posters.json' : 
                        type === 'events' ? 'events-posters.json' : 
                        'index-posters.json';
        return await this.loadJSON(filename);
    },
    
    async loadEventsCarousel() {
        const data = await this.loadJSON('events-carousel.json');
        if (!data || !data.items) return [];
        return data.items.filter(i => i.active).sort((a, b) => a.order - b.order);
    },
    
    async loadEventsManaged() {
        const data = await this.loadJSON('events-managed.json');
        if (!data || !data.events) return [];
        return data.events.filter(e => e.active).sort((a, b) => a.order - b.order);
    },
    
    async loadPartnersBanners() {
        return await this.loadJSON('partners-banners.json');
    },
    
    async loadCollaborators() {
        const data = await this.loadJSON('collaborators.json');
        if (!data || !data.logos) return [];
        return data.logos.filter(l => l.active).sort((a, b) => a.order - b.order);
    },
    
    async loadFooter(isCN) {
        const filename = isCN ? 'footer-cn.json' : 'footer-global.json';
        return await this.loadJSON(filename);
    },
    
    renderBanners(banners, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !banners.length) return;
        
        container.innerHTML = banners.map((banner, index) => `
            <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${banner.image}" alt="${banner.title}">
                <div class="banner-content">
                    <h2>${banner.title}</h2>
                    <a href="${banner.link}" class="neon-btn">${banner.button_text}</a>
                </div>
            </div>
        `).join('');
        
        if (banners.length > 1) {
            this.initCarousel(container, banners.length);
        }
    },
    
    renderPosters(posters, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !posters) return;
        
        let html = '';
        
        if (posters.poster1) {
            html += this.createPosterHTML(posters.poster1, 1);
        }
        
        if (posters.poster2) {
            if (posters.poster2.carousel && posters.poster2.images && posters.poster2.images.length) {
                html += this.createCarouselHTML(posters.poster2.images, 2);
            } else {
                html += this.createPosterHTML({
                    image: posters.poster2.single_image,
                    title: posters.poster2.single_title,
                    link_text: posters.poster2.single_link_text,
                    link: posters.poster2.single_link
                }, 2);
            }
        }
        
        if (posters.poster3) {
            html += this.createPosterHTML(posters.poster3, 3);
        }
        
        container.innerHTML = html;
    },
    
    createPosterHTML(poster, index) {
        if (!poster || !poster.image) return '';
        return `
            <div class="poster-item poster-${index}">
                <img src="${poster.image}" alt="${poster.title || ''}">
                <div class="poster-overlay">
                    <h3>${poster.title || ''}</h3>
                    <a href="${poster.link || '#'}" class="poster-link">${poster.link_text || 'View Details →'}</a>
                </div>
            </div>
        `;
    },
    
    createCarouselHTML(images, index) {
        const slides = images.map((img, i) => `
            <div class="carousel-slide ${i === 0 ? 'active' : ''}">
                <img src="${img.image}" alt="${img.title || ''}">
                <div class="carousel-overlay">
                    <h3>${img.title || ''}</h3>
                    <a href="${img.link || '#'}" class="poster-link">View Details →</a>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="poster-item poster-${index} carousel-poster">
                <div class="carousel-container">${slides}</div>
            </div>
        `;
    },
    
    renderEvents(events, containerId, limit = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const displayEvents = events.slice(0, limit);
        const hasMore = events.length > limit;
        
        container.innerHTML = displayEvents.map(event => `
            <div class="event-card">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                    ${event.ontour ? '<span class="badge ontour">ON TOUR</span>' : ''}
                    ${event.soldout ? '<span class="badge soldout">SOLD OUT</span>' : ''}
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p class="event-date">${event.date}</p>
                    <p class="event-location">${event.location}</p>
                    <p class="event-time">${event.time}</p>
                    ${event.ticket ? `<p class="event-ticket">${event.ticket}</p>` : ''}
                    <p class="event-desc">${event.description}</p>
                    <a href="${event.button_link}" class="event-btn">${event.button_text}</a>
                </div>
            </div>
        `).join('');
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
            loadMoreBtn.onclick = () => {
                this.renderEvents(events, containerId, limit + 3);
            };
        }
    },
    
    renderPartnersBanners(banners) {
        if (!banners) return;
        
        Object.keys(banners).forEach(key => {
            const banner = banners[key];
            if (!banner.active) return;
            
            const container = document.getElementById(key);
            if (!container) return;
            
            let html = '';
            if (banner.bg_image) {
                html += `<div class="banner-bg" style="background-image: url('${banner.bg_image}')"></div>`;
            }
            if (banner.logo) {
                html += `<img src="${banner.logo}" class="banner-logo" alt="">`;
            }
            if (banner.product_image) {
                html += `<img src="${banner.product_image}" class="banner-product" alt="">`;
            }
            if (banner.title) {
                html += `<h2>${banner.title}</h2>`;
            }
            if (banner.description) {
                html += `<p>${banner.description}</p>`;
            }
            if (banner.button_text) {
                html += `<a href="${banner.button_link}" class="neon-btn">${banner.button_text}</a>`;
            }
            
            container.innerHTML = html;
        });
    },
    
    renderCollaborators(logos, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !logos.length) return;
        
        container.innerHTML = logos.map(logo => `
            <a href="${logo.link || '#'}" class="collaborator-logo" title="${logo.name}">
                <img src="${logo.logo}" alt="${logo.name}">
            </a>
        `).join('');
    },
    
    renderFooter(data, isCN) {
        if (!data) return;
        
        const emailEl = document.querySelector('.footer-email a');
        if (emailEl) {
            emailEl.href = `mailto:${data.email}`;
            emailEl.textContent = data.email;
        }
        
        const phoneEl = document.querySelector('.footer-phone a');
        if (phoneEl) {
            phoneEl.href = `tel:${data.phone}`;
            phoneEl.textContent = data.phone;
        }
        
        const addressEl = document.querySelector('.footer-address');
        if (addressEl) {
            addressEl.innerHTML = data.address.replace(/\n/g, '<br>');
        }
        
        if (data.social) {
            data.social.forEach(s => {
                if (!s.active) return;
                const icon = document.querySelector(`[data-platform="${s.platform}"]`);
                if (icon) {
                    icon.href = s.url;
                }
            });
        }
        
        const copyrightEl = document.querySelector('.footer-copyright');
        if (copyrightEl) {
            copyrightEl.textContent = data.copyright;
        }
        
        const producerEl = document.querySelector('.producer-logo');
        if (producerEl && data.producer_logo) {
            producerEl.src = data.producer_logo;
        }
    },
    
    initCarousel(container, total) {
        let current = 0;
        const slides = container.querySelectorAll('.banner-slide');
        if (slides.length <= 1) return;
        
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % total;
            slides[current].classList.add('active');
        }, 5000);
    },
    
    async init(pageType) {
        try {
            switch(pageType) {
                case 'index':
                    const [banners, posters, footer] = await Promise.all([
                        this.loadBanners(),
                        this.loadPosters('index'),
                        this.loadFooter(false)
                    ]);
                    this.renderBanners(banners, 'bannerContainer');
                    this.renderPosters(posters, 'postersContainer');
                    this.renderFooter(footer, false);
                    break;
                    
                case 'cn':
                    const [cnBanners, cnPosters, cnFooter] = await Promise.all([
                        this.loadBanners(),
                        this.loadPosters('cn'),
                        this.loadFooter(true)
                    ]);
                    this.renderBanners(cnBanners, 'bannerContainer');
                    this.renderPosters(cnPosters, 'postersContainer');
                    this.renderFooter(cnFooter, true);
                    break;
                    
                case 'events':
                    const [evPosters, evCarousel, evManaged, evFooter] = await Promise.all([
                        this.loadPosters('events'),
                        this.loadEventsCarousel(),
                        this.loadEventsManaged(),
                        this.loadFooter(false)
                    ]);
                    this.renderPosters(evPosters, 'postersContainer');
                    this.renderEvents(evManaged, 'eventsContainer', 3);
                    this.renderFooter(evFooter, false);
                    break;
                    
                case 'partners':
                    const [pBanners, collaborators, pFooter] = await Promise.all([
                        this.loadPartnersBanners(),
                        this.loadCollaborators(),
                        this.loadFooter(false)
                    ]);
                    this.renderPartnersBanners(pBanners);
                    this.renderCollaborators(collaborators, 'collaboratorsContainer');
                    this.renderFooter(pFooter, false);
                    break;
                    
                default:
                    const defaultFooter = await this.loadFooter(pageType === 'cn');
                    this.renderFooter(defaultFooter, pageType === 'cn');
            }
        } catch (e) {
            console.error('DataLoader error:', e);
        }
    }
};

window.DataLoader = DataLoader;
