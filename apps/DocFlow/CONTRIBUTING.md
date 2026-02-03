# DocFlow 开发文档

DocFlow 是一个基于 Next.js 和 Tiptap 构建的现代化协同文档编辑器，集成了富文本编辑、实时协作、AI 助手、工作流管理等功能。项目采用前端技术栈 Next.js + React 19 + TypeScript + Tailwind CSS，使用 pnpm 作为包管理器。

核心特性：富文本编辑器（基于 Tiptap）、实时协作（Yjs + Hocuspocus）、模块化架构（文档管理、知识库、工作流、通讯录、组织管理等）、AI 能力集成、完善工具链（ESLint、Prettier、Husky、Commitizen、TypeScript 严格模式）。

## 项目文件结构

整体目录布局

```text
├── .github/                    # GitHub 配置
│   ├── ISSUE_TEMPLATE/        # Issue 模板
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/             # CI/CD 工作流
├── .husky/                    # Git hooks 配置
├── public/                    # 静态资源
│   ├── fonts/                 # 字体文件
│   └── favicon.svg
├── scripts/                   # 自动化脚本
├── src/                       # 源代码目录
│   ├── app/                   # Next.js App Router 路由
│   ├── components/            # 全局可复用组件
│   ├── extensions/            # Tiptap 扩展组件
│   ├── hooks/                 # 自定义 React Hooks
│   ├── providers/             # React Context Providers
│   ├── services/              # API 服务层
│   ├── stores/                # Zustand 状态管理
│   ├── styles/                # 全局样式和编辑器样式
│   ├── types/                 # TypeScript 类型定义
│   └── utils/                 # 工具函数和常量
├── .editorconfig              # 编辑器配置
├── .prettierrc                # Prettier 配置
├── commitlint.config.cjs      # 提交信息规范配置
├── eslint.config.mjs          # ESLint 配置
├── next.config.ts             # Next.js 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 项目依赖配置
```

### src 目录详细说明

app 目录 - 路由和页面

```text
src/app/
├── auth/                      # 认证相关页面
│   ├── _components/          # 认证页面私有组件（登录表单、注册表单等）
│   ├── callback/             # OAuth 回调页面
│   └── page.tsx              # 认证主页面
├── dashboard/                # 仪表盘路由
│   ├── contacts/             # 通讯录模块
│   │   ├── _components/      # 通讯录私有组件
│   │   ├── external/         # 外部联系人
│   │   ├── groups/           # 联系人分组
│   │   ├── requests/         # 好友请求
│   │   └── page.tsx
│   ├── knowledge/            # 知识库模块
│   │   ├── _components/
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── messages/             # AI 聊天助手
│   ├── organizations/        # 组织管理
│   │   ├── _components/
│   │   ├── [id]/
│   │   ├── invitations/
│   │   └── page.tsx
│   ├── podcast/              # 播客管理
│   ├── settings/             # 系统设置
│   ├── user/                 # 个人资料
│   ├── workflow/             # 工作流编辑器
│   └── layout.tsx            # Dashboard 布局
├── docs/                     # 文档编辑器
│   ├── _components/          # 文档编辑器私有组件
│   │   ├── CommentPanel/    # 评论面板
│   │   ├── DocumentHeader/  # 文档头部
│   │   ├── DocumentSidebar/ # 文档侧边栏
│   │   └── FloatingToc/     # 浮动目录
│   ├── [room]/              # 文档房间（协作空间）
│   └── layout.tsx           # Docs 布局（加载编辑器样式）
├── share/                   # 文档分享页面
├── layout.tsx               # 根布局（全局样式）
└── page.tsx                 # 首页
```

components 目录 - 全局可复用组件

```text
src/components/
├── dashboard/               # Dashboard 相关全局组件
│   └── DashboardHeader.tsx
├── homepage/                # 首页组件
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── Footer.tsx
├── menus/                   # 编辑器菜单组件
│   ├── ContentItemMenu/    # 内容项菜单
│   ├── ImageBlockMenu/     # 图片菜单
│   ├── LinkMenu/           # 链接菜单
│   └── TextMenu/           # 文本菜单
├── notifications/           # 通知组件
├── panels/                  # 编辑器面板组件
│   ├── Colorpicker/
│   ├── LinkEditorPanel/
│   └── LinkPreviewPanel/
├── ui/                      # 基础 UI 组件（Shadcn UI）
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── tooltip.tsx
│   └── ...
└── working/                 # 工作状态指示器
```

