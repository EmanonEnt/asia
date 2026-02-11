# LiveGigs Asia - 自动同步后台部署说明

## 📁 文件结构

```
asia/
├── admin/
│   └── index.html          ← 后台管理界面（自动同步版）
├── js/
│   └── data-loader.js      ← 前端数据加载脚本
├── content/                ← JSON数据文件（后台自动创建）
│   ├── banners.json
│   ├── index-posters.json
│   ├── cn-posters.json
│   ├── events-posters.json
│   ├── events-managed.json
│   ├── partners-banners.json
│   ├── collaborators.json
│   └── footer.json
└── 你的页面文件 (index.html, cn.html, events.html, partners.html, privacypolicy.html, accessibilitystatement.html)
```

## 🚀 部署步骤

### 1. 上传文件到 GitHub
- 把 `admin/index.html` 上传到 `asia/admin/`
- 把 `js/data-loader.js` 上传到 `asia/js/`
- 把 `content/` 里的8个JSON文件上传到 `asia/content/`

### 2. 修改6个页面文件
在每个页面的 `</body>` 标签**前面一行**添加：
```html
<script src="./js/data-loader.js"></script>
```

页面列表：
- index.html
- cn.html
- events.html
- partners.html
- privacypolicy.html
- accessibilitystatement.html

### 3. 配置 GitHub Token
1. 打开 `https://www.livegigsasia.com/admin/`
2. 输入 GitHub Personal Access Token
3. 点击"测试连接"
4. 开始编辑并保存

## ✅ 使用流程

1. 打开后台 → 输入 Token → 测试连接
2. 编辑内容（Banner/海报/活动/合作伙伴/底部）
3. 点击"💾 保存并同步"
4. 等待2-3秒显示"同步成功"
5. 刷新前台页面，立即看到更新！

## 🔐 安全提示

- Token 只保存在浏览器 sessionStorage，关闭页面后失效
- 所有数据通过 GitHub API 直接提交到你的仓库
- 不会发送到任何第三方服务器
