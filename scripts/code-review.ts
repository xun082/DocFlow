#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

class CodeReviewer {
  private apiKey: string;
  private baseUrl = 'https://api.siliconflow.cn/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.SILICONFLOW_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('SILICONFLOW_API_KEY environment variable is required');
    }
  }

  async reviewCode(prNumber: string, baseSha: string, headSha: string): Promise<string> {
    console.log(`🔍 开始审查 PR #${prNumber}...`);

    // 获取变更的文件
    const changedFiles = this.getChangedFiles(baseSha, headSha);
    console.log(`📁 发现 ${changedFiles.length} 个变更文件`);

    if (changedFiles.length === 0) {
      return `## 🤖 AI 代码审查报告

### 📊 总体评估
没有发现需要审查的代码变更

### 📝 总结
PR 中没有包含需要审查的代码文件

---
*此评论由 DeepSeek AI 自动生成*`;
    }

    // 获取代码差异
    const diff = this.getDiff(baseSha, headSha);
    console.log(`📝 获取到 ${diff.length} 行代码差异`);

    // 分析代码
    const analysis = await this.analyzeCode(changedFiles, diff);
    console.log(`✅ 代码分析完成`);

    return analysis;
  }

  private getChangedFiles(baseSha: string, headSha: string): string[] {
    try {
      console.log(`🔍 计算变更文件 (基准: ${baseSha} → 头部: ${headSha})`);

      const command = `git diff --name-only ${baseSha} ${headSha}`;
      console.log(`🔍 执行命令: ${command}`);

      const output: string = execSync(command, { encoding: 'utf-8' }) as unknown as string;

      const allFiles: string[] = output.split('\n').filter((file: string) => file.trim());

      console.log(`📁 所有变更文件: ${allFiles.join(', ')}`);

      const filteredFiles: string[] = allFiles.filter((file: string) => {
        // 只忽略 pnpm-lock.yaml 文件，其他文件都进行审查
        if (file === 'pnpm-lock.yaml') {
          console.log(`🚫 忽略文件: ${file}`);

          return false;
        }

        return true; // 审查所有其他文件
      });

      console.log(`📁 过滤后的文件: ${filteredFiles.join(', ')}`);

      return filteredFiles;
    } catch (error) {
      console.error('获取变更文件失败:', error);
      console.error('错误详情:', error instanceof Error ? error.message : String(error));

      return [];
    }
  }

  private getDiff(baseSha: string, headSha: string): string {
    try {
      const command = `git diff ${baseSha} ${headSha}`;
      console.log(`🔍 获取提交差异: ${command}`);

      return execSync(command, { encoding: 'utf-8' });
    } catch (error) {
      console.error('获取代码差异失败:', error);
      console.error('错误详情:', error instanceof Error ? error.message : String(error));

      return '';
    }
  }

  private async analyzeCode(files: string[], diff: string): Promise<string> {
    const prompt = this.buildPrompt(files, diff);

    try {
      const response = await this.callDeepSeekAPI(prompt);

      return response;
    } catch (error) {
      console.error('AI 分析失败:', error);

      return `## 🤖 AI 代码审查报告

### 📊 总体评估
代码审查过程中发生错误，请检查配置

### ⚠️ 需要关注的问题

#### 🟠 一般问题
- **系统错误**: 无法完成 AI 代码审查
  - 💡 建议: 请检查 SILICONFLOW_API_KEY 配置

### 📝 总结
审查失败，请重试

---
*此评论由 DeepSeek AI 自动生成*`;
    }
  }

  private buildPrompt(files: string[], diff: string): string {
    return `你是一位资深的代码审查专家，专精于 DocFlow 项目技术栈：Next.js 15 + React 19 + TypeScript + Tiptap + Yjs 协同编辑。

## 🎯 DocFlow 项目审查重点

### 1. 📋 Next.js App Router 规范
- **路由结构**: 检查 app/ 目录下的路由组织是否符合 App Router 规范
- **组件分层**: 
  - app/[route]/_components/ → 页面级私有组件（不导出到全局）
  - components/ → 全局可复用组件
  - utils/ → 纯函数工具库
- **服务端组件**: 优先使用服务端组件，客户端组件需要 'use client' 标记
- **数据获取**: 使用 fetch、Server Actions，避免 API Routes
- **中间件**: 检查 middleware.ts 中的路由保护逻辑

### 2. ⚛️ React 19 + TypeScript 最佳实践
- **函数组件**: 只使用函数组件，禁用类组件
- **Hooks 规范**: 检查 Hooks 使用是否符合 React 19 规范
- **类型安全**: 所有 props、state、返回值必须严格类型化
- **避免 any**: 优先使用 unknown 而非 any
- **性能优化**: 避免不必要的 useMemo/useCallback，优先组件拆分

### 3. 🎨 Tiptap 编辑器集成
- **扩展使用**: 检查 Tiptap 扩展的配置和使用是否合理
- **协同编辑**: Yjs + @hocuspocus/provider 的集成是否正确
- **插件开发**: 自定义 Tiptap 扩展的代码质量
- **编辑器状态**: 状态管理和同步逻辑是否健壮
- **性能优化**: 大文档编辑时的性能考虑

### 4. 🎨 样式架构 (Tailwind CSS)
- **CSS 加载策略**: 
  - global.css → 全局样式（首页加载）
  - index.css → 编辑器样式（仅 /docs 路由加载）
- **Tailwind 使用**: 优先使用工具类，避免自定义 CSS
- **响应式设计**: 移动端适配和断点使用
- **主题系统**: 深色模式切换和主题变量使用

### 5. 🔧 代码质量规范
- **ESLint 规则**: 检查是否符合项目 ESLint 配置
- **Prettier 格式**: 代码格式是否符合 Prettier 规范
- **导入顺序**: 按照 ESLint import/order 规则组织导入
- **命名规范**: 
  - PascalCase → 组件、类型、枚举
  - camelCase → 变量、函数、Hooks
  - kebab-case → 文件名
- **注释规范**: 复杂逻辑需要清晰注释

### 6. 🔒 安全性检查
- **环境变量**: 敏感信息是否正确使用环境变量
- **XSS 防护**: 用户输入的安全处理
- **CSRF 防护**: API 调用的安全考虑
- **依赖安全**: 检查依赖包的安全漏洞

### 7. ⚡ 性能优化
- **代码分割**: Next.js 自动代码分割的使用
- **图片优化**: Next.js Image 组件的正确使用
- **包大小**: 检查是否引入了不必要的依赖
- **缓存策略**: 静态资源和 API 的缓存配置

### 8. 🏗️ 架构设计
- **状态管理**: Zustand 的使用是否合理
- **文件组织**: 是否符合项目的文件结构规范
- **模块耦合**: 组件间的依赖关系是否合理
- **可测试性**: 代码是否便于单元测试

## 📝 审查报告格式

请严格按照以下 Markdown 格式返回代码审查报告，不要使用 JSON 格式，直接返回 Markdown 文本：

## 🤖 AI 代码审查报告

### 📊 总体评估
**代码质量**: [优秀/良好/一般/需要改进]  
**架构设计**: [优秀/良好/一般/需要改进]  
**安全性**: [优秀/良好/一般/需要改进]  
**性能**: [优秀/良好/一般/需要改进]  
**DocFlow 规范**: [优秀/良好/一般/需要改进]  

**整体评价**: [简要总结代码变更的整体质量]

### ⚠️ 需要关注的问题

#### 🔴 严重问题 (必须修复)
- **[问题标题]**: [具体问题描述]
  - 📍 **位置**: [文件路径:行号]
  - 💡 **建议**: [具体修复建议]
  - 🔧 **示例**: [修复代码示例]

#### 🟡 重要问题 (建议修复)
- **[问题标题]**: [具体问题描述]
  - 📍 **位置**: [文件路径:行号]
  - 💡 **建议**: [具体修复建议]

#### 🟠 一般问题 (可选修复)
- **[问题标题]**: [具体问题描述]
  - 💡 **建议**: [改进建议]

#### 🟢 轻微问题 (代码风格)
- **[问题标题]**: [具体问题描述]
  - 💡 **建议**: [改进建议]

### ✅ 代码亮点
- **[亮点标题]**: [具体描述值得表扬的地方]

### 💡 DocFlow 特定建议
- **[建议标题]**: [针对 DocFlow 项目的具体改进建议]

### 📋 检查清单
- [ ] 所有严重问题已修复
- [ ] TypeScript 类型检查通过 (pnpm type-check)
- [ ] ESLint 检查通过 (pnpm lint)
- [ ] Prettier 格式化完成 (pnpm format)
- [ ] Next.js 构建成功 (pnpm build)
- [ ] 组件分层符合规范
- [ ] Tiptap 集成正确
- [ ] 样式架构符合要求

### 📝 总结
[总结本次代码审查的要点，包括主要问题和建议]

---
*此评论由 DeepSeek AI 自动生成*

## 📁 代码变更详情

**变更文件 (${files.length} 个):**
${files.map((file) => `- \`${file}\``).join('\n')}