extensions 目录 - Tiptap 编辑器扩展

```text
src/extensions/
├── AI/                      # AI 相关扩展
├── Audio/                   # 音频扩展
├── Bilibili/                # B站视频嵌入
├── BlockquoteFigure/        # 引用块
├── Chart/                   # 图表扩展
├── CodeBlock/               # 代码块
├── Comment/                 # 评论功能
├── Countdown/               # 倒计时组件
├── DraggableBlock/          # 可拖拽块
├── EmojiSuggestion/         # Emoji 建议
├── FontSize/                # 字体大小
├── Gantt/                   # 甘特图
├── Heading/                 # 标题扩展
├── Image/                   # 图片处理
├── ImageBlock/              # 图片块
├── ImageUpload/             # 图片上传
├── Link/                    # 链接扩展
├── MarkdownPaste/           # Markdown 粘贴
├── Mention/                 # @提及功能
├── MultiColumn/             # 多列布局
├── SlashCommand/            # 斜杠命令
├── Table/                   # 表格扩展
├── TableOfContentsNode/     # 目录节点
├── TextToImage/             # 文本转图片
├── Youtube/                 # YouTube 视频嵌入
└── extension-kit.ts         # 扩展集合配置
```

services 目录 - API 服务层

```text
src/services/
├── ai/                      # AI 相关 API
├── auth/                    # 认证 API
├── comment/                 # 评论 API
├── contacts/                # 通讯录 API
├── document/                # 文档 API
├── friend/                  # 好友关系 API
├── image/                   # 图片上传 API
├── knowledge/               # 知识库 API
├── notifications/           # 通知 API
├── organization/            # 组织管理 API
├── podcast/                 # 播客 API
├── trace/                   # 追踪统计 API
├── upload/                  # 文件上传 API
├── users/                   # 用户 API
├── video/                   # 视频 API
└── request.ts               # 统一请求封装（Fetch + 拦截器 + Token刷新）
```

stores 目录 - 状态管理

```text
src/stores/
├── commentStore.ts          # 评论状态
├── dragDropStore.ts         # 拖拽状态
├── editorStore.ts           # 编辑器状态
├── fileStore.ts             # 文件上传状态
├── sidebarStore.ts          # 侧边栏状态
└── userStore.ts             # 用户信息状态
```

utils 目录 - 工具函数

```text
src/utils/
├── constants/               # 常量定义
│   ├── routes.ts           # 路由常量
│   ├── navigation.tsx      # 导航配置
│   └── index.ts            # 其他常量
├── auth.ts                 # 认证工具函数
├── cookie.ts               # Cookie 操作
├── format.ts               # 格式化工具
├── validation.ts           # 验证工具
└── ...
```

styles 目录 - 样式架构

```text
src/styles/
├── global.css              # 全局样式（Tailwind + 主题变量）
├── index.css               # 编辑器样式（仅在 /docs 路由加载）
└── partials/               # 编辑器样式模块
    ├── animations.css      # 动画样式
    ├── blocks.css          # 块级元素样式
    ├── code-block.css      # 代码块样式
    ├── collab.css          # 协作光标样式
    ├── draggable.css       # 拖拽样式
    ├── lists.css           # 列表样式
    ├── math.css            # 数学公式样式
    ├── table.css           # 表格样式
    ├── typography.css      # 排版样式
    └── ...
```

## 开发规范

项目使用 ESLint 和 Prettier 统一代码风格，所有代码必须通过 Lint 和格式化检查。

### 命名规范

- PascalCase：组件、类型、接口、枚举
  - 示例：`UserProfile.tsx`、`interface ButtonProps`、`enum UserRole`
- camelCase：变量、函数、Hook
  - 示例：`const userId = 1`、`function getUserData()`、`useFileUpload()`
- kebab-case：文件名（除组件外）
  - 示例：`user-profile.tsx`、`use-fetch.ts`、`api-client.ts`
- SCREAMING_SNAKE_CASE：常量
  - 示例：`const API_BASE_URL = '...'`、`const MAX_FILE_SIZE = 1024`

### 文件组织原则

全局组件（components 目录）

- 存放可跨页面、跨模块复用的组件
- 组件应该是纯粹的、无副作用的
- 必须有清晰的类型定义
- 命名应该语义化、自解释
- 示例：`Button`、`Dialog`、`UserAvatar`、`DocumentCard`

