// LiveGigs Asia 后台管理系统配置
const ADMIN_CONFIG = {
    // 版本号
    version: '2.0.0',
    
    // GitHub 配置 - 用于自动加载数据
    github: {
        // GitHub 用户名/组织名
        owner: 'EmanonEnt',
        // 仓库名
        repo: 'asia',
        // 分支名
        branch: 'main',
        // 内容文件路径
        contentPath: 'content',
        // Token（可选，用于私有仓库或更高API限制）
        token: localStorage.getItem('github_token') || ''
    },
    
    // 登录配置
    auth: {
        // 默认管理员账号（生产环境应使用更安全的方式）
        defaultUsername: 'admin',
        defaultPassword: 'livegigs2026',
        // 会话超时时间（毫秒）- 30分钟
        sessionTimeout: 30 * 60 * 1000,
        // 是否记住登录状态
        rememberMe: true
    },
    
    // 数据存储键名
    storageKeys: {
        // 登录会话
        session: 'lg_admin_session',
        sessionTime: 'lg_admin_session_time',
        // 数据缓存
        banners: 'lg_banners',
        posters: 'lg_posters',
        events: 'lg_events',
        collaborators: 'lg_collaborators',
        footerGlobal: 'lg_footer_global',
        footerCN: 'lg_footer_cn',
        // GitHub Token
        githubToken: 'github_token'
    },
    
    // 页面配置
    pages: {
        // 首页
        index: {
            name: '首页',
            file: 'index.json',
            sections: ['banners', 'posters', 'collaborators', 'footer']
        },
        // 国内站
        cn: {
            name: '国内站',
            file: 'cn.json',
            sections: ['banners', 'posters', 'collaborators', 'footer']
        },
        // 活动页
        events: {
            name: '活动页',
            file: 'events.json',
            sections: ['posters', 'events', 'footer']
        },
        // 关于页
        about: {
            name: '关于页',
            file: 'about.json',
            sections: ['content', 'footer']
        }
    },
    
    // 活动显示配置
    events: {
        // 显示Load More按钮的最小活动数量
        minEventsForLoadMore: 4,
        // 每页显示数量
        itemsPerPage: 6
    },
    
    // 图片配置
    images: {
        // 支持的图片格式
        formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        // 本地图片路径前缀
        localPrefix: './image/',
        // 外部图片协议
        externalProtocols: ['https://', 'http://']
    },
    
    // 默认数据
    defaults: {
        banners: [
            {
                title: "THE NONAME ANTI-MUSIC FESTIVAL",
                image: "./image/thenonameanti-.jpg",
                button_text: "View Details →",
                link: "./events.html",
                order: 1,
                active: true
            },
            {
                title: "PUNK HEART FESTIVAL",
                image: "./image/punkheartbanner.jpg",
                button_text: "Get Tickets →",
                link: "./events.html",
                order: 2,
                active: true
            }
        ],
        posters: {
            index: [
                { title: "Event 1", image: "./image/1-b-2.jpg", link_text: "View Details →", link: "./events.html", carousel: false },
                { title: "Event 2", image: "./image/1-b-3.jpg", link_text: "View Details →", link: "./events.html", carousel: false },
                { title: "Event 3", image: "./image/livegigscn1.png", link_text: "View Details →", link: "./events.html", carousel: false }
            ],
            cn: [
                { title: "活动 1", image: "./image/cn-asiaad.jpg", link_text: "查看详情 →", link: "./events.html", carousel: false },
                { title: "活动 2", image: "./image/1-b-2.jpg", link_text: "查看详情 →", link: "./events.html", carousel: true },
                { title: "活动 3", image: "./image/1-b-3.jpg", link_text: "查看详情 →", link: "./events.html", carousel: false }
            ],
            events: [
                { title: "Past Gig 1", image: "./image/1-b-2.jpg", link_text: "View Details →", link: "./events.html", carousel: false },
                { title: "Past Gig 2", image: "./image/1-b-3.jpg", link_text: "View Details →", link: "./events.html", carousel: false },
                { title: "Past Gig 3", image: "./image/livegigscn1.png", link_text: "View Details →", link: "./events.html", carousel: false }
            ]
        },
        events: [],
        collaborators: [],
        footerGlobal: {
            copyright: "© 2026 LIVEGIGS ASIA. ALL RIGHTS RESERVED.",
            social: [
                {name: "Facebook", url: "https://facebook.com/livegigsasia", icon: "facebook"},
                {name: "Instagram", url: "https://instagram.com/livegigsasia", icon: "instagram"},
                {name: "YouTube", url: "https://youtube.com/livegigsasia", icon: "youtube"},
                {name: "X", url: "https://x.com/livegigsasia", icon: "x"}
            ],
            producer: "./image/emanonent-logo.png"
        },
        footerCN: {
            copyright: "© 2026 LIVEGIGS ASIA. 版权所有.",
            social: [
                {name: "微博", url: "https://weibo.com/livegigsasia", icon: "weibo"},
                {name: "微信", url: "#", icon: "wechat"},
                {name: "抖音", url: "https://douyin.com/livegigsasia", icon: "douyin"},
                {name: "B站", url: "https://bilibili.com/livegigsasia", icon: "bilibili"}
            ],
            producer: "./image/emanonent-logo.png"
        }
    }
};

// 导出配置（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADMIN_CONFIG;
}
