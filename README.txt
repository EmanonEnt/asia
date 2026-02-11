# LiveGigs Asia - 自动同步后台（带密码保护）

## 🔐 密码
00123456a

## 📁 文件结构
asia/
├── admin/
│   └── index.html          ← 带密码保护的后台（替换原有文件）
├── js/
│   └── data-loader.js      ← 前端数据加载脚本
└── content/                ← JSON数据文件
    ├── banners.json
    ├── index-posters.json
    ├── cn-posters.json
    ├── events-posters.json
    ├── events-managed.json
    ├── partners-banners.json
    ├── collaborators.json
    └── footer.json

## 🚀 部署步骤

### 1. 上传文件到 GitHub
- admin/index.html （替换原来的后台）
- js/data-loader.js （新建文件夹和文件）
- content/ （新建文件夹，上传8个JSON文件）

### 2. 修改6个页面
在每个页面（index.html, cn.html, events.html, partners.html, privacypolicy.html, accessibilitystatement.html）的 </body> 前添加：
<script src="./js/data-loader.js"></script>

### 3. 使用后台
1. 打开 https://www.livegigsasia.com/admin/
2. 输入密码：00123456a
3. 输入 GitHub Token
4. 点击"测试连接"
5. 开始编辑内容，保存后自动同步

## ✅ 功能
- 密码保护（00123456a）
- GitHub Token 临时保存
- 自动同步到 GitHub
- 实时显示同步状态
- 退出登录功能
