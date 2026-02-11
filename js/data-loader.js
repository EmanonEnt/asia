// LiveGigs Data Loader v3.0
(function() {
    function safeText(obj, key, defaultVal) {
        if (!obj || typeof obj !== 'object') return defaultVal;
        const val = obj[key];
        return (val === undefined || val === null || val === '') ? defaultVal : String(val);
    }

    function safeArray(obj, key) {
        if (!obj || typeof obj !== 'object') return [];
        const val = obj[key];
        return Array.isArray(val) ? val.filter(item => item !== null && item !== undefined) : [];
    }

    async function loadJSON(filename) {
        try {
            const res = await fetch('./content/' + filename + '.json?v=' + Date.now());
            if (!res.ok) throw new Error('Not found');
            return await res.json();
        } catch (e) { return null; }
    }

    const icons = {
        facebook: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/></svg>',
        youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        twitter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        weibo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439z"/></svg>',
        wechat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05z"/></svg>'
    };

    async function renderFooter() {
        const isCN = window.location.href.includes('cn');
        const data = await loadJSON(isCN ? 'footer-cn' : 'footer-global');
        if (!data) return;

        const footer = document.querySelector('.footer, footer, #footer');
        if (!footer) return;

        // 查找copyright
        let copyrightEl = footer.querySelector('.footer-copyright, .copyright, .footer-bottom p');
        if (!copyrightEl) {
            const all = footer.querySelectorAll('p, div, span');
            for (const el of all) {
                if (el.textContent.includes('©') || el.textContent.includes('RIGHTS') || el.className.includes('copy')) {
                    copyrightEl = el; break;
                }
            }
        }

        if (copyrightEl) {
            copyrightEl.textContent = safeText(data, 'copyright', '© 2025 LIVEGIGS ASIA. ALL RIGHTS RESERVED.');
        }

        // 社交链接
        const socialContainer = footer.querySelector('.footer-social, .social-links, .social-icons');
        if (socialContainer && data.socialLinks) {
            const links = safeArray(data, 'socialLinks');
            let html = '';
            links.forEach(function(link) {
                if (!link || !link.url) return;
                const iconKey = safeText(link, 'icon', '').toLowerCase();
                const iconHtml = icons[iconKey] || icons[iconKey.replace(/\d/g, '')] || '<span style="font-weight:bold;font-size:12px;">' + (link.title || link.icon || '?').charAt(0).toUpperCase() + '</span>';
                html += '<a href="' + link.url + '" target="_blank" title="' + safeText(link, 'title', '') + '" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;margin:0 5px;color:#c0c0c0;text-decoration:none;">' + iconHtml + '</a>';
            });
            if (html) socialContainer.innerHTML = html;
        }
    }

    async function renderEvents() {
        const data = await loadJSON('events-managed');
        if (!data || !data.events) return;

        const container = document.querySelector('.events-grid, .events-container');
        if (!container) return;

        const events = safeArray(data, 'events');
        let html = '';

        events.slice(0, 6).forEach(function(event) {
            if (!event) return;
            const onTour = event.onTour === true || event.onTour === 'true';
            const soldOut = event.soldOut === true || event.soldOut === 'true';
            let tags = '';
            if (onTour) tags += '<span class="tag on-tour">ON TOUR</span>';
            if (soldOut) tags += '<span class="tag sold-out">SOLD OUT</span>';

            html += '<div class="event-card">' +
                '<div class="event-image"><img src="' + (event.image || './image/placeholder.jpg') + '" alt="" loading="lazy">' + (tags ? '<div class="event-tags">' + tags + '</div>' : '') + '</div>' +
                '<div class="event-info">' +
                '<h3>' + (event.title || 'Untitled') + '</h3>' +
                (event.date || event.venue ? '<div>' + [event.date, event.venue, event.time].filter(Boolean).join(' | ') + '</div>' : '') +
                (event.description ? '<p>' + event.description + '</p>' : '') +
                '<a href="' + (event.link || '#') + '" target="_blank">' + (event.buttonText || 'BUY TICKETS') + '</a>' +
                '</div></div>';
        });

        if (events.length > 6) {
            html += '<div style="grid-column:1/-1;text-align:center;margin-top:20px;"><button onclick="loadMoreEvents()">LOAD MORE</button></div>';
        }

        container.innerHTML = html;
    }

    async function renderCollaborators() {
        const data = await loadJSON('collaborators');
        if (!data || !data.logos) return;

        const container = document.querySelector('.collaborators-grid, .partners-logos');
        if (!container) return;

        const logos = safeArray(data, 'logos');
        let html = '';

        logos.forEach(function(logo) {
            if (!logo || !logo.image) return;
            if (logo.link && logo.link !== '#' && logo.link !== '') {
                html += '<a href="' + logo.link + '" target="_blank"><img src="' + logo.image + '" alt="' + (logo.name || '') + '" loading="lazy"></a>';
            } else {
                html += '<div><img src="' + logo.image + '" alt="' + (logo.name || '') + '" loading="lazy"></div>';
            }
        });

        container.innerHTML = html;
    }

    async function init() {
        await Promise.all([renderFooter(), renderEvents(), renderCollaborators()]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.LiveGigsData = { refresh: init };
})();
