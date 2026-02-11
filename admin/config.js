// LiveGigs Asia 后台管理系统配置
const ADMIN_CONFIG = {
    version: '3.1.0',

    // GitHub 配置
    github: {
        owner: 'EmanonEnt',
        repo: 'asia',
        branch: 'main',
        contentPath: 'content',
        autoSync: true
    },

    // 登录配置
    auth: {
        defaultUsername: 'admin',
        defaultPassword: 'livegigs2026',
        sessionTimeout: 30 * 60 * 1000
    },

    // 存储键名
    storageKeys: {
        session: 'lg_admin_session',
        lastActivity: 'lg_admin_last_activity',
        banners: 'lg_banners',
        posters: 'lg_posters',
        events: 'lg_events',
        collaborators: 'lg_collaborators',
        footerGlobal: 'lg_footer_global',
        footerCN: 'lg_footer_cn',
        githubToken: 'github_token',
        dataVersion: 'lg_data_version'
    },

    events: {
        minEventsForLoadMore: 4,
        maxCarouselItems: 5,
        minCarouselItems: 1
    }
};
