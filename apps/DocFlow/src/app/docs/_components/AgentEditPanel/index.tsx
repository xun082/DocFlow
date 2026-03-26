'use client';

import { useRef, useState, useCallback, KeyboardEvent, useEffect } from 'react';
import {
  Send,
  Square,
  CheckCheck,
  XCircle,
  Check,
  X,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Wand2,
  User,
  Lightbulb,
  AlertCircle,
  Plus,
  Copy,
  CopyCheck,
  Cpu,
  MapPin,
  Sparkles,
  BrainCircuit,
  Code2,
} from 'lucide-react';

import { cn } from '@/utils';
import { useDocumentEdit, type EditPhase, type PendingProposal } from '@/hooks/useDocumentEdit';
import { useEditorStore } from '@/stores/editorStore';
import type { AgentIntent, AgentAnchor } from '@/services/collaboration';

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── ThinkingBlock: collapsible reasoning trace ───────────────────────────────

function ThinkingBlock({
  text,
  isStreaming,
  defaultOpen = true,
}: {
  text: string;
  isStreaming: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!text && !isStreaming) return null;

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left"
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isStreaming ? (
            <Spinner className="w-3 h-3 text-violet-500 shrink-0" />
          ) : (
            <BrainCircuit className="w-3 h-3 text-violet-400 shrink-0" />
          )}
          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">
            思考过程
          </span>
          {isStreaming && (
            <span className="text-[10px] text-violet-400 animate-pulse ml-1">生成中...</span>
          )}
          {!isStreaming && text && (
            <span className="text-[10px] text-violet-400 ml-auto">{text.length} 字符</span>
          )}
        </div>
        {open ? (
          <ChevronDown className="w-3 h-3 text-violet-300 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-violet-300 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-2.5 border-t border-violet-100">
          {text ? (
            <pre className="mt-2 text-[10.5px] font-mono leading-relaxed text-violet-700/80 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {text}
              {isStreaming && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '10px',
                    background: '#7c3aed',
                    marginLeft: '1px',
                    verticalAlign: 'middle',
                    animation: 'blink 0.8s step-end infinite',
                  }}
                />
              )}
            </pre>
          ) : (
            <p className="mt-2 text-[10.5px] text-violet-400 italic">等待思考...</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── StreamingBlock: live / collapsible JSON output ───────────────────────────

function StreamingBlock({
  text,
  isStreaming,
  collapsible = false,
  defaultOpen = true,
  className,
}: {
  text: string;
  isStreaming: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const highlight = (raw: string): string => {
    const escaped = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return escaped
      .replace(/"([^"]+)"(\s*:)/g, '<span style="color:#79c0ff">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:#a5d6ff">"$1"</span>')
      .replace(/:\s*(\d+(\.\d+)?)/g, ': <span style="color:#ffa657">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span style="color:#d2a8ff">$1</span>');
  };

  if (!text) return null;

  const cursor = isStreaming
    ? '<span style="display:inline-block;width:2px;height:11px;background:#58a6ff;margin-left:1px;vertical-align:middle;animation:blink 0.8s step-end infinite"></span>'
    : '';

  const codeBlock = (
    <div className="relative group">
      {!isStreaming && (
        <button
          onClick={handleCopy}
          className="absolute top-1.5 right-1.5 z-10 p-1 rounded text-[#8b949e] hover:text-[#c9d1d9] opacity-0 group-hover:opacity-100 transition-opacity"
          title="复制"
        >
          {copied ? (
            <CopyCheck className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
      <pre
        className="text-[11px] font-mono leading-relaxed px-3 py-2.5 overflow-x-auto whitespace-pre-wrap break-all max-h-72 overflow-y-auto"
        style={{ background: '#0d1117', color: '#c9d1d9' }}
        dangerouslySetInnerHTML={{ __html: highlight(text) + cursor }}
      />
    </div>
  );

  if (collapsible) {
    return (
      <div
        className={cn('rounded-lg border border-[#30363d] overflow-hidden', className)}
        style={{ background: '#0d1117' }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Code2 className="w-3 h-3 text-[#8b949e]" />
            <span className="text-[10px] font-medium text-[#8b949e]">
              原始输出 · {text.length} 字符
            </span>
          </div>
          {open ? (
            <ChevronDown className="w-3 h-3 text-[#8b949e]" />
          ) : (
            <ChevronRight className="w-3 h-3 text-[#8b949e]" />
          )}
        </button>
        {open && <div className="border-t border-[#21262d]">{codeBlock}</div>}
      </div>
    );
  }

  return <div className={cn('rounded-lg overflow-hidden', className)}>{codeBlock}</div>;
}

// ─── Step Row ─────────────────────────────────────────────────────────────────
//
// Always-visible step with streaming content.
// When active  → thinking/output shown live (expanded).
// When done    → thinking/output frozen and collapsed (click to expand).

type StepStatus = 'pending' | 'active' | 'done' | 'error';

interface StepRowProps {
  stepNum: number;
  title: string;
  icon: React.ReactNode;
  status: StepStatus;
  /** Thinking text: live when active, frozen when done */
  thinkingText?: string;
  /** Raw JSON output: live when active, frozen when done */
  streamingText?: string;
  isCurrentlyStreaming?: boolean;
  children?: React.ReactNode;
}

function StepRow({
  stepNum,
  title,
  icon,
  status,
  thinkingText,
  streamingText,
  isCurrentlyStreaming,
  children,
}: StepRowProps) {
  const isActive = status === 'active';
  const isDone = status === 'done';
  const isError = status === 'error';
  const isPending = status === 'pending';

  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        isActive && 'border-indigo-200 bg-indigo-50/40 shadow-sm',
        isDone && 'border-gray-100 bg-white',
        isError && 'border-red-200 bg-red-50/20',
        isPending && 'border-gray-100 bg-gray-50/40 opacity-50',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
            isActive && 'bg-indigo-100',
            isDone && 'bg-emerald-100',
            isError && 'bg-red-100',
            isPending && 'bg-gray-100',
          )}
        >
          {isActive && <Spinner className="w-3 h-3 text-indigo-600" />}
          {isDone && <Check className="w-3 h-3 text-emerald-600" />}
          {isError && <X className="w-3 h-3 text-red-500" />}
          {isPending && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
        </div>

        <span
          className={cn(
            'w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0',
            isActive && 'bg-indigo-500 text-white',
            isDone && 'bg-gray-200 text-gray-500',
            isError && 'bg-red-500 text-white',
            isPending && 'bg-gray-100 text-gray-300',
          )}
        >
          {stepNum}
        </span>

        <span
          className={cn(
            'flex items-center gap-1.5 text-xs font-semibold flex-1',
            isActive && 'text-indigo-700',
            isDone && 'text-gray-700',
            isError && 'text-red-700',
            isPending && 'text-gray-400',
          )}
        >
          {icon}
          {title}
        </span>

        {isActive && (
          <span className="text-[10px] text-indigo-400 font-medium animate-pulse shrink-0">
            进行中
          </span>
        )}
        {isDone && <span className="text-[10px] text-emerald-500 font-medium shrink-0">完成</span>}
        {isError && <span className="text-[10px] text-red-400 font-medium shrink-0">失败</span>}
      </div>

      {/* Body */}
      {(isActive || isDone || isError) && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-gray-100/80">
          {/* Thinking block */}
          {(thinkingText || (isActive && isCurrentlyStreaming)) && (
            <div className="pt-2">
              <ThinkingBlock
                text={thinkingText ?? ''}
                isStreaming={isActive && !!isCurrentlyStreaming && !streamingText}
                defaultOpen={isActive}
              />
            </div>
          )}

          {/* Raw output */}
          {streamingText && (
            <StreamingBlock
              text={streamingText}
              isStreaming={isActive && !!isCurrentlyStreaming}
              collapsible={isDone || isError}
              defaultOpen={isActive}
              className="mt-1"
            />
          )}

          {/* Waiting placeholder */}
          {isActive && !thinkingText && !streamingText && (
            <div className="pt-2 flex items-center gap-2">
              <Spinner className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-gray-400">等待模型响应...</span>
            </div>
          )}

          {/* Structured result / error */}
          {children && <div className="pt-1">{children}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLE_COMMANDS = [
  '在文档末尾加一个总结',
  '优化开头第一段，使其更吸引人',
  '在标题后面插入一段引言',
  '将最后一段改写得更简洁',
];

const INSERT_MODE_LABELS: Record<string, { label: string; color: string }> = {
  replace: { label: '替换', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  before: { label: '插入前', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  after: { label: '插入后', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  append: { label: '追加末尾', color: 'text-violet-600 bg-violet-50 border-violet-200' },
};

const TARGET_MODE_LABELS: Record<string, string> = {
  document_end: '文档末尾',
  document_start: '文档开头',
  after_heading: '标题之后',
  before_heading: '标题之前',
  replace_node: '替换节点',
  custom: '自定义位置',
};

// ─── Structured result content ────────────────────────────────────────────────

function IntentContent({ intent }: { intent: AgentIntent }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center text-[11px] font-mono bg-violet-100 text-violet-700 border border-violet-200 rounded-md px-2 py-0.5">
          {intent.action}
        </span>
        <span className="inline-flex items-center text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200 rounded-md px-2 py-0.5">
          {TARGET_MODE_LABELS[intent.target.mode] ?? intent.target.mode}
        </span>
        {(intent.target as { heading?: string }).heading && (
          <span className="inline-flex items-center text-[11px] font-mono bg-amber-50 text-amber-700 border border-amber-200 rounded-md px-2 py-0.5">
            &ldquo;{(intent.target as { heading?: string }).heading}&rdquo;
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{intent.description}</p>
    </div>
  );
}

function AnchorContent({ anchor }: { anchor: AgentAnchor }) {
  const modeStyle = INSERT_MODE_LABELS[anchor.insertMode] ?? {
    label: anchor.insertMode,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400">节点 ID</span>
        <code className="text-[11px] font-mono bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 truncate max-w-[160px]">
          {anchor.anchorNodeId ?? '(文档末尾)'}
        </code>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400">操作</span>
        <span
          className={cn('text-[11px] font-semibold border rounded-md px-2 py-0.5', modeStyle.color)}
        >
          {modeStyle.label}
        </span>
      </div>
    </div>
  );
}

function ProposalContent({
  proposal,
  onAccept,
  onReject,
}: {
  proposal: PendingProposal;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-gray-700 leading-relaxed">{proposal.description}</p>

      <div className="flex gap-2">
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          拒绝
        </button>
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          接受
        </button>
      </div>
    </div>
  );
}

// ─── getStepStatus helper ─────────────────────────────────────────────────────

function getStepStatus(
  step: 'intent' | 'anchor' | 'proposal',
  phase: EditPhase,
  intent: AgentIntent | null,
  anchor: AgentAnchor | null,
  proposals: PendingProposal[],
): StepStatus {
  if (phase === 'error') {
    if (step === 'intent') return intent ? 'done' : 'error';

    if (step === 'anchor') {
      if (!intent) return 'pending';

      return anchor ? 'done' : 'error';
    }

    if (!anchor) return 'pending';

    return proposals.length > 0 ? 'done' : 'error';
  }

  const order: EditPhase[] = ['intent', 'anchor', 'proposal', 'reviewing'];
  const ci = order.indexOf(phase);
  const si = order.indexOf(step);
  if (ci === si) return 'active';
  if (ci > si) return 'done';

  return 'pending';
}

// ─── History types ────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  userMessage: string;
  intent: AgentIntent | null;
  anchor: AgentAnchor | null;
  proposals: PendingProposal[];
  /** Per-step raw outputs (frozen at completion) */
  intentRaw: string;
  anchorRaw: string;
  proposalRaw: string;
  intentThinking: string;
  anchorThinking: string;
  proposalThinking: string;
  result: 'accepted' | 'rejected' | 'partial' | 'error';
  error?: string;
}

function HistoryRound({ entry }: { entry: HistoryEntry }) {
  const [open, setOpen] = useState(false);

  const badge = {
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-600',
    partial: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-600',
  }[entry.result];

  const badgeText = { accepted: '已接受', rejected: '已拒绝', partial: '部分接受', error: '失败' }[
    entry.result
  ];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <User className="w-2.5 h-2.5 text-gray-500" />
        </span>
        <span className="flex-1 text-xs text-gray-500 truncate">{entry.userMessage}</span>
        <span className={cn('text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0', badge)}>
          {badgeText}
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-gray-100 space-y-3 pt-2">
          {/* Step 1 */}
          {(entry.intentRaw || entry.intentThinking || entry.intent) && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Cpu className="w-3 h-3" /> 意图识别
              </p>
              {entry.intentThinking && (
                <ThinkingBlock
                  text={entry.intentThinking}
                  isStreaming={false}
                  defaultOpen={false}
                />
              )}
              {entry.intentRaw && (
                <StreamingBlock
                  text={entry.intentRaw}
                  isStreaming={false}
                  collapsible
                  defaultOpen={false}
                />
              )}
              {entry.intent && (
                <div className="pt-0.5">
                  <IntentContent intent={entry.intent} />
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {(entry.anchorRaw || entry.anchorThinking || entry.anchor) && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 锚点定位
              </p>
              {entry.anchorThinking && (
                <ThinkingBlock
                  text={entry.anchorThinking}
                  isStreaming={false}
                  defaultOpen={false}
                />
              )}
              {entry.anchorRaw && (
                <StreamingBlock
                  text={entry.anchorRaw}
                  isStreaming={false}
                  collapsible
                  defaultOpen={false}
                />
              )}
              {entry.anchor && (
                <div className="pt-0.5">
                  <AnchorContent anchor={entry.anchor} />
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {(entry.proposalRaw || entry.proposalThinking || entry.proposals.length > 0) && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 生成内容
              </p>
              {entry.proposalThinking && (
                <ThinkingBlock
                  text={entry.proposalThinking}
                  isStreaming={false}
                  defaultOpen={false}
                />
              )}
              {entry.proposalRaw && (
                <StreamingBlock
                  text={entry.proposalRaw}
                  isStreaming={false}
                  collapsible
                  defaultOpen={false}
                />
              )}
              {entry.proposals.map((p) => (
                <p key={p.proposalId} className="text-[11px] text-gray-500 leading-relaxed">
                  {p.description}
                </p>
              ))}
            </div>
          )}

          {entry.error && <p className="text-[11px] text-red-500 break-all">{entry.error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onExample }: { onExample: (cmd: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-5 gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">AI 智能编辑</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            描述你想要的修改，AI 会分析意图、
            <br />
            定位位置并生成内容供你审阅
          </p>
        </div>
      </div>

      <div className="w-full space-y-2">
        <p className="text-xs font-medium text-gray-500 px-1 flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          试试这些指令
        </p>
        {EXAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => onExample(cmd)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-left transition-all group"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
            <span className="text-xs text-gray-600 group-hover:text-gray-800">{cmd}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Active Round ─────────────────────────────────────────────────────────────

interface ActiveRoundProps {
  userMessage: string;
  phase: EditPhase;
  intent: AgentIntent | null;
  anchor: AgentAnchor | null;
  proposals: PendingProposal[];
  errorMessage: string | null;
  thinkingRaw: string;
  intentThinking: string;
  anchorThinking: string;
  proposalThinking: string;
  intentRaw: string;
  anchorRaw: string;
  proposalRaw: string;
  isStreaming: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

function ActiveRound({
  userMessage,
  phase,
  intent,
  anchor,
  proposals,
  errorMessage,
  thinkingRaw,
  intentThinking,
  anchorThinking,
  proposalThinking,
  intentRaw,
  anchorRaw,
  proposalRaw,
  isStreaming,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
}: ActiveRoundProps) {
  const intentStatus = getStepStatus('intent', phase, intent, anchor, proposals);
  const anchorStatus = getStepStatus('anchor', phase, intent, anchor, proposals);
  const proposalStatus = getStepStatus('proposal', phase, intent, anchor, proposals);

  return (
    <div className="space-y-2">
      {/* User message bubble */}
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5">
          <p className="text-xs leading-relaxed">{userMessage}</p>
        </div>
      </div>

      {/* Step 1: Intent */}
      <StepRow
        stepNum={1}
        title="理解意图"
        icon={<Cpu className="w-3 h-3" />}
        status={intentStatus}
        thinkingText={intentStatus === 'active' ? thinkingRaw : intentThinking}
        streamingText={intentRaw}
        isCurrentlyStreaming={intentStatus === 'active' && isStreaming}
      >
        {intent && <IntentContent intent={intent} />}
        {intentStatus === 'error' && !intent && (
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 break-all">{errorMessage ?? '意图识别失败'}</p>
          </div>
        )}
      </StepRow>

      {/* Step 2: Anchor */}
      <StepRow
        stepNum={2}
        title="定位位置"
        icon={<MapPin className="w-3 h-3" />}
        status={anchorStatus}
        thinkingText={anchorStatus === 'active' ? thinkingRaw : anchorThinking}
        streamingText={anchorRaw}
        isCurrentlyStreaming={anchorStatus === 'active' && isStreaming}
      >
        {anchor && <AnchorContent anchor={anchor} />}
        {anchorStatus === 'error' && !anchor && (
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 break-all">{errorMessage ?? '锚点定位失败'}</p>
          </div>
        )}
      </StepRow>

      {/* Step 3: Proposal */}
      <StepRow
        stepNum={3}
        title="生成内容"
        icon={<Sparkles className="w-3 h-3" />}
        status={proposalStatus}
        thinkingText={proposalStatus === 'active' ? thinkingRaw : proposalThinking}
        streamingText={proposalRaw}
        isCurrentlyStreaming={proposalStatus === 'active' && isStreaming}
      >
        {proposalStatus === 'error' && proposals.length === 0 && (
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 break-all">{errorMessage ?? '提案生成失败'}</p>
          </div>
        )}
        {proposals.length > 0 && (
          <div className="space-y-3">
            {proposals.length > 1 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                <span className="text-xs text-amber-700 font-medium">
                  {proposals.length} 个提案待审阅
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={onRejectAll}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    <XCircle className="w-3 h-3" />
                    全部拒绝
                  </button>
                  <button
                    onClick={onAcceptAll}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <CheckCheck className="w-3 h-3" />
                    全部接受
                  </button>
                </div>
              </div>
            )}
            {proposals.map((p, idx) => (
              <div key={p.proposalId}>
                {proposals.length > 1 && (
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    提案 {idx + 1}
                  </p>
                )}
                <ProposalContent
                  proposal={p}
                  onAccept={() => onAccept(p.proposalId)}
                  onReject={() => onReject(p.proposalId)}
                />
              </div>
            ))}
          </div>
        )}
      </StepRow>

      {/* Error state outside all steps */}
      {phase === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-100 bg-red-50/50">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-600">{errorMessage ?? '处理失败'}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface AgentEditPanelProps {
  documentId?: string;
  className?: string;
  onClose?: () => void;
}

export function AgentEditPanel({ documentId, className, onClose }: AgentEditPanelProps) {
  const { editor } = useEditorStore();
  const {
    phase,
    intent,
    anchor,
    currentMessage,
    thinkingRaw,
    intentThinking,
    anchorThinking,
    proposalThinking,
    intentRaw,
    anchorRaw,
    proposalRaw,
    pendingProposals,
    errorMessage,
    isStreaming,
    submitEdit,
    acceptProposal,
    rejectProposal,
    acceptAll,
    rejectAll,
    reset,
  } = useDocumentEdit(editor ?? null);

  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Archive current round data so it's available when phase flips to 'idle'
  const archiveRef = useRef<{
    userMessage: string | null;
    intent: AgentIntent | null;
    anchor: AgentAnchor | null;
    proposals: PendingProposal[];
    intentRaw: string;
    anchorRaw: string;
    proposalRaw: string;
    intentThinking: string;
    anchorThinking: string;
    proposalThinking: string;
  }>({
    userMessage: null,
    intent: null,
    anchor: null,
    proposals: [],
    intentRaw: '',
    anchorRaw: '',
    proposalRaw: '',
    intentThinking: '',
    anchorThinking: '',
    proposalThinking: '',
  });

  useEffect(() => {
    if (phase === 'idle') return;
    archiveRef.current = {
      userMessage: currentMessage,
      intent,
      anchor,
      proposals: pendingProposals.length > 0 ? pendingProposals : archiveRef.current.proposals,
      intentRaw,
      anchorRaw,
      proposalRaw,
      intentThinking,
      anchorThinking,
      proposalThinking,
    };
  }, [
    phase,
    currentMessage,
    intent,
    anchor,
    pendingProposals,
    intentRaw,
    anchorRaw,
    proposalRaw,
    intentThinking,
    anchorThinking,
    proposalThinking,
  ]);

  const prevPhaseRef = useRef<EditPhase>('idle');
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === 'idle' && prevPhase !== 'idle') {
      const snap = archiveRef.current;
      if (!snap.userMessage) return;

      const result: HistoryEntry['result'] =
        prevPhase === 'error' ? 'error' : snap.proposals.length > 0 ? 'accepted' : 'error';

      setHistory((prev) => [
        ...prev,
        {
          id: `round_${Date.now()}`,
          userMessage: snap.userMessage!,
          intent: snap.intent,
          anchor: snap.anchor,
          proposals: snap.proposals,
          intentRaw: snap.intentRaw,
          anchorRaw: snap.anchorRaw,
          proposalRaw: snap.proposalRaw,
          intentThinking: snap.intentThinking,
          anchorThinking: snap.anchorThinking,
          proposalThinking: snap.proposalThinking,
          result,
          error: prevPhase === 'error' ? (errorMessage ?? undefined) : undefined,
        },
      ]);

      archiveRef.current = {
        userMessage: null,
        intent: null,
        anchor: null,
        proposals: [],
        intentRaw: '',
        anchorRaw: '',
        proposalRaw: '',
        intentThinking: '',
        anchorThinking: '',
        proposalThinking: '',
      };
    }
  }, [phase, errorMessage]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 0);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [
    phase,
    intent,
    anchor,
    pendingProposals,
    thinkingRaw,
    intentRaw,
    anchorRaw,
    proposalRaw,
    scrollToBottom,
  ]);

  const handleSend = useCallback(async () => {
    const msg = inputValue.trim();
    if (!msg || isStreaming) return;
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await submitEdit(msg, documentId);
  }, [inputValue, isStreaming, submitEdit, documentId]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) handleSend();
    }
  };

  const handleExample = (cmd: string) => {
    setInputValue(cmd);
    textareaRef.current?.focus();
  };

  const isActivePhase = phase !== 'idle' && phase !== 'error';
  const hasCurrentRound = currentMessage !== null || phase === 'error';
  const isIdle = phase === 'idle' && history.length === 0;
  const canSend = !!inputValue.trim() && !isStreaming;

  const handleReset = () => {
    reset();
    setHistory([]);
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50/60 to-violet-50/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Wand2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">AI 智能编辑</span>
          {isActivePhase && (
            <span className="text-[10px] bg-indigo-100 text-indigo-600 font-medium rounded-full px-2 py-0.5 animate-pulse">
              处理中
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all"
              title="新对话"
            >
              <Plus className="w-3 h-3" />
              新对话
            </button>
          )}
          {!isActivePhase && hasCurrentRound && (
            <button
              onClick={reset}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all"
              title="重置"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all"
              title="关闭"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isIdle ? (
          <EmptyState onExample={handleExample} />
        ) : (
          <div className="p-3 space-y-4">
            {history.length > 0 && (
              <div className="space-y-2">
                {history.map((entry) => (
                  <HistoryRound key={entry.id} entry={entry} />
                ))}
                <div className="border-t border-dashed border-gray-200 pt-2" />
              </div>
            )}

            {hasCurrentRound && (
              <ActiveRound
                userMessage={currentMessage ?? ''}
                phase={phase}
                intent={intent}
                anchor={anchor}
                proposals={pendingProposals}
                errorMessage={errorMessage}
                thinkingRaw={thinkingRaw}
                intentThinking={intentThinking}
                anchorThinking={anchorThinking}
                proposalThinking={proposalThinking}
                intentRaw={intentRaw}
                anchorRaw={anchorRaw}
                proposalRaw={proposalRaw}
                isStreaming={isStreaming}
                onAccept={acceptProposal}
                onReject={rejectProposal}
                onAcceptAll={acceptAll}
                onRejectAll={rejectAll}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 p-3 border-t border-gray-100 bg-white">
        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border px-3 py-2 transition-all',
            isStreaming
              ? 'bg-gray-50 border-gray-200 opacity-70'
              : 'bg-white border-gray-200 focus-within:border-indigo-300 focus-within:shadow-sm focus-within:shadow-indigo-100',
          )}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={
              isStreaming
                ? 'AI 思考中...'
                : phase === 'reviewing'
                  ? '审阅完成后可继续发起新指令...'
                  : '描述你想要的修改，例如：在末尾加一个总结'
            }
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none leading-5 max-h-28 overflow-y-auto py-0.5 disabled:cursor-not-allowed"
            style={{ minHeight: '20px' }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
            }}
          />

          {isStreaming ? (
            <button
              onClick={reset}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-all"
              title="停止"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'shrink-0 w-7 h-7 flex items-center justify-center rounded-xl transition-all',
                canSend
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed',
              )}
              title="发送"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {phase === 'idle' && !inputValue && history.length === 0 && (
          <p className="text-[11px] text-gray-400 text-center mt-2">
            按 Enter 发送 · Shift+Enter 换行
          </p>
        )}
      </div>
    </div>
  );
}
