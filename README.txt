LiveGigs Asia 后台系统 V3.1 - 自动同步版本

文件结构:
├── admin/
│   ├── config.js          # 配置文件
│   ├── data-loader.js     # 后台数据管理
│   ├── login.html         # 登录页面
│   └── index.html         # 后台主页面
├── livegigs-data.js       # 前端数据加载器（放在网站根目录）
└── README.txt             # 本文件

部署步骤:

1. 上传后台文件:
   - 将 admin/ 文件夹上传到 asia/admin/
   - 将 livegigs-data.js 上传到 asia/ 根目录

2. 修改前端页面 (index.html, events.html, partners.html, cn.html):

   在 </body> 前添加:
   <script src="livegigs-data.js"></script>

   然后使用以下方式获取数据:

   // 获取Banners
   const banners = await LiveGigsData.getBanners();

   // 获取海报 (index/cn/events)
   const posters = await LiveGigsData.getPosters('index');

   // 获取轮播 (仅events页面)
   const carousel = await LiveGigsData.getCarousel();

   // 获取活动
   const events = await LiveGigsData.getEvents();

   // 获取合作伙伴
   const collaborators = await LiveGigsData.getCollaborators();

   // 获取底部 (global/cn)
   const footer = await LiveGigsData.getFooter('global');

3. 首次使用:
   - 访问 /admin/login.html
   - 用户名: admin
   - 密码: livegigs2026
   - 输入GitHub Token (用于保存数据到GitHub)

4. 工作流程:
   - 后台: 更新数据 → 点击保存 → 自动保存到GitHub
   - 前台: 刷新页面 → 自动从GitHub获取最新数据

数据流向:
后台编辑 → GitHub存储 → 前台刷新时获取

注意:
- GitHub Pages有缓存，数据更新后可能需要1-2分钟生效
- 前台每次刷新都会获取最新数据
- 后台保存后会立即更新GitHub
