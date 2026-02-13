# LiveGigs Asia 后台管理系统

## 文件结构
```
asia/
├── js/
│   └── livegigs-data.js          # 前端数据加载脚本（修复版）
├── admin/
│   └── index.html                # 后台管理界面
├── content/                      # JSON数据文件
│   ├── banners.json              # Banner数据（index+cn同步）
│   ├── index-posters.json        # 首页海报
│   ├── cn-posters.json           # CN页面海报（独立）
│   ├── events-posters.json       # Events页面海报
│   ├── footer-global.json        # 海外站底部（统一）
│   └── footer-cn.json            # 国内站底部（独立）
└── [原有页面文件]
```

## 关键修复

### 1. CN页面底部错乱问题
**原因**：CN页面错误加载了`footer-global.json`，导致显示"ASIA"和海外社交媒体
**修复**：`livegigs-data.js`现在正确检测页面类型，CN页面自动加载`footer-cn.json`

### 2. 海报区域错乱问题
**原因**：所有页面共用同一个posters.json，数据互相覆盖
**修复**：分离为三个独立文件：
- `index-posters.json` - 首页专用
- `cn-posters.json` - CN页面专用  
- `events-posters.json` - Events页面专用

### 3. 数据加载逻辑优化
- Index页面：banners + index-posters + footer-global
- CN页面：banners + cn-posters + footer-cn（独立）
- Events页面：events-posters + footer-global
- Partners/Privacy/Accessibility：footer-global

## 使用说明

### 1. 上传文件到GitHub
将ZIP内所有文件上传到GitHub仓库的`asia`文件夹：
- `js/livegigs-data.js` → 覆盖原有文件
- `admin/index.html` → 新建admin文件夹并上传
- `content/*.json` → 新建content文件夹并上传所有JSON

### 2. 访问后台
打开 `https://livegigsasia.com/admin/`
- 用户名：admin
- 密码：00123456a

### 3. 编辑内容
- **Banner管理**：编辑Index和CN共用的轮播图（最多5个）
- **海报管理**：
  - Index页面：3个独立海报
  - CN页面：3个独立海报（与Index分开配置）
  - Events页面：海报2支持1-5个轮播图
- **底部管理**：
  - 海外站底部：Index/Events/Partners/Privacy/Accessibility共用
  - 国内站底部：CN页面独立（显示"CN"标识和中国社交媒体）

### 4. 同步更新
1. 在后台编辑内容后，点击"同步到GitHub"
2. 下载生成的JSON文件
3. 上传到GitHub的`content/`文件夹并Commit
4. 等待1-2分钟，GitHub Pages自动部署
5. 刷新前端页面查看更新（按Ctrl+F5强制刷新）

## 注意事项

1. **CN页面独立配置**：CN页面的底部和海报现在完全独立，修改不会影响其他页面
2. **社交媒体**：
   - 海外站：Facebook, Instagram, YouTube, X
   - 国内站：微博, 微信, 小红书, 小程序, YouTube, Instagram
3. **链接留空**：社交媒体链接留空时，图标显示但不可点击
4. **自动退出**：后台30分钟无操作自动退出，关闭浏览器后3分钟内重新打开保持登录

## 故障排除

**问题**：CN页面底部仍显示错误
**解决**：
1. 确认上传了`footer-cn.json`
2. 确认`js/livegigs-data.js`已更新为修复版
3. 清除浏览器缓存（Ctrl+F5）

**问题**：后台更新后前端不更新
**解决**：
1. 确认JSON文件已上传到GitHub
2. 等待1-2分钟让GitHub Pages重新部署
3. 检查浏览器控制台是否有CORS错误
