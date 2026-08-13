# 多模态智能通信与感知官方网站

本项目是南京邮电大学计算机学院“多模态智能通信与感知”的静态官方网站，用于展示课题组介绍、导师信息、研究方向、学术成果、本科生科研招新与联系方式。

当前版本中的未确认信息统一使用“待补充”，不代表真实的课题组资料。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript
- GitHub Pages

项目没有后端、数据库、前端框架或 npm 依赖。访问根目录的 `index.html` 显示中文首页，英文版位于 `en/index.html`，两者通过顶部语言切换链接互相访问。

## 目录结构

```text
.
├── index.html                 # 网站首页
├── en/                         # 英文版页面
├── platform.html              # 多模态感知平台详情页
├── results.html               # 代表性研究成果详情页
├── join.html                  # 本科生科研招新与状态说明
├── team.html                  # 团队成员完整名单
├── research-*.html            # 三个研究方向详情页
├── css/
│   └── style.css              # 全部样式与响应式规则
├── js/
│   └── main.js                # 移动导航、导航高亮、设备画廊、平台进入动画与年份
├── assets/
│   └── images/                # 图片、平台设备图与占位图
├── AGENTS.md                  # 后续 Coding Agent 维护规则
├── README.md                  # 项目说明
└── .nojekyll                  # GitHub Pages 静态文件标记
```

## 如何修改内容

首页文字主要在 `index.html` 中，平台、成果、招新和研究方向详情页分别在对应 HTML 文件中。首页按“课题组概览 → About → 负责人 → 研究方向 → 实验平台摘要 → 团队 → 成果 → 合作伙伴 → 招新 → 联系方式”的顺序组织。`platform.html` 与 `en/platform.html` 使用 `assets/images/platform/` 中从设备介绍 PPT 提取的图片资源。搜索“待补充”可以快速定位尚未完善的内容。修改文字后保存文件并刷新浏览器即可查看结果。

普通子页面在 Hero 下方提供 `subpage-index` 页内索引，并在页末通过 `page-end-navigation` 连接相关页面。新增或重排子页面章节时，应同步维护这两处导航和章节 `id`。

颜色、间距和字体统一定义在 `css/style.css` 顶部的 `:root` CSS Variables 中。除非需要调整整体视觉，不建议逐处修改颜色。

## 如何添加研究方向

在 `index.html` 中找到 `class="research-features"` 的区域。复制一个完整的 `a class="research-feature"`，然后依次修改，并同步更新对应研究方向详情页和英文页面：

- `Research Direction` 编号
- 方向名称
- 简介
- 负责人
- 详情页链接

## 如何维护首页 Hero

首页 Hero 位于 `index.html` 与 `en/index.html` 的 `class="hero"` 区块中，页面通过 `home-page-v8` 类启用当前视觉系统。左侧研究定位保持静止，右侧依次轮换 TurtleBot 4、Intel 5300 WiFi CSI 与 BFI Capture Platform 三张设备图；图片路径和显示名称都写在 `.hero-device-slide` 上。画廊支持按钮、键盘、拖动、触控滑动与自动轮播，逻辑位于 `js/main.js`。更新时保持设备图为真实科研素材，并同步检查中英文图片说明。

## 如何维护中英文页面

中文页面位于项目根目录，英文页面位于 `en/` 目录。根首页不执行语言重定向；中文页的 `EN` 链接进入英文版，英文页的 `CN` 链接返回中文首页。新增或修改真实内容时，需要同步更新对应语言页面，并保持顶部 `EN / CN` 语言切换链接指向对应页面。

## 如何维护团队成员

首页团队成员位于 `index.html` 的 `id="team"` 区域，只展示部分成员卡片；完整名单位于 `team.html`。新增成员时复制一个 `member-card`，修改姓名、身份、邮箱，并同步更新分组标题旁的人数。

## 如何添加论文

论文同时展示在首页与 `results.html`。新增真实论文时，应在两处复制一个完整的 `article class="publication-item"`，保持以下字段完全一致，并同步英文页面：

- 编号
- title
- authors
- venue
- year
- url

有真实 URL 时，可以将 URL 文本改为 `<a href="真实链接">访问论文</a>`。

## 如何添加本科生科研题目

当前 `join.html` 使用一块正式状态区域说明题目尚未公布，不再重复展示空题目卡。收到真实科研题目后，可在 `id="opportunities"` 区域增加 `article class="opportunity-item"`，并填写：

- 题目编号与名称
- 研究方向
- 题目简介
- 主要工作
- 基础要求
- 指导教师
- 状态

题目状态使用“开放”或“暂停”。真实内容尚未发布时保持“内容待公布”。

## 部署到 GitHub Pages

### 首次连接并推送

先在 GitHub 网站创建一个空仓库，不要勾选自动添加 README、`.gitignore` 或 License。然后在本项目目录执行：

```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

首次推送时，Windows 上的 Git Credential Manager 通常会打开浏览器，请在浏览器中登录 GitHub 并授权。不要把密码或访问令牌写入本项目文件。

### 开启 GitHub Pages

1. 打开 GitHub 仓库页面，进入 **Settings**。
2. 在左侧选择 **Pages**。
3. 在 **Build and deployment** 下将 Source 设为 **Deploy from a branch**。
4. Branch 选择 `main`，目录选择 `/ (root)`，然后点击 **Save**。
5. 等待 GitHub 完成部署，Pages 页面会显示网站地址。

网站使用相对资源路径，可直接部署在用户主页仓库或普通项目仓库中。
