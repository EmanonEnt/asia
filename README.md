# LiveGigs Asia 后台管理系统 v2.0

## 系统特性

### 1. 登录与会话管理
- 默认账号: `admin` / `livegigs2026`
- 会话保持30分钟或关闭浏览器自动退出
- 支持 GitHub Token 配置（用于自动同步数据）

### 2. 数据管理功能
- **Banner 管理**: 添加/编辑/删除首页轮播图
- **海报区域管理**: 管理首页/国内站/活动页的海报
- **活动管理**: 添加/编辑/删除活动信息
- **合作伙伴管理**: 管理合作方 Logo
- **底部管理**: 配置页脚版权和社交链接

### 3. 智能功能
- **Load More 按钮控制**: 活动数量 ≤ 3 时自动隐藏
- **空字段自动隐藏**: 前端不显示空值字段
- **图片/链接验证**: 支持本地路径和外部 HTTPS 链接
- **数据过滤**: 自动过滤空值字段

### 4. GitHub 同步
- 启动时自动从 GitHub 加载数据
- 支持手动同步
- 数据本地缓存

## 文件结构

```
admin-system/
├── admin/
│   ├── login.html      # 登录页面
│   ├── index.html      # 后台管理主页面
│   └── config.js       # 配置文件
├── content/
│   ├── index.json      # 首页数据
│   ├── cn.json         # 国内站数据
│   ├── events.json     # 活动页数据
│   └── about.json      # 关于页数据
├── js/
│   └── data-loader.js  # 数据加载器
└── README.md           # 使用说明
```

## 使用方法

### 1. 部署到网站
将 `admin-system` 文件夹上传到网站根目录

### 2. 访问后台
打开 `https://your-domain.com/admin-system/admin/login.html`

### 3. 登录
- 用户名: `admin`
- 密码: `livegigs2026`

### 4. 配置 GitHub Token（可选）
在登录页面输入 GitHub Token，用于自动同步数据

### 5. 数据同步
- 后台会自动从 GitHub 加载数据
- 也可以手动点击"立即同步"按钮

## 配置说明

### 修改默认账号密码
编辑 `admin/config.js`:
```javascript
auth: {
    defaultUsername: '你的用户名',
    defaultPassword: '你的密码',
    sessionTimeout: 30 * 60 * 1000,  // 30分钟
}
```

### 配置 GitHub 仓库
编辑 `admin/config.js`:
```javascript
github: {
    owner: '你的GitHub用户名',
    repo: '你的仓库名',
    branch: 'main',
    contentPath: 'content'
}
```

### 修改 Load More 阈值
编辑 `admin/config.js`:
```javascript
events: {
    minEventsForLoadMore: 4,  // 活动数量≥4时显示Load More按钮
    itemsPerPage: 6
}
```

## 数据格式

### Banner 数据
```json
{
  "title": "标题",
  "image": "./image/banner.jpg 或 https://...",
  "button_text": "按钮文字",
  "link": "./events.html 或 https://...",
  "order": 1,
  "active": true
}
```

### 活动数据
```json
{
  "title": "活动标题",
  "date": "2026.03.15",
  "location": "演出地点",
  "time": "20:00",
  "image": "./image/event.jpg 或 https://...",
  "ticket": "$50",
  "status": "ontour 或 soldout",
  "description": "活动描述",
  "button_text": "Get Tickets →",
  "link": "购票链接"
}
```

### 海报数据
```json
{
  "title": "海报标题",
  "image": "./image/poster.jpg 或 https://...",
  "link_text": "View Details →",
  "link": "./events.html 或 https://...",
  "carousel": false
}
```

## 注意事项

1. **图片地址**: 支持本地路径 (`./image/xxx.jpg`) 和外部链接 (`https://...`)
2. **链接地址**: 同样支持本地页面和外部链接
3. **数据备份**: 定期导出 JSON 数据备份
4. **会话安全**: 30分钟无操作自动退出

## 更新日志

### v2.0
- 新增 GitHub 自动同步功能
- 新增 Load More 智能控制
- 新增空字段自动隐藏
- 新增 HTTPS 链接支持
- 优化登录会话管理
- 优化数据验证和过滤

## 技术支持

如有问题，请联系开发团队。