页面私有组件（app 路由下的 \_components 目录）

- 仅在当前路由或其子路由内使用的组件
- 不会被其他模块引用
- 可以包含特定业务逻辑
- 使用 `_components` 目录命名，Next.js 不会将其视为路由
- 示例：`app/dashboard/contacts/_components/ContactList.tsx`

工具函数（utils 目录）

- 纯函数，无副作用
- 与框架无关（不依赖 React、Next.js 特定 API）
- 可以在服务端和客户端环境运行
- 示例：格式化日期、验证邮箱、处理文本等

服务层（services 目录）

- 封装所有 API 请求
- 使用统一的 `request.ts` 进行网络请求
- 每个模块对应一个服务文件
- 导出明确的类型定义
- 示例：

```typescript
// services/document/index.ts
import request from '@/services/request';
import type { Document, CreateDocumentParams } from './type';

export async function getDocumentList() {
  return request.get<Document[]>('/api/v1/documents');
}

export async function createDocument(params: CreateDocumentParams) {
  return request.post<Document>('/api/v1/documents', { params });
}
```

### TypeScript 规范

- 严格模式：项目启用了 TypeScript strict 模式
- 类型定义：所有 Props、函数参数、返回值必须有类型
- 避免使用 `any`：如果类型不确定，使用 `unknown` 并进行类型守卫
- 接口优先：组件 Props 使用 `interface`，类型别名用于联合类型和工具类型
- 泛型使用：为可复用的 Hook 和工具函数编写泛型

示例：

```typescript
// 正确
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  // ...
}

// 错误：缺少类型定义
export function UserCard({ user, onEdit }) {
  // ...
}
```

### 组件开发规范

函数组件

- 只使用函数组件，不使用类组件
- 优先使用默认导出（除非需要多个命名导出）
- 组件内部按以下顺序组织代码：
  1. Hooks 调用
  2. 派生状态和计算值
  3. 事件处理函数
  4. 副作用（useEffect）
  5. 渲染逻辑

性能优化

- 避免过度使用 `useMemo` 和 `useCallback`，除非：
  - 计算开销很大
  - 依赖数组稳定且能避免子组件不必要的重渲染
  - 性能分析工具证明有必要
- 优化策略：
  - 组件拆分：将大组件拆分成小组件
  - 状态下沉：状态放在最接近使用它的组件
  - 使用稳定的 key 值
  - 延迟加载：使用 `next/dynamic` 动态导入大型组件

### 样式规范

Tailwind CSS 使用

- 优先使用 Tailwind 工具类
- 保持类名简洁，避免过长的 className
- 复杂组件可以使用 `clsx` 或 `tailwind-merge` 动态组合类名
- 响应式设计：优先使用移动端样式，再使用 `md:`、`lg:` 等前缀适配更大屏幕

CSS 加载策略

全局样式加载：在 `app/layout.tsx` 中加载 `global.css`，包含：

- Tailwind CSS 基础层、组件层、工具层
- 主题变量（浅色和深色主题）
- 全局样式重置

编辑器样式加载：在 `app/docs/layout.tsx` 中加载 `index.css`，包含：

- KaTeX 数学公式样式
- 代码高亮样式（highlight.js）
- Tiptap 编辑器组件样式
- 协作光标样式

原因：首页不需要编辑器样式，按需加载可减少首屏加载体积约 200KB。

重要：不要在 `index.css` 中重复导入 `@import 'tailwindcss'`，只在 `global.css` 导入一次。

## Git 工作流程

### 分支管理策略

- `main`：主分支，保护分支，只接受 PR 合并
- `feature/xxx`：功能分支，从 `main` 或 `develop` 切出
- `fix/xxx`：修复分支
- `refactor/xxx`：重构分支

分支命名示例：

- `feature/add-user-profile`
- `fix/document-editor-crash`
- `refactor/optimize-api-requests`

### 提交信息规范

项目使用 Commitizen + Commitlint 规范提交信息，格式如下：

```text
<type>(<scope>): <subject>

<body>

<footer>
```

常用 type 类型：

- `feat`：新功能
- `fix`：Bug 修复
- `docs`：文档更新
- `style`：代码格式（不影响代码运行的变动）
- `refactor`：重构（既不是新增功能，也不是修改 Bug）
- `perf`：性能优化
- `test`：增加测试
- `chore`：构建过程或辅助工具的变动
- `revert`：回滚之前的提交

示例：

