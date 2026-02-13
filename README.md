# LiveGigs Asia 后台管理系统

## 文件结构

```
asia/
├── admin/
│   └── index.html          # 后台管理界面
├── content/                # JSON数据文件
│   ├── banners.json        # Banner数据 (index+cn同步)
│   ├── index-posters.json  # Index页面海报
│   ├── cn-posters.json     # CN页面海报
│   ├── events-posters.json # Events页面海报 (海报2可滚播)
│   ├── events-managed.json # 自主活动
│   ├── events-carousel.json # 滚播活动
│   ├── footer-global.json  # 海外站底部
│   ├── footer-cn.json      # 国内站底部
│   ├── partners-banners.json # 合作伙伴Banner
│   └── collaborators.json  # 合作Logo
└── js/
    └── livegigs-data.js    # 前端数据加载脚本
```

## 使用说明

### 1. 部署到GitHub

将以下文件上传到GitHub仓库 `EmanonEnt/asia`：

1. `admin/index.html` → 上传到 `asia/admin/index.html`
2. `content/` 文件夹内所有JSON → 上传到 `asia/content/`
3. `js/livegigs-data.js` → 上传到 `asia/js/livegigs-data.js`

### 2. 前端页面修改

在每个HTML页面（index.html, cn.html, events.html, partners.html, privacypolicy.html, accessibilitystatement.html）的 `</body>` 标签前添加：

```html
<script src="./js/livegigs-data.js"></script>
```

### 3. 登录后台

访问 `https://livegigsasia.com/admin/`

- 用户名: `admin`
- 密码: `00123456a`
- GitHub Token: 输入您的GitHub Personal Access Token（用于自动同步）

### 4. 后台功能

#### 7大管理模块：

1. **Banner管理** (Index + CN同步)
   - 最多5个Banner
   - 尺寸: 1920×1080px
   - 可设置标题、按钮文字、链接、图片

2. **海报管理**
   - Index页面: 3个海报
   - CN页面: 3个海报
   - Events页面: 海报2可设置滚播模式（最多5个）
   - 尺寸: 400×600px

3. **自主活动管理**
   - 最多9个活动
   - >3个时显示Load More按钮
   - 尺寸: 400×600px
   - 支持: 标题、日期、地点、时间、门票、状态(SOLD OUT/ON TOUR)、按钮、链接

4. **滚播活动管理**
   - 最少3个，最多12个
   - 尺寸: 1920×1080px
   - 自动轮播

5. **底部区域管理**
   - 海外站: Index/Events/Partners/Privacy/Accessibility共用
   - 国内站: CN页面独立
   - 支持: 站点名称、副标、联系文字、邮箱、地址、版权、制作单位Logo、社交媒体(最多10个)

6. **合作伙伴管理**
   - 合作Banner: 最多9个 (1920×800px)
   - 合作Logo: 最多9个 (180×110px)，>6个自动换行居中

### 5. 同步机制

- **区域同步**: 点击每个区域右上角的"同步此区域"按钮
- **全站同步**: 点击顶部"全站同步"按钮
- **自动同步**: 需要配置GitHub Token

### 6. 字段留空规则

- **文字字段留空**: 前端不显示该元素
- **链接字段留空**: 前端显示但不可点击（按钮变灰）
- **图片字段留空**: 使用默认图片或隐藏

### 7. 安全机制

- **30分钟无操作自动退出**: 有任何操作时重新计时
- **关闭浏览器**: 3分钟内重新打开保持登录，超过需重新登录
- **GitHub Token**: 可选，用于自动同步到GitHub

### 8. 数据备份

点击"下载备份"按钮可下载所有数据的JSON文件。

## 尺寸标准

| 区域 | 尺寸 | 格式 |
|------|------|------|
| Banner | 1920×1080px | 16:9 |
| 海报 | 400×600px | 2:3 |
| 活动海报 | 400×600px | 2:3 |
| 滚播海报 | 1920×1080px | 16:9 |
| Partners Banner | 1920×800px | - |
| Collaborators Logo | 180×110px | - |

## 技术支持

如有问题，请联系: xrebooking@hotmail.com
