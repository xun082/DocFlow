'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

import Header from '@/components/homepage/Header';
import Footer from '@/components/homepage/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  author?: {
    name: string;
    avatar?: string;
  };
}

const blogPosts: Record<string, BlogPost> = {
  'docflow-ai-writing-platform': {
    id: 'docflow-ai-writing-platform',
    title: 'DocFlow：基于 Tiptap + Yjs 的 AI 智能写作平台',
    excerpt: '探索 DocFlow 如何结合 Tiptap 编辑器和 Yjs 实时协作技术，打造下一代智能写作平台。',
    content: `
# DocFlow：基于 Tiptap + Yjs 的 AI 智能写作平台

## 引言

在数字化时代，文档编辑和协作已经成为日常工作中不可或缺的一部分。传统的文档编辑器如 Google Docs、Microsoft Word Online 等提供了基本的协作功能，但在 AI 时代，我们需要的不仅仅是协作，更需要智能。

DocFlow 正是基于这样的理念诞生的——一个结合了实时协作和 AI 智能的下一代写作平台。

## 技术栈概览

### Tiptap：无头编辑器框架

Tiptap 是一个基于 ProseMirror 的无头富文本编辑器框架，它提供了：

- **无头架构**：完全自定义的 UI，不受限于预定义的样式
- **扩展系统**：通过扩展轻松添加新功能
- **类型安全**：基于 TypeScript，提供完整的类型支持
- **协作支持**：内置对 Yjs 的支持，轻松实现实时协作

在 DocFlow 中，我们基于 Tiptap 构建了丰富的编辑器功能，包括：
- 代码块（支持语法高亮）
- AI 续写
- 图片上传
- 表格编辑
- 数学公式
- 流程图
- 甘特图
- YouTube/Bilibili 视频嵌入

### Yjs：实时协作引擎

Yjs 是一个基于 CRDT（无冲突复制数据类型）的实时协作框架，它解决了分布式系统中的数据一致性问题。

**CRDT 的优势**：
- **无冲突**：多个用户同时编辑时自动合并，无需冲突解决
- **离线支持**：支持离线编辑，上线后自动同步
- **最终一致性**：保证所有客户端最终达到一致状态

在 DocFlow 中，Yjs 负责：
- 文档内容的实时同步
- 用户光标位置同步
- 协作状态管理

## 核心功能

### 1. AI 续写

DocFlow 集成了强大的 AI 续写功能，用户可以通过以下方式使用：

- **快捷键触发**：按下 \`Cmd + K\` 或 \`Ctrl + K\` 打开 AI 助手
- **选区续写**：选中一段文字，让 AI 继续写作
- **智能建议**：根据上下文提供写作建议

AI 续写基于大语言模型，能够理解上下文，生成连贯、相关的内容。

### 2. RAG 知识库检索

RAG（Retrieval-Augmented Generation）技术结合了检索和生成的优势：

- **知识库管理**：上传和管理知识库文档
- **智能检索**：基于语义相似度检索相关内容
- **增强生成**：将检索到的内容融入 AI 生成中

这使得 AI 写作更加准确、专业，能够基于企业或个人的知识库生成内容。

### 3. 实时协作

DocFlow 的实时协作功能包括：

- **多人编辑**：支持多人同时编辑同一文档
- **光标同步**：实时显示其他用户的编辑位置
- **用户标识**：显示当前在线用户及其光标颜色
- **操作历史**：支持版本历史和快照功能

## 技术实现细节

### 扩展开发

DocFlow 的编辑器功能通过 Tiptap 扩展实现，每个扩展都是一个独立的模块：

\`\`\`typescript
import { Extension } from '@tiptap/core';

const AIExtension = Extension.create({
  name: 'ai',

  addCommands() {
    return {
      aiContinue: () => ({ commands }) => {
        return commands.insertContent(generatedContent);
      },
    };
  },
});
\`\`\`

### 协作同步

Yjs 的使用非常简单：

\`\`\`typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  'ws://localhost:1234',
  'room-id',
  doc
);

doc.on('update', (update) => {
});
\`\`\`

## 性能优化

DocFlow 在性能方面做了大量优化：

1. **虚拟滚动**：长文档使用虚拟滚动提升渲染性能
2. **懒加载**：图片、视频等媒体内容懒加载
3. **代码分割**：使用 Next.js 的动态导入实现代码分割
4. **SSR/ISR**：使用 Next.js 的 SSR 和 ISR 提升首屏加载速度
5. **缓存策略**：合理的缓存策略减少网络请求

## 未来规划

DocFlow 的未来发展方向包括：

- **更多 AI 功能**：AI 总结、AI 翻译、AI 语法检查等
- **插件生态**：开放插件 API，允许开发者自定义扩展
- **移动端优化**：更好的移动端体验
- **企业功能**：权限管理、审计日志、企业集成等

## 总结

DocFlow 是一个结合了实时协作和 AI 智能的下一代写作平台。通过 Tiptap 和 Yjs 的强大能力，我们构建了一个功能丰富、性能优异的编辑器。AI 续写和 RAG 知识库检索等功能，让写作变得更加智能、高效。

如果你对 DocFlow 感兴趣，欢迎访问我们的 [GitHub 仓库](https://github.com/xun082/DocFlow) 了解更多，或者直接开始使用体验。

让我们一起探索 AI 时代的写作新方式！
    `,
    date: '2024-01-15',
    readTime: '8 分钟',
    category: '产品介绍',
    tags: ['Tiptap', 'Yjs', 'AI', '协作编辑'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'tiptap-editor-guide': {
    id: 'tiptap-editor-guide',
    title: '深入理解 Tiptap 编辑器：从入门到精通',
    excerpt:
      'Tiptap 是一个基于 ProseMirror 的无头富文本编辑器框架。本文将带你深入了解 Tiptap 的核心概念、扩展系统以及如何构建自定义编辑器。',
    content: `
# 深入理解 Tiptap 编辑器：从入门到精通

## 什么是 Tiptap？

Tiptap 是一个基于 ProseMirror 的无头（headless）富文本编辑器框架。它不提供预定义的 UI，而是提供了一套强大的 API，让开发者可以完全自定义编辑器的外观和行为。

## 为什么选择 Tiptap？

### 1. 无头架构

Tiptap 的无头架构意味着：

- **完全自定义 UI**：不受限于预定义的样式
- **灵活性**：可以根据项目需求定制任何功能
- **可访问性**：可以完全控制可访问性实现

### 2. 强大的扩展系统

Tiptap 的扩展系统非常灵活：

- **内置扩展**：提供了丰富的内置扩展
- **自定义扩展**：可以轻松创建自定义扩展
- **扩展组合**：多个扩展可以组合使用

### 3. 类型安全

基于 TypeScript 构建：

- **完整的类型支持**：提供完整的类型定义
- **开发体验**：更好的 IDE 支持和代码提示
- **错误预防**：编译时类型检查

## 核心概念

### 1. Editor

Editor 是 Tiptap 的核心类，负责：

- 初始化编辑器
- 管理编辑器状态
- 提供命令接口

\`\`\`typescript
import { Editor } from '@tiptap/react';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [
    StarterKit,
    Image,
    Table,
  ],
  content: '<p>Hello World!</p>',
});
\`\`\`

### 2. Extension

Extension 是 Tiptap 的扩展机制，用于：

- 添加新的节点类型
- 添加新的标记类型
- 添加命令
- 添加键盘快捷键
- 添加插件

\`\`\`typescript
import { Extension } from '@tiptap/core';

const CustomExtension = Extension.create({
  name: 'custom',

  addOptions() {
    return {
      optionA: 'default',
    };
  },

  addCommands() {
    return {
      customCommand: () => ({ commands }) => {
        return commands.setContent('Custom content');
      },
    };
  },
});
\`\`\`

### 3. Node

Node 表示文档中的块级元素，如段落、标题、代码块等。

\`\`\`typescript
import { Node } from '@tiptap/core';

const CustomNode = Node.create({
  name: 'customNode',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'div.custom-node',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },
});
\`\`\`

## 构建自定义编辑器

### 步骤 1：安装依赖

\`\`\`bash
npm install @tiptap/react @tiptap/starter-kit
\`\`\`

### 步骤 2：创建编辑器组件

\`\`\`tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
  });

  return <EditorContent editor={editor} />;
};
\`\`\`

### 步骤 3：添加工具栏

\`\`\`tsx
const Toolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
    </div>
  );
};
\`\`\`

## 高级功能

### 1. 自定义节点

创建自定义节点来扩展编辑器功能：

\`\`\`typescript
const Callout = Node.create({
  name: 'callout',

  group: 'block',

  content: 'paragraph+',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div.callout',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'callout', ...HTMLAttributes }, 0];
  },
});
\`\`\`

### 2. 协作编辑

使用 Yjs 添加实时协作功能：

\`\`\`typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Collaboration } from '@tiptap/extension-collaboration';

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  'ws://localhost:1234',
  'room-id',
  doc
);

const editor = useEditor({
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: doc,
    }),
  ],
});
\`\`\`

## 最佳实践

### 1. 性能优化

- 使用虚拟滚动处理长文档
- 懒加载图片和媒体
- 防抖和节流用户输入
- 使用 React.memo 优化组件渲染

### 2. 可访问性

- 添加适当的 ARIA 属性
- 支持键盘导航
- 提供屏幕阅读器支持
- 确保足够的颜色对比度

### 3. 测试

- 单元测试扩展功能
- 集成测试编辑器交互
- E2E 测试完整流程
- 性能测试大文档处理

## 总结

Tiptap 是一个强大且灵活的富文本编辑器框架。通过其无头架构和扩展系统，你可以构建完全符合需求的编辑器。无论是简单的文本编辑还是复杂的协作编辑，Tiptap 都能提供强大的支持。

开始使用 Tiptap，探索无限可能！
    `,
    date: '2024-01-10',
    readTime: '12 分钟',
    category: '技术教程',
    tags: ['Tiptap', '编辑器', 'React', 'TypeScript'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'real-time-collaboration': {
    id: 'real-time-collaboration',
    title: '实时协作技术深度解析：从 CRDT 到 Yjs',
    excerpt: '深入了解实时协作的核心技术 CRDT，以及如何使用 Yjs 构建实时协作应用。',
    content: `
# 实时协作技术深度解析：从 CRDT 到 Yjs

## 引言

随着远程工作和在线协作的普及，实时协作应用变得越来越重要。Google Docs、Figma、Notion 等应用的成功，证明了实时协作的价值。

本文将深入探讨实时协作的核心技术——CRDT（无冲突复制数据类型），以及如何使用 Yjs 框架构建实时协作应用。

## 什么是 CRDT？

CRDT（Conflict-free Replicated Data Types）是一种数据结构，它允许在分布式系统中进行无冲突的复制和更新。

### CRDT 的核心特性

1. **无冲突**：多个用户同时编辑时自动合并，无需冲突解决
2. **离线支持**：支持离线编辑，上线后自动同步
3. **最终一致性**：保证所有客户端最终达到一致状态
4. **可组合性**：多个 CRDT 可以组合使用

### CRDT 的类型

CRDT 主要分为两类：

1. **基于状态的 CRDT（CvRDT）**：
   - 每个操作生成一个新的状态
   - 合并操作需要交换完整状态
   - 适合小规模数据

2. **基于操作的 CRDT（CmRDT）**：
   - 每个操作生成一个操作记录
   - 合并操作只需要交换操作记录
   - 适合大规模数据

## Yjs 简介

Yjs 是一个基于 CRDT 的实时协作框架，它提供了：

- **多种数据类型**：支持多种 CRDT 数据类型
- **多平台支持**：支持 JavaScript、TypeScript、Python 等多种语言
- **易于集成**：可以轻松集成到现有应用中
- **性能优异**：优化的数据结构和算法

### Yjs 的核心概念

#### 1. Document

Document 是 Yjs 的核心数据结构，类似于一个数据库：

\`\`\`typescript
import * as Y from 'yjs';

const doc = new Y.Doc();
\`\`\`

#### 2. 数据类型

Yjs 提供了多种数据类型：

\`\`\`typescript
const text = doc.getText('content');
const array = doc.getArray('items');
const map = doc.getMap('metadata');
\`\`\`

#### 3. Provider

Provider 负责在不同客户端之间同步数据：

\`\`\`typescript
import { WebsocketProvider } from 'y-websocket';

const provider = new WebsocketProvider(
  'ws://localhost:1234',
  'room-id',
  doc
);
\`\`\`

## 构建实时协作应用

### 步骤 1：设置 Yjs 文档

\`\`\`typescript
import * as Y from 'yjs';

const doc = new Y.Doc();
const text = doc.getText('content');
\`\`\`

### 步骤 2：监听变化

\`\`\`typescript
text.observe((event, transaction) => {
  console.log('Text changed:', text.toString());
});
\`\`\`

### 步骤 3：连接到服务器

\`\`\`typescript
import { WebsocketProvider } from 'y-websocket';

const provider = new WebsocketProvider(
  'ws://localhost:1234',
  'room-id',
  doc
);

provider.on('sync', (isSynced) => {
  console.log('Synced:', isSynced);
});
\`\`\`

### 步骤 4：集成到编辑器

\`\`\`typescript
import { useEditor } from '@tiptap/react';
import { Collaboration } from '@tiptap/extension-collaboration';

const editor = useEditor({
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: doc,
    }),
  ],
});
\`\`\`

## 高级功能

### 1. 感知（Awareness）

Awareness 用于同步用户状态，如光标位置、选区等：

\`\`\`typescript
import { Awareness } from 'y-protocols/awareness';

const awareness = new Awareness(doc);

awareness.setLocalStateField('user', {
  name: 'John',
  color: '#ff0000',
});

awareness.on('change', () => {
  const states = Array.from(awareness.getStates().values());
  console.log('Users:', states);
});
\`\`\`

### 2. 权限控制

实现权限控制：

\`\`\`typescript
const canEdit = (user) => {
  return user.role === 'editor';
};

text.observe((event, transaction) => {
  const user = transaction.origin;
  if (!canEdit(user)) {
    transaction.origin.undo();
  }
});
\`\`\`

### 3. 历史记录

实现历史记录功能：

\`\`\`typescript
import { UndoManager } from 'yjs';

const undoManager = new UndoManager(text);

undoManager.undo();
undoManager.redo();
\`\`\`

## 性能优化

### 1. 压缩数据

使用压缩算法减少数据传输：

\`\`\`typescript
import { applyUpdate } from 'yjs';
import * as lz4 from 'lz4';

const compressed = lz4.encode(update);
const decompressed = lz4.decode(compressed);
applyUpdate(doc, decompressed);
\`\`\`

### 2. 批量更新

批量处理更新：

\`\`\`typescript
doc.transact(() => {
  text.insert(0, 'Hello');
  text.insert(5, ' World');
});
\`\`\`

### 3. 延迟同步

延迟同步以减少网络请求：

\`\`\`typescript
let timeout;
text.observe(() => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
  }, 1000);
});
\`\`\`

## 最佳实践

### 1. 错误处理

\`\`\`typescript
provider.on('connection-error', (error) => {
  console.error('Connection error:', error);
});

provider.on('sync', (isSynced) => {
  if (!isSynced) {
    console.error('Sync failed');
  }
});
\`\`\`

### 2. 离线支持

\`\`\`typescript
const isOnline = navigator.onLine;

window.addEventListener('online', () => {
  provider.connect();
});

window.addEventListener('offline', () => {
  provider.disconnect();
});
\`\`\`

### 3. 数据持久化

\`\`\`typescript
const saveData = () => {
  const state = Y.encodeStateAsUpdate(doc);
  localStorage.setItem('doc', state);
};

const loadData = () => {
  const state = localStorage.getItem('doc');
  if (state) {
    Y.applyUpdate(doc, state);
  }
};
\`\`\`

## 总结

Yjs 是一个强大且易用的实时协作框架。通过 CRDT 技术，它实现了无冲突的实时协作。无论是构建文档编辑器、白板应用还是其他协作工具，Yjs 都能提供强大的支持。

开始使用 Yjs，构建你的实时协作应用！
    `,
    date: '2024-01-05',
    readTime: '15 分钟',
    category: '技术教程',
    tags: ['Yjs', 'CRDT', '实时协作', '分布式系统'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'ai-writing-assistant': {
    id: 'ai-writing-assistant',
    title: 'AI 写作助手：如何利用大语言模型提升写作效率',
    excerpt: '探索如何将大语言模型集成到写作工具中，提供智能续写、语法检查、内容优化等功能。',
    content: `
# AI 写作助手：如何利用大语言模型提升写作效率

## 引言

随着大语言模型（LLM）的发展，AI 写作助手变得越来越强大。从简单的语法检查到智能续写，AI 正在改变我们的写作方式。

本文将探讨如何将大语言模型集成到写作工具中，提供智能续写、语法检查、内容优化等功能。

## AI 写作助手的核心功能

### 1. 智能续写

智能续写是 AI 写作助手最核心的功能之一：

- **上下文理解**：理解当前文档的上下文
- **风格一致性**：保持与原文一致的写作风格
- **内容连贯性**：生成连贯、相关的内容

### 2. 语法检查

AI 可以检测和纠正语法错误：

- **语法错误**：检测并纠正语法错误
- **拼写错误**：检测并纠正拼写错误
- **标点错误**：优化标点符号的使用

### 3. 内容优化

AI 可以帮助优化内容：

- **表达优化**：提供更好的表达方式
- **结构优化**：优化文章结构
- **逻辑优化**：优化文章逻辑

### 4. 多语言支持

AI 可以支持多种语言：

- **翻译**：将内容翻译成其他语言
- **本地化**：根据目标语言调整内容
- **多语言写作**：支持多语言写作

## 技术实现

### 1. API 集成

集成大语言模型 API：

\`\`\`typescript
async function generateContent(prompt: string) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data.content;
}
\`\`\`

### 2. 上下文提取

提取文档上下文：

\`\`\`typescript
function extractContext(editor, maxLength = 2000) {
  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(
    Math.max(0, from - maxLength),
    to
  );
  return text;
}
\`\`\`

### 3. 提示词工程

设计有效的提示词：

\`\`\`typescript
function buildPrompt(context, instruction) {
  return \`
以下是一段文档内容：

\${context}

请根据以上内容，\${instruction}
  \`;
}
\`\`\`

## 高级功能

### 1. RAG 知识库检索

结合知识库检索：

\`\`\`typescript
async function retrieveRelevantContent(query: string) {
  const response = await fetch('/api/knowledge/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data.results;
}
\`\`\`

### 2. 个性化建议

基于用户历史提供个性化建议：

\`\`\`typescript
async function getPersonalizedSuggestions(userId: string) {
  const response = await fetch('/api/ai/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  const data = await response.json();
  return data.suggestions;
}
\`\`\`

### 3. 批量处理

批量处理文档：

\`\`\`typescript
async function batchProcess(documents: string[]) {
  const results = await Promise.all(
    documents.map(async (doc) => {
      const suggestions = await getAISuggestions(doc);
      return { document: doc, suggestions };
    })
  );

  return results;
}
\`\`\`

## 最佳实践

### 1. 性能优化

- **缓存**：缓存 AI 响应，减少重复请求
- **批处理**：批量处理多个请求
- **流式响应**：使用流式响应提升用户体验

### 2. 错误处理

- **重试机制**：实现自动重试机制
- **降级策略**：在 AI 服务不可用时提供降级方案
- **用户反馈**：收集用户反馈以改进 AI 模型

### 3. 隐私保护

- **数据脱敏**：在发送给 AI 之前脱敏敏感信息
- **本地处理**：尽可能在本地处理数据
- **用户控制**：让用户控制是否使用 AI 功能

## 总结

AI 写作助手通过大语言模型的能力，为写作提供了强大的支持。从智能续写到语法检查，从内容优化到多语言支持，AI 正在改变我们的写作方式。

开始使用 AI 写作助手，提升你的写作效率！
    `,
    date: '2024-01-01',
    readTime: '10 分钟',
    category: '技术教程',
    tags: ['AI', '大语言模型', '写作助手', '自然语言处理'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'performance-optimization': {
    id: 'performance-optimization',
    title: 'Next.js 应用性能优化实战指南',
    excerpt: '深入探讨 Next.js 应用的性能优化策略，包括代码分割、图片优化、缓存策略等。',
    content: `
# Next.js 应用性能优化实战指南

## 引言

性能是现代 Web 应用的核心竞争力之一。一个快速、流畅的应用不仅能提升用户体验，还能提高转化率和用户留存率。

本文将深入探讨 Next.js 应用的性能优化策略，帮助你构建高性能的 Web 应用。

## 核心优化策略

### 1. 代码分割

代码分割是提升应用性能的关键技术：

#### 动态导入

使用 Next.js 的动态导入功能：

\`\`\`tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
\`\`\`

#### 路由级分割

Next.js 自动为每个路由创建独立的代码包：

- 每个页面都是独立的代码包
- 按需加载，减少初始加载时间
- 优化缓存策略

### 2. 图片优化

图片优化对性能影响巨大：

#### 使用 next/image

\`\`\`tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
\`\`\`

#### 优化策略

- **懒加载**：非首屏图片懒加载
- **响应式**：根据设备尺寸提供合适大小的图片
- **格式优化**：使用 WebP、AVIF 等现代格式
- **压缩**：适当压缩图片质量

### 3. 缓存策略

合理的缓存策略能显著提升性能：

#### 浏览器缓存

\`\`\`ts
export const config = {
  runtime: 'experimental-edge',
  regions: ['iad1'],
};

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
  res.json({ data: 'Hello' });
}
\`\`\`

#### CDN 缓存

- 使用 CDN 加速静态资源
- 配置合适的缓存头
- 利用 CDN 边缘缓存

### 4. 数据获取优化

优化数据获取策略：

#### 增量静态再生（ISR）

\`\`\`tsx
export async function getStaticProps() {
  const data = await fetchData();

  return {
    props: { data },
    revalidate: 60,
  };
}
\`\`\`

#### 服务端渲染（SSR）

\`\`\`tsx
export async function getServerSideProps() {
  const data = await fetchData();

  return {
    props: { data },
  };
}
\`\`\`

### 5. 字体优化

字体优化对首屏渲染影响很大：

#### 使用 next/font

\`\`\`tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {children}
    </html>
  );
}
\`\`\`

#### 优化策略

- **字体子集化**：只加载需要的字符
- **字体显示策略**：使用 font-display: swap
- **预加载**：预加载关键字体

## 性能监控

### 1. Web Vitals

监控核心 Web Vitals 指标：

\`\`\`tsx
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
  });

  return null;
}
\`\`\`

### 2. 性能分析

使用 Next.js 内置的性能分析工具：

\`\`\`bash
ANALYZE=true npm run build
\`\`\`

## 最佳实践

### 1. 减少重渲染

- 使用 React.memo 优化组件
- 合理使用 useMemo 和 useCallback
- 避免不必要的 state 更新

### 2. 优化网络请求

- 合并请求
- 使用 HTTP/2
- 启用压缩

### 3. 优化 DOM 操作

- 虚拟化长列表
- 避免强制同步布局
- 使用 CSS 动画而非 JS 动画

## 总结

性能优化是一个持续的过程。通过代码分割、图片优化、缓存策略等技术，你可以显著提升 Next.js 应用的性能。

记住，性能优化的关键是测量、分析、优化、再测量的循环过程。

开始优化你的 Next.js 应用吧！
    `,
    date: '2023-12-28',
    readTime: '14 分钟',
    category: '技术教程',
    tags: ['Next.js', '性能优化', '前端', 'Web 性能'],
    author: {
      name: 'DocFlow Team',
    },
  },
  'design-system': {
    id: 'design-system',
    title: '构建可扩展的设计系统：从组件到模式',
    excerpt: '学习如何构建一个可扩展、可维护的设计系统，包括组件库、设计令牌、文档等。',
    content: `
# 构建可扩展的设计系统：从组件到模式

## 引言

设计系统是现代产品开发的核心基础设施。一个良好的设计系统不仅能提升开发效率，还能确保产品的一致性和可维护性。

本文将带你深入了解如何构建一个可扩展、可维护的设计系统。

## 设计系统的核心要素

### 1. 设计令牌（Design Tokens）

设计令牌是设计系统的基础：

#### 颜色令牌

\`\`\`css
:root {
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
}
\`\`\`

#### 间距令牌

\`\`\`css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
\`\`\`

#### 排版令牌

\`\`\`css
:root {
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
\`\`\`

### 2. 基础组件

构建可复用的基础组件：

#### Button 组件

\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={\`\${baseStyles} \${variantStyles[variant]} \${sizeStyles[size]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
\`\`\`

#### Input 组件

\`\`\`tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={\`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary \${error ? 'border-red-500' : 'border-gray-300'}\`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
\`\`\`

### 3. 复合组件

构建更复杂的复合组件：

#### Card 组件

\`\`\`tsx
interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ title, children, footer }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          {footer}
        </div>
      )}
    </div>
  );
}
\`\`\`

### 4. 文档系统

完善的文档系统是设计系统的关键：

#### 组件文档

\`\`\`tsx
export default function ButtonDocs() {
  return (
    <div>
      <h1>Button 组件</h1>
      <p>Button 组件用于触发操作或导航。</p>

      <h2>使用示例</h2>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>

      <h2>API</h2>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>variant</td>
            <td>'primary' | 'secondary' | 'ghost'</td>
            <td>'primary'</td>
            <td>按钮样式变体</td>
          </tr>
          <tr>
            <td>size</td>
            <td>'sm' | 'md' | 'lg'</td>
            <td>'md'</td>
            <td>按钮大小</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
\`\`\`

## 最佳实践

### 1. 一致性

- 统一的命名规范
- 一致的 API 设计
- 标准化的组件结构

### 2. 可访问性

- 遵循 WCAG 标准
- 支持键盘导航
- 提供适当的 ARIA 属性

### 3. 可维护性

- 清晰的代码结构
- 完善的类型定义
- 详细的文档说明

### 4. 可扩展性

- 模块化的组件设计
- 灵活的配置选项
- 插件化的扩展机制

## 工具和框架

### 1. Storybook

Storybook 是构建组件文档的强大工具：

\`\`\`tsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} as ComponentMeta<typeof Button>;

export const Primary: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Primary Button</Button>
);

Primary.args = {
  variant: 'primary',
  size: 'md',
};
\`\`\`

### 2. Figma

Figma 是设计协作的理想工具：

- 创建设计令牌库
- 设计组件原型
- 与开发团队协作

### 3. Chromatic

Chromatic 用于可视化测试：

- 自动捕获组件快照
- 检测视觉回归
- 集成到 CI/CD 流程

## 总结

构建一个可扩展的设计系统需要时间和耐心。通过设计令牌、基础组件、复合组件和完善的文档系统，你可以创建一个强大且易用的设计系统。

记住，设计系统是一个持续演进的过程，需要不断地优化和改进。

开始构建你的设计系统吧！
    `,
    date: '2023-12-20',
    readTime: '16 分钟',
    category: '技术教程',
    tags: ['设计系统', '组件库', 'UI/UX', '前端开发'],
    author: {
      name: 'DocFlow Team',
    },
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const postId = params.id as string;
    setPost(blogPosts[postId] || null);
  }, [params.id]);

  if (!isMounted) {
    return null;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <Header isLoggedIn={false} onGetStarted={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">文章未找到</h1>
          <Link href="/blog" className="text-violet-400 hover:text-violet-300">
            返回博客列表
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header isLoggedIn={false} onGetStarted={() => {}} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回博客
        </Link>

        <article className="prose prose-invert prose-lg max-w-none">
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="px-2 py-1 bg-violet-600/20 text-violet-400 rounded-full text-xs">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
              {post.title}
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">{post.excerpt}</p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-violet-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