```bash
feat(editor): 添加代码块语法高亮功能

- 集成 highlight.js
- 支持 20+ 编程语言
- 添加主题切换功能
```

使用 Commitizen：

```bash
# 使用交互式命令行工具提交
pnpm commit
```

## 需求认领和开发流程

### 步骤 1：浏览和认领需求

认领方式一：通过 GitHub Issues

1. 访问 [GitHub Issues](https://github.com/xun082/DocFlow/issues) 页面查看待认领的需求
2. 筛选带有 `待认领` 标签的 Issue
3. 阅读需求描述、实现内容、验收标准
4. 在 Issue 下评论："我要认领此任务"
5. 等待项目管理员确认并 Assign 给你

认领方式二：直接联系维护者

- 添加微信：`yunmz777`
- 说明想要认领的任务或想要贡献的方向
- 与维护者讨论具体实现方案

发现 Bug？

如果你在使用过程中发现了 Bug：

1. 在 [GitHub Issues](https://github.com/xun082/DocFlow/issues) 提交 Bug 报告
2. 描述复现步骤、预期行为和实际行为
3. 如果你愿意修复这个 Bug，在 Issue 中说明
4. 等待确认后即可开始开发

### 步骤 2：本地开发环境搭建

克隆仓库：

```bash
git clone https://github.com/xun082/DocFlow.git
cd DocFlow
```

安装依赖：

```bash
pnpm install
```

启动开发服务器：

注意：项目已经持续运行，不需要手动执行 `pnpm dev`

检查代码：

```bash
# 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 格式化代码
pnpm format
```

### 步骤 3：创建分支并开发

从主分支创建功能分支：

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

进行开发，遵循项目规范：

- 文件结构：按照上述目录划分原则组织代码
- 代码风格：运行 `pnpm lint` 和 `pnpm format` 确保符合规范
- TypeScript：确保没有类型错误（`pnpm type-check`）
- 组件设计：遵循组件开发规范
- 提交信息：使用 `pnpm commit` 提交代码

### 步骤 4：自测和验证

在提交 PR 前，确保完成以下检查：

```bash
# 1. 类型检查通过
pnpm type-check

# 2. Lint 检查通过
pnpm lint

# 3. 代码格式化
pnpm format

# 4. 构建成功
pnpm build
```

功能测试：

- 手动测试功能是否符合需求描述
- 检查边界情况和异常处理
- 测试响应式布局（不同屏幕尺寸）
- 验证无障碍性（键盘导航、ARIA 标签）

### 步骤 5：提交 Pull Request

推送分支到远程：

```bash
git push origin feature/your-feature-name
```

创建 Pull Request：

1. 访问 GitHub 仓库页面
2. 点击 "Compare & pull request"
3. 认真填写 PR 模板内容（这很重要）：
   - PR 描述：清晰简洁地描述所做的变更
   - PR 类型：勾选适用的类型（Bug 修复、新功能、UI 改进等）
   - Issue 关联：使用 `Closes #Issue编号` 或 `Fixes #Issue编号` 关联 Issue
     - 重要：使用 `Closes #123` 格式，PR 合并后会自动关闭对应的 Issue
     - 如果只是相关但不完全解决，使用 `Related to #123`
   - 实现细节：说明技术方案、为什么选择这种方案
   - 测试情况：勾选已完成的测试类型（单元测试、集成测试、手动测试）
   - UI 变更：如果有 UI 改动，提供截图或视频对比
   - 提交前检查清单：逐项勾选所有项

4. 提交 PR 并等待 Code Review

示例 - Issue 关联格式：

```markdown
## Issue 关联

- Closes #123
- Fixes #456
- Related to #789
```

### 步骤 6：响应 Code Review

- 认真阅读 Review 意见
- 及时回复和讨论
- 根据反馈修改代码
- 修改后推送到同一分支，PR 会自动更新
- 所有讨论解决后，等待合并

### 步骤 7：合并后清理

PR 合并后：

1. 删除远程分支（GitHub 会提示）
2. 本地切换回主分支并清理

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

## 常用开发命令

### 项目管理

```bash
# 安装依赖
pnpm install

# 启动开发服务器（注意：项目已持续运行，通常不需要手动执行）
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 分析打包体积
pnpm analyze
```

### 代码质量

```bash
# TypeScript 类型检查
pnpm type-check

# ESLint 检查并自动修复
pnpm lint

# 仅检查不修复（CI 环境）
pnpm lint:ci

# Prettier 格式化代码
pnpm format

# 检查格式是否符合规范（CI 环境）
pnpm format:ci
```

### Git 提交

```bash
# 交互式提交（推荐）
pnpm commit

# 普通提交（需要符合 Commitlint 规范）
git commit -m "feat: 添加新功能"
```

## 开发注意事项

### 关于路由和页面

- Next.js App Router 使用文件系统路由
- `page.tsx` 是路由页面入口
- `layout.tsx` 是布局组件，子路由会继承父路由的 layout
- `_components/` 目录不会生成路由，用于存放页面私有组件
- `[id]/` 表示动态路由参数

### 关于样式

- 首页不会加载编辑器样式，保持首屏加载快速
- 编辑器样式（约 200KB）仅在访问 `/docs` 路由时加载
- 使用 Tailwind CSS 工具类时，注意深色模式适配（使用 `dark:` 前缀）
- 自定义 CSS 使用 `@apply` 指令复用 Tailwind 工具类

### 关于状态管理

- 简单状态使用 `useState`
- 跨组件共享状态使用 Zustand
- 服务器状态使用 React Query（已配置 `@tanstack/react-query`）
- 不要在 Zustand Store 中存储大量数据，避免性能问题

### 关于 API 请求

- 统一使用 `services/request.ts` 封装的请求方法
- 请求会自动处理 Token 刷新、错误处理、重试逻辑
- 不要直接使用 `fetch`，使用 `request.get/post/put/delete` 等方法
- API 响应格式为 `{ code, message, data, timestamp }`
- 使用 `errorHandler` 统一处理错误

示例：

```typescript
import request from '@/services/request';

const { data, error } = await request.get<User[]>('/api/v1/users', {
  params: { page: 1, limit: 10 },
  errorHandler: (err) => {
    console.error('获取用户列表失败', err);
  },
});

if (error) {
  // 处理错误
  return;
}

// 使用 data
console.log(data?.data); // User[]
```

### 关于认证和鉴权

- Token 存储在 Cookie 中（`auth_token`、`refresh_token`）
- `src/proxy.ts` 是 Next.js Middleware，负责路由鉴权
- Token 过期会自动刷新，刷新失败会重定向到登录页
- 受保护路由在 `proxy.ts` 的 `config.matcher` 中配置

### 关于编辑器扩展

- 所有 Tiptap 扩展放在 `src/extensions/` 目录
- `extension-kit.ts` 是扩展集合，统一导出所有扩展
- 创建新扩展时遵循 Tiptap 扩展规范
- 扩展可以包含自定义 React 组件（NodeView）

### 关于性能优化

- 避免在组件内部创建大对象或函数（会导致每次渲染都创建新实例）
- 使用 `next/dynamic` 延迟加载大型组件
- 图片使用 `next/image` 组件，自动优化
- 避免过深的组件嵌套
- 大列表使用虚拟滚动（如 `react-window`）

## 常见问题

Q：运行 `pnpm dev` 后提示端口已被占用？

A：项目已经持续运行，不需要再次启动开发服务器。如果确实需要重启，请先关闭已有的进程。

Q：提交代码时 Git Hook 失败？

A：确保代码通过了 `pnpm lint` 和 `pnpm format`，Git Hook 会自动运行这些检查。

Q：TypeScript 类型错误如何处理？

A：运行 `pnpm type-check` 查看详细错误信息，根据提示修复类型问题。避免使用 `@ts-ignore`，应该正确定义类型。

Q：如何添加新的依赖包？

A：使用 `pnpm add <package-name>`。注意选择最新稳定版本，避免引入安全漏洞。

Q：编辑器样式不生效？

A：检查是否在正确的位置导入了样式。全局样式在 `app/layout.tsx`，编辑器样式在 `app/docs/layout.tsx`。

Q：API 请求 401 错误？

A：Token 可能已过期。检查 Cookie 中的 `auth_token` 和 `refresh_token`。如果刷新失败，会自动跳转到登录页。

Q：如何调试 Next.js Middleware？

A：在 `src/proxy.ts` 中添加 `console.log`，在服务器控制台查看日志输出。

## 联系和支持

如果在开发过程中遇到问题：

1. 查阅本文档和项目 README
2. 搜索 GitHub Issues 查看是否有类似问题
3. 在对应的 Issue 下提问
4. 联系项目维护者（微信：yunmz777）

感谢您为 DocFlow 项目做出贡献！
