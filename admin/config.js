// LiveGigs Asia 后台管理系统配置
const ADMIN_CONFIG = {
    version: '3.0.0',

    // GitHub 配置
    github: {
        owner: 'EmanonEnt',
        repo: 'asia',
        branch: 'main',
        contentPath: 'content'
    },

    // 登录配置
    auth: {
        defaultUsername: 'admin',
        defaultPassword: 'livegigs2026',
        sessionTimeout: 30 * 60 * 1000  // 30分钟无操作
    },

    // 存储键名
    storageKeys: {
        session: 'lg_admin_session',
        lastActivity: 'lg_admin_last_activity',
        banners: 'lg_banners',
        posters_index: 'lg_posters_index',
        posters_cn: 'lg_posters_cn',
        posters_events: 'lg_posters_events',
        events: 'lg_events',
        carousel: 'lg_carousel',
        collaborators: 'lg_collaborators',
        footer_global: 'lg_footer_global',
        footer_cn: 'lg_footer_cn',
        githubToken: 'github_token'
    },

    // 活动配置
    events: {
        minEventsForLoadMore: 4,  // 大于等于4个显示Load More
        maxCarouselItems: 5,      // 轮播最多5个
        minCarouselItems: 1       // 轮播至少1个
    },

    // 尺寸配置
    sizes: {
        banner: '1920x1080px (16:9)',
        poster: '400x600px (2:3)',
        partnersBanner: '1920x800px',
        collaboratorsLogo: '180x110px'
    }
};