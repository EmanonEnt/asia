# LiveGigs Asia 后台管理系统

## 文件结构
```
asia/
├── admin/
│   └── index.html          # 后台管理界面 (用户名: admin, 密码: 00123456a)
├── js/
│   └── livegigs-data.js    # 前端数据加载脚本
├── content/                 # JSON数据文件
│   ├── banners.json        # Banner数据 (index+cn同步)
│   ├── posters-index.json  # 首页海报
│   ├── posters-cn.json     # 国内站海报  
│   ├── posters-events.json # 活动页海报
│   ├── events-managed.json # 自主活动
│   ├── carousel.json       # 滚播活动
│   ├── partners-banners.json # 合作伙伴Banner
│   ├── collaborators.json  # 合作Logo
│   ├── footer-global.json  # 海外站底部
│   └── footer-cn.json      # 国内站底部
└── index.html              # 前端页面 (已有)
```

## 快速开始

### 1. 上传文件到GitHub
将以下文件上传到您的GitHub仓库 `EmanonEnt/asia`：
- `admin/index.html` → 放在 `asia/admin/` 文件夹
- `js/livegigs-data.js` → 放在 `asia/js/` 文件夹  
- `content/*.json` → 放在 `asia/content/` 文件夹

### 2. 访问后台
- 网址: `https://livegigsasia.com/admin/`
- 用户名: `admin`
- 密码: `00123456a`

### 3. GitHub Token设置 (用于同步)
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成后复制Token
5. 在后台登录界面或点击"同步到GitHub"时输入Token

## 功能模块

### 1. Banner管理 (index + cn 同步)
- 最多5个Banner
- 尺寸: 1920×1080px (16:9)
- 支持标题、按钮文字、链接地址
- 可服务器地址或网络地址

### 2. 自主Events活动
- 最少1个，最多9个活动
- 尺寸: 400×600px (2:3)
- 支持: 海报、标题、日期、地点、时间、门票、状态(ontour/soldout)、详情、按钮
- ≤3个活动时不显示Load More按钮
- 
### 3. 滚播推荐活动
- 最少3个，最多12个
- 尺寸: 1920×1080px (16:9)
- 循环自动播放
- 支持标题、时间、地点、详情、链接

### 4. 合作伙伴管理
- **Banner区域**: 最多9个，1920×800px
  - 主海报、Logo图、标题、详情、按钮、链接
- **Logo区域**: 最多9个，180×110px
  - Logo图、名称、链接
  - >6个自动换行居中

### 5. 底部区域管理
- **海外站** (index/events/partners/privacy/accessibility): 统一更新
- **国内站** (cn): 独立更新
- 支持: 标题、联系文字、地址、版权、制作单位Logo
- 社交媒体图标: 最多10个
  - 支持: facebook, instagram, youtube, x, weibo, xiaohongshu, wechat, miniprogram
  - 可自定义添加其他类型

## 同步机制

### 自动同步
1. 在后台修改数据
2. 点击"同步到GitHub"按钮
3. 数据自动推送到GitHub仓库
4. GitHub Pages自动部署 (1-2分钟)
5. 前端自动显示最新数据

### 数据格式
所有数据以JSON格式存储在 `content/` 文件夹，前端通过 `livegigs-data.js` 自动加载。

## 安全设置

- **30分钟无操作自动退出**: 检测到30分钟无鼠标/键盘操作自动退出登录
- **关闭浏览器保护**: 关闭浏览器3分钟内重新打开需要重新登录
- **GitHub Token**: 仅保存在浏览器本地，不会上传到服务器

## 注意事项

1. **图片地址**: 可以是相对路径 (如 `./image/banner.jpg`) 或完整URL (如 `https://...`)
2. **留空字段**: 所有字段均可留空，留空时前端不显示该元素
3. **排序**: Banner使用排序数字控制显示顺序 (1-5)
4. **响应式**: 所有配置自动适配手机、平板、桌面端

## 故障排除

### 同步失败
- 检查GitHub Token是否正确
- 检查Token是否有repo权限
- 检查网络连接

### 前端不更新
- GitHub Pages有缓存，等待1-2分钟
- 强制刷新: Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)
- 检查浏览器控制台是否有CORS错误

### 数据丢失
- 定期使用"下载所有数据"功能备份
- 备份文件包含所有配置数据
