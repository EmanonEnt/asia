# LiveGigs Asia v8.8.7 修复说明

## 修复内容总结

### 1. 海报2轮播文字乱码修复
**问题**: 海报2轮播首次加载显示旧文字及乱码（应该是箭头），需要二次点击才恢复

**原因**: 
- 正则表达式中包含控制字符 \u0002
- 箭头字符 → 在某些编码下显示异常

**修复**:
- 移除控制字符，使用正确的正则表达式: `/<\2>/`
- 箭头改为HTML实体: `&#8594;`
- 修复前: `w/The Noname →`
- 修复后: `w/The Noname &#8594;`

### 2. 底部版权文字乱码修复
**问题**: 版权符号 © 显示为乱码

**修复**:
- 使用HTML实体: `&#169;`
- 修复前: `Copyright ©`
- 修复后: `Copyright &#169;`

### 3. UPLOAD EVENT Modal红框和重复按钮修复
**问题**: 
- 点击UPLOAD EVENT按钮出现红框边框
- Modal内部又显示一遍UPLOAD EVENT按钮
- 二维码太小看不清文字

**修复**:
- **移除红框**: 将边框从 `border: 2px solid #8b0000` 改为 `border: none`
- **移除重复按钮**: 创建 `upload-form-embedded.html` 专门用于iframe嵌入，移除演示按钮
- **放大二维码**: 从 180x180 增加到 280x280（移动端220/200）

### 4. 文件结构
```
LiveGigs-v8.8.7-fix.zip
├── LiveGigs-Editor-v8.8.7.html    # 修复后的编辑器
├── upload-form-embedded.html       # iframe嵌入专用表单（无按钮）
└── upload-event-form.html          # 原始表单（保留参考）
```

## 使用说明

### 部署步骤
1. 解压 `LiveGigs-v8.8.7-fix.zip`
2. 将 `LiveGigs-Editor-v8.8.7.html` 上传到您的服务器
3. 将 `upload-form-embedded.html` 放在同一目录
4. 确保 `image/Wechat-QR.png` 存在

### 生成events.html
1. 打开 `LiveGigs-Editor-v8.8.7.html`
2. 编辑活动数据
3. 点击 "📄 生成 events.html"
4. 上传生成的 `events.html` 到您的网站

### 测试要点
1. **海报2轮播**: 刷新页面，检查是否直接显示正确文字和箭头
2. **版权文字**: 检查底部版权符号是否正常显示
3. **UPLOAD EVENT**: 点击按钮，检查：
   - 没有红色边框
   - 不显示重复按钮
   - 二维码清晰可扫描

## 技术细节

### 关键代码变更

#### 海报2正则表达式修复
```javascript
// 修复前（有控制字符）
const linkText = firstPoster.linkText || 'w/The Noname →';
result = result.replace(
    /(<(span|a)[^>]*class="poster-link" id="poster2Link"[^>]*>)[^<]*(<\/>)/,
    '$1' + escapeHtml(linkText) + '$3'
);

// 修复后
const linkText = firstPoster.linkText || 'w/The Noname &#8594;';
result = result.replace(
    /(<(span|a)[^>]*class="poster-link" id="poster2Link"[^>]*>)[^<]*(<\/\2>)/,
    '$1' + escapeHtml(linkText) + '$2'
);
```

#### Modal CSS修复
```css
/* 修复前 */
#uploadModal > div { border: 2px solid #8b0000; }

/* 修复后 */
#uploadModal > div { border: none !important; box-shadow: 0 0 40px rgba(0,0,0,0.9) !important; }
```

#### 二维码尺寸修复
```css
/* 修复前 */
.qr-code { width: 180px; height: 180px; }

/* 修复后 */
.qr-code { width: 280px; height: 280px; }
@media (max-width: 768px) { .qr-code { width: 220px; height: 220px; } }
@media (max-width: 480px) { .qr-code { width: 200px; height: 200px; } }
```

## 版本历史
- v8.8.7: 修复乱码、红框、二维码尺寸问题
- v8.8.6: 修复iframe弹窗和海报图片问题
- v8.8.5: 初始iframe版本

## 注意事项
- 确保所有文件使用UTF-8编码保存
- 建议使用现代浏览器（Chrome, Firefox, Safari, Edge）
- 移动端测试时请使用真实设备或设备模拟器
