# LiveGigs Asia 后台管理系统 - 使用说明

## 📁 文件结构

```
asia/
├── admin/
│   └── index.html          # 后台管理界面
├── js/
│   └── livegigs-data.js    # 前端数据加载脚本
├── content/                # JSON数据文件
│   ├── banners.json
│   ├── index-posters.json
│   ├── cn-posters.json
│   ├── events-posters.json
│   ├── events-managed.json
│   ├── events-carousel.json
│   ├── footer-global.json
│   ├── footer-cn.json
│   ├── partners-banners.json
│   └── collaborators.json
└── [前端HTML页面]
```

## 🚀 安装步骤

### 1. 上传文件到GitHub

将以下文件上传到您的GitHub仓库 `EmanonEnt/asia`：

- `admin/index.html` → 放到 `asia/admin/` 文件夹
- `js/livegigs-data.js` → 放到 `asia/js/` 文件夹
- `content/*.json` → 放到 `asia/content/` 文件夹

### 2. 确保前端页面已添加数据加载

每个前端HTML页面（index.html, cn.html, events.html等）需要在 `</body>` 前添加：

```html
<script src="./js/livegigs-data.js"></script>
<script>
  // 根据页面类型加载对应数据
  if (document.querySelector('[data-page="index"]')) {
    LiveGigsData.loadAndRender('index');
  } else if (document.querySelector('[data-page="cn"]')) {
    LiveGigsData.loadAndRender('cn');
  } else if (document.querySelector('[data-page="events"]')) {
    LiveGigsData.loadAndRender('events');
  } else if (document.querySelector('[data-page="partners"]')) {
    LiveGigsData.loadAndRender('partners');
  }
</script>
```

并在 `<body>` 标签添加 `data-page` 属性：

```html
<body data-page="index">  <!-- index, cn, events, partners, privacy, accessibility -->
```

### 3. 访问后台

打开 `https://yourdomain.com/admin/` 或 `https://emanonent.github.io/asia/admin/`

**登录信息：**
- 用户名: `admin`
- 密码: `00123456a`
- GitHub Token: 可选，用于自动同步到GitHub

## 📋 功能模块

### 1. Banner管理 (Index + CN 同步)
- 最多5个Banner
- 尺寸: 1920×1080px
- Index和CN页面同步显示

### 2. 海报管理
- **Index页面**: 3个海报
- **CN页面**: 3个海报  
- **Events页面**: 海报2支持1-5个滚播
- 尺寸: 400×600px

### 3. 自主活动
- 最多9个活动
- ≤3个时不显示Load More按钮
- 支持: 标题/日期/地点/时间/门票/状态/按钮/链接

### 4. 滚播活动
- 最少3个，最多12个
- 尺寸: 1920×1080px

### 5. 底部管理

#### 海外站 (Global)
- 适用页面: index, events, partners, privacy, accessibility
- 字段映射:
  - 站点名称 → LIVEGIGS文字
  - 站点副标 → ASIA红色文字
  - 联系文字 → 联系说明文字
  - 邮箱地址 → 可点击发信链接
  - 地址 → 右侧地址
  - 版权文字 → 底部版权
  - 制作单位Logo → EMANON logo
  - 社交媒体: Facebook, Instagram, YouTube, X等

#### 国内站 (CN)
- 适用页面: cn.html
- 字段映射同上，副标为CN
- 社交媒体: 微信, 微博, 小红书, 小程序等

### 6. 合作伙伴
- **合作Banner**: 最多9个，1920×800px
- **合作Logo**: 最多9个，180×110px，>6个自动换行

## ⚙️ 字段规则

### 留空处理
| 字段类型 | 留空效果 |
|---------|---------|
| 文字字段 | 前端不显示该元素 |
| 链接字段 | 显示但不可点击 |
| 图片字段 | 使用默认图片或不显示 |

### 社交媒体图标

#### 海外站预设图标
- facebook, instagram, youtube, x, twitter
- tiktok, linkedin, spotify, apple, soundcloud, bandcamp

#### 国内站预设图标
- wechat, weibo, xiaohongshu, miniprogram
- douyin, bilibili, qq, zhihu, netease, qqmusic

#### 自定义图标
在"图标类型/自定义"字段输入任意名称，前端会显示默认图标。

## 🔄 同步功能

### 区域同步
每个区域右上角有"同步此区域"按钮，只更新当前区域的数据文件。

### 全站同步
顶部导航栏有"全站同步"按钮，更新所有10个JSON文件。

### GitHub Token设置
1. 登录GitHub → Settings → Developer settings → Personal access tokens
2. 生成新Token，勾选 `repo` 权限
3. 在后台登录时填入Token，或登录后在页面刷新后点击设置

## 🔒 安全设置

- **自动退出**: 30分钟无操作自动退出
- **关闭浏览器**: 关闭后需要重新登录
- **Token存储**: 保存在浏览器localStorage，建议个人设备使用

## 🐛 故障排除

### 前台不更新
1. 检查GitHub Pages是否已部署（需要1-2分钟）
2. 强制刷新浏览器缓存: Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)
3. 检查浏览器控制台是否有CORS错误

### 底部区域不显示
1. 检查前端HTML是否有对应的class或ID
2. 确认footer-global.json或footer-cn.json已上传到正确位置
3. 检查livegigs-data.js是否正确加载

### 社交媒体图标不显示
1. 检查是否启用了该社交媒体
2. 确认图标类型选择正确
3. 检查链接是否留空（留空会显示但不可点击）

## 📞 技术支持

如有问题，请联系: xrebooking@hotmail.com

---

**版本**: 2026.02.13  
**制作**: EMANON ENT
