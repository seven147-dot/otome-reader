# Otome Reader · 乙女短篇作品库

一个纯前端静态乙女/代入感短篇阅读站。读者可以浏览作品书架、按标签筛选短篇、输入自己的“大名”和“昵称”，并在阅读页中自动替换正文占位符。第一版不包含后端、数据库、登录系统、构建工具或前端框架，可直接部署到 GitHub Pages。

## 文件结构

```text
.
├── index.html      # 网站入口，GitHub Pages 会直接访问根目录下的该文件
├── styles.css      # 移动端优先的浅蓝/浅粉玻璃拟态样式
├── app.js          # 作品渲染、标签筛选、姓名弹窗、阅读页与字体调节逻辑
├── stories.json    # 作品数据源，后续主要在这里新增或替换正文
└── README.md       # 项目说明与部署指南
```

## 如何添加新作品

在 `stories.json` 的数组中追加一个对象即可。每篇作品建议包含以下字段：

```json
{
  "id": "unique-story-id",
  "title": "作品标题",
  "maleLead": "男主名",
  "summary": "一句话简介",
  "tags": ["都市", "温柔"],
  "status": "已完结",
  "wordCount": "约 1.2k 字",
  "content": [
    "第一段正文。",
    "第二段正文。"
  ]
}
```

注意事项：

- `id` 必须唯一，建议使用英文小写、数字和连字符，例如 `rainy-night-letter`。
- `tags` 会自动汇总成首页筛选按钮；网站始终保留“全部”筛选。
- `content` 使用字符串数组，每个字符串会渲染成一个段落，方便后续维护长文。
- 男主名固定展示，不会被替换。

## 姓名占位符用法

正文中可以使用以下两个占位符：

- `{{userName}}`：替换为读者填写的“大名”，适合正式称呼。
- `{{nickName}}`：替换为读者填写的“昵称”，适合亲密称呼。

如果读者没有填写姓名，网站会使用默认 fallback：

- `{{userName}}` → `你`
- `{{nickName}}` → `宝宝`

姓名仅保存在当前浏览器的 `localStorage` 中，不上传、不联网、不收集。读者可以点击“修改名字”重新填写，也可以清除浏览器站点数据删除本地保存内容。

## 本地预览

由于 `app.js` 会读取 `stories.json`，建议使用一个简单的本地静态服务器预览：

```bash
python3 -m http.server 8000
```

然后在浏览器打开：

```text
http://localhost:8000/
```

如果直接双击打开 `index.html`，网站会使用内置示例数据作为预览兜底；但为了确认你最新编辑的 `stories.json` 内容，仍建议使用本地静态服务器。

## GitHub Pages 部署

1. 将这些文件提交并推送到 GitHub 仓库的 `main` 分支。
2. 进入仓库 `Settings → Pages`。
3. 在 `Build and deployment` 中选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/ (root)`。
5. 保存后等待 GitHub Pages 发布完成，即可访问生成的网站地址。