**代码差异:**
\`\`\`diff
${diff}
\`\`\`

请进行专业、详细的代码审查，重点关注 DocFlow 项目的技术栈特点和架构规范，提供具体的改进建议和代码示例。

**重要提醒：请直接返回 Markdown 格式的审查报告，不要使用 JSON 格式包装！**`;
  }

  private async callDeepSeekAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1',
          messages: [
            {
              role: 'system',
              content:
                '你是一位专业的代码审查专家，请严格按照要求的 Markdown 格式返回审查结果。不要使用 JSON 格式，直接返回纯 Markdown 文本。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API 响应格式错误');
      }

      return data.choices[0].message.content || '';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`DeepSeek API 调用失败: ${error.message}`);
      }

      throw new Error('DeepSeek API 调用失败: 未知错误');
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('用法: tsx code-review.ts <PR_NUMBER> <BASE_SHA> <HEAD_SHA>');
    process.exit(1);
  }

  const [prNumber, baseSha, headSha] = args;

  try {
    const reviewer = new CodeReviewer();
    const markdown = await reviewer.reviewCode(prNumber, baseSha, headSha);

    // 保存报告到文件
    const reportPath = join(process.cwd(), 'code-review-report.md');
    writeFileSync(reportPath, markdown);

    console.log('✅ 代码审查完成');
    console.log(`📄 报告已保存到: ${reportPath}`);

    // 输出到标准输出，供 GitHub Actions 使用
    console.log('\n---REPORT_START---');
    console.log(markdown);
    console.log('---REPORT_END---');
  } catch (error) {
    console.error('❌ 代码审查失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { CodeReviewer };
