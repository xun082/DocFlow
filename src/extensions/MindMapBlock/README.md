# MindMapBlock Tiptap 扩展

## 概述

`MindMapBlock` 是一个为 Tiptap 编辑器设计的思维导图扩展，用户可以在文档中插入可交互的思维导图。支持两种创建方式：

1. 通过 JSON 编辑器自定义内容
2. 通过视频URL自动生成（支持YouTube、Bilibili等）

## 功能特性

- ✅ 支持在 Tiptap 编辑器中插入思维导图
- ✅ 可拖拽插入和移动
- ✅ **🆕 URL输入自动生成：** 输入视频URL，自动下载、转录并生成思维导图
- ✅ 内置 JSON 数据编辑器
- ✅ 预设示例数据
- ✅ 实时处理进度显示
- ✅ 数据验证和错误处理
- ✅ 响应式设计
- ✅ 支持编辑器选中状态

## 数据结构

```typescript
interface MindMapNodeData {
  id: number;
  label: string;
  children?: MindMapNodeData[];
}
```

## 视频转思维导图流程

### 1. 支持的视频平台

- YouTube
- Bilibili
- 以及其他主流视频平台（只要提供有效的URL）

### 2. 处理流程

```
用户输入URL → 下载视频 → 音频转文字 → 文字转思维导图 → 显示结果
     ↓           ↓         ↓           ↓           ↓
   URL验证    DownloadVideo AudioToText TextToMindMap  更新组件
```

### 3. API接口说明

#### 第一步：视频下载

```typescript
VideoApi.DownloadVideoForNetWork({ url: string });
// 返回: { videoPath: string, mp3Path: string }
```

#### 第二步：音频转文字

```typescript
VideoApi.AudioToText({ audioPath: string });
// 返回: { transcriptionText: string }
```

#### 第三步：文字转思维导图

```typescript
VideoApi.TextToMindMap({ transcriptionText: string });
// 返回: { mind_map: MindMapNodeData }
```

## 使用方法

### 通过视频URL生成

1. 在思维导图组件中输入视频URL
2. 点击"生成"按钮或按回车键
3. 系统自动处理：显示进度条和当前步骤
4. 处理完成后自动更新思维导图内容

```typescript
// 使用示例
const videoUrls = [
  'https://www.youtube.com/watch?v=...',
  'https://www.bilibili.com/video/...',
  'https://example.com/video.mp4',
];
```

### 通过JSON手动编辑

点击"编辑数据"按钮，在JSON编辑器中自定义思维导图结构：

```json
{
  "id": 1,
  "label": "算法分类",
  "children": [
    {
      "id": 2,
      "label": "排序算法",
      "children": [
        { "id": 3, "label": "冒泡排序" },
        { "id": 4, "label": "快速排序" }
      ]
    }
  ]
}
```

## 用户界面

### 工具栏功能

- **编辑数据**：打开JSON编辑器
- **示例数据**：加载预设的算法分类示例
- **删除**：移除当前思维导图块

### URL输入区域

- **URL输入框**：支持视频链接输入，实时验证URL格式
- **生成按钮**：开始处理流程，显示动态loading效果
- **进度条**：实时显示处理进度（25%→50%→75%→100%）
- **状态提示**：显示当前处理步骤和错误信息

### 处理状态

1. **正在下载视频...** (25%)
2. **正在转换音频为文字...** (50%)
3. **正在生成思维导图...** (75%)
4. **生成完成！** (100%)

## 错误处理

### 常见错误类型

- URL格式错误
- 视频下载失败
- 音频转录失败
- 思维导图生成失败
- 网络连接问题

### 错误恢复

- 自动重置状态（3秒后）
- 保留用户输入的URL
- 提供具体错误信息
- 支持手动重试

## 安装和配置

### 1. 添加到扩展工具包

在 `src/extensions/extension-kit.ts` 中添加：

```typescript
import { MindMapBlock } from './MindMapBlock';

export const ExtensionKit = ({ provider }: ExtensionKitProps) => [
  // ... 其他扩展
  MindMapBlock,
  // ...
];
```

### 2. 确保VideoApi可用

确保以下API服务已正确配置：

```typescript
// src/services/video/index.ts
export const VideoApi = {
  DownloadVideoForNetWork,
  AudioToText,
  TextToMindMap,
};
```

## 键盘快捷键

- **Enter**：在URL输入框中按回车开始生成
- **Enter**：在JSON编辑器中保存更改
- **Escape**：取消JSON编辑

## 性能优化

### 缓存机制

- 相同URL的处理结果可以考虑缓存
- 避免重复下载相同视频

### 异步处理

- 所有API调用都是异步的
- 不会阻塞编辑器其他功能

### 资源管理

- 处理完成后自动清理临时状态
- 合理的超时和重试机制

## 自定义样式

```css
/* URL输入区域 */
.mindmap-block .url-input-area {
  background: linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%);
}

/* 进度条 */
.mindmap-block .progress-bar {
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
}

/* 错误提示 */
.mindmap-block .error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}
```

## API集成建议

### 后端要求

1. **视频下载服务**：支持多平台视频URL解析和下载
2. **语音识别服务**：高精度的音频转文字功能
3. **AI生成服务**：基于文本内容生成结构化思维导图

### 数据流转

```
Frontend → Backend API → AI Service → Database → Frontend
    ↓           ↓           ↓           ↓         ↓
 URL输入    下载处理     AI分析      结果存储   界面更新
```

## 故障排除

### 1. URL不支持

**问题**：某些视频平台的URL无法处理
**解决**：

- 检查URL格式是否正确
- 确认平台是否在支持列表中
- 尝试使用其他格式的URL

### 2. 处理超时

**问题**：长视频处理时间过长
**解决**：

- 建议使用较短的视频（<30分钟）
- 检查网络连接状态
- 增加API超时时间配置

### 3. 生成质量问题

**问题**：生成的思维导图结构不理想
**解决**：

- 使用内容较为结构化的视频
- 通过JSON编辑器手动调整
- 提供更清晰的视频音频

## 演示页面

访问 `/mindmap-demo` 查看完整的功能演示，包括：

- URL输入生成演示
- JSON编辑功能演示
- 错误处理演示
- 各种视频平台测试

## 兼容性

- **Tiptap**: v2.12.0+
- **React**: 18.0+
- **TypeScript**: 5.0+
- **@antv/x6**: 2.18.1+
- **视频格式**: MP4, WebM, AVI等主流格式
- **音频格式**: MP3, WAV, AAC等主流格式
