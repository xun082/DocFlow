一个基于 [Tiptap](https://tiptap.dev/) 和 [Next.js](https://nextjs.org/) 构建的现代化协同文档编辑器，集成了丰富的编辑能力与多人实时协作功能，支持插件扩展、主题切换与持久化存储。适合团队写作、教育笔记、在线文档平台等场景。

## 🚀 功能特性

- 📄 富文本编辑：标题、列表、表格、代码块、数学公式、图片、拖拽等

- 👥 实时协作：使用 Yjs + @hocuspocus/provider 实现高效协同

- 🧩 插件丰富：基于 Tiptap Pro 多种增强功能（如表情、详情组件等）

- 🧰 完善工具链：支持 Prettier、ESLint、Husky、Vitest 等开发工具

## 📦 技术栈

### 前端技术栈

| 技术                  | 说明                             |
| --------------------- | -------------------------------- |
| **Next.js**           | 构建基础框架，支持 SSR / SSG     |
| **Tiptap**            | 富文本编辑器，基于 ProseMirror   |
| **Yjs**               | 协同编辑核心，CRDT 数据结构      |
| **@hocuspocus**       | Yjs 的服务端与客户端 Provider    |
| **React 19**          | UI 框架，支持 Suspense 等新特性  |
| **Tailwind CSS**      | 原子化 CSS，集成动画、表单样式等 |
| **Socket.io**         | 协同通信通道                     |
| **Prettier/ESLint**   | 代码风格统一                     |
| **Vitest/Playwright** | 单元测试与端到端测试支持         |

![20250519183256](https://raw.githubusercontent.com/xun082/md/main/blogs.images20250519183256.png)

### 后端技术栈

| 分类             | 技术 / 工具                                                           | 说明                                                              |
| ---------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **应用框架**     | [NestJS](https://nestjs.com/)                                         | 现代化 Node.js 框架，支持模块化、依赖注入、装饰器和类型安全等特性 |
| **HTTP 服务**    | [Fastify](https://www.fastify.io/)                                    | 高性能 Web 服务引擎，替代 Express，默认集成于 NestJS 中           |
| **协同编辑服务** | `@hocuspocus/server`, `yjs`                                           | 提供文档协同编辑的 WebSocket 服务与 CRDT 算法实现                 |
| **数据库 ORM**   | [Prisma](https://www.prisma.io/)                                      | 类型安全的数据库访问工具，自动生成 Schema、支持迁移与种子数据     |
| **数据验证**     | `class-validator`, `class-transformer`                                | 请求数据验证与自动转换，配合 DTO 使用                             |
| **用户鉴权**     | `@nestjs/passport`, `passport`, `JWT`, `GitHub`                       | 支持本地登录、JWT 认证与 GitHub OAuth 登录                        |
| **缓存与状态**   | `ioredis`                                                             | 用于缓存数据、实现限流、协同会话管理或 Pub/Sub 消息推送           |
| **对象存储**     | `minio`                                                               | 私有化部署的 S3 兼容存储服务，支持图片与附件上传                  |
| **图像处理**     | `sharp`                                                               | 图像压缩、格式转换、缩略图等操作                                  |
| **日志系统**     | `winston`, `winston-daily-rotate-file`                                | 支持多种格式、日志分级、自动归档的日志方案                        |
| **服务监控**     | `@nestjs/terminus`, `prom-client`                                     | 提供 `/health` 健康检查和 `/metrics` Prometheus 指标暴露接口      |
| **监控平台**     | [Prometheus](https://prometheus.io/), [Grafana](https://grafana.com/) | 采集与可视化服务运行指标（已内置 Docker 部署配置）                |
| **接口文档**     | `@nestjs/swagger`                                                     | 基于代码注解自动生成 Swagger UI 文档                              |
| **安全中间件**   | `@fastify/helmet`, `@fastify/rate-limit`                              | 添加 HTTP 安全头部、限制请求频率、防止暴力攻击等安全保护          |
| **文件上传**     | `@fastify/multipart`, `@webundsoehne/nest-fastify-file-upload`        | 支持文件流式上传，集成 Fastify 与 NestJS 的多文件上传处理         |

![20250519183049](https://raw.githubusercontent.com/xun082/md/main/blogs.images20250519183049.png)

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/xun082/DocFlow.git
cd DocFlow
```

### 安装依赖

建议使用 pnpm：

```bash
pnpm install
```

### 启动本地开发环境

```bash
pnpm dev
```

### 如何部署

确保已安装以下环境：

- Docker

- 推荐：Linux/macOS 或启用 WSL 的 Windows 环境

1️⃣ 构建镜像

```bash
docker build -t doc-flow .
```

2️⃣ 启动容器

```bash
docker run -p 6001:6001 doc-flow
```

启动完成之后访问地址：

```bash
http://localhost:6001
```

## 🔧 常用脚本

| 脚本命令          | 作用说明                      |
| ----------------- | ----------------------------- |
| `pnpm dev`        | 启动开发服务器                |
| `pnpm build`      | 构建生产环境代码              |
| `pnpm start`      | 启动生产环境服务（端口 6001） |
| `pnpm lint`       | 自动修复所有 ESLint 报错      |
| `pnpm format`     | 使用 Prettier 格式化代码      |
| `pnpm type-check` | 运行 TypeScript 类型检查      |
| `pnpm test`       | 启动测试（如配置）            |

## 🧰 开发规范

- 使用 Prettier 和 ESLint 保证代码风格统一

- 配置了 Husky + lint-staged 进行 Git 提交前检查

- 使用 Commitizen + cz-git 管理提交信息格式（支持语义化发布）

初始化 Git 提交规范：

```bash
pnpm commit
```

## 📌 未来规划（Roadmap）

项目目前已具备基础协作编辑能力，未来将持续完善并拓展更多功能，进一步提升产品的实用性与专业性：

### ✅ 近期目标

- [ ] **完善现有功能体验**

  - 优化协同冲突解决策略
  - 更细粒度的权限管理（只读 / 可评论 / 可编辑）
  - 增强拖拽体验与文档结构导航（大纲视图）

- [ ] **增强文档组件系统**

  - 重构基础组件体系：标题、表格、代码块等更智能、模块化
  - 增加工具栏、快捷键提示和 Markdown 快速输入支持

- [ ] **丰富文档类型与节点支持**

  - 支持更多 **自定义 Tiptap 节点**，如：

    - 引用评论块（Comment Block）
    - 自定义警告框 / 提示框（Tip/Warning）
    - UML/流程图嵌入（如支持 Mermaid）
    - 数据展示组件（如 TableChart、Kanban）

### 🚀 中期目标

- [ ] **引入音视频实时会议能力**

  - 集成 [LiveKit](https://livekit.io/) 或 [Daily](https://www.daily.co/) 实现嵌入式音视频会议
  - 支持多人语音 / 视频通话，结合文档协同，提升远程会议效率
  - 集成会议内共享笔记区、AI 摘要、会议录制等功能

- [ ] **集成 AI 能力**

  - 智能语法纠错、改写建议
  - 语义搜索与问答（支持上下文理解）
  - AI 总结 / 摘要生成

- [ ] **多平台同步支持**

  - PWA 支持，适配移动端和桌面离线编辑
  - 跨设备自动同步与版本恢复

### 🧠 长期方向

- [ ] **插件生态系统建设**

  - 引入用户可安装的第三方插件体系
  - 提供插件开发文档与市场入口

- [ ] **文档协作平台化**

  - 支持文档团队空间、多人组织结构
  - 文档看板与团队活动看板集成

- [ ] **权限与审计系统**

  - 支持操作日志记录、文档编辑历史审查
  - 审批流、编辑建议、协同讨论区等功能

## License

本项目采用 MIT 开源协议发布，**但包含部分 Tiptap Pro 模板代码除外**。

Tiptap Pro 模板版权归 Tiptap GmbH 所有，并根据 Tiptap Pro 授权协议进行授权。  
详见：https://tiptap.dev/pro/license

如需使用本项目中涉及 Tiptap Pro 的部分，必须拥有有效的 Tiptap Pro 订阅授权。

## 📬 联系方式

有更多的问题或者想参与开源，可以添加我微信 `yunmz777`
