'use client';

import { useState, useRef, useCallback } from 'react';
import { type Editor } from '@tiptap/react';
import { v4 as uuidv4 } from 'uuid';

import {
  streamDocumentEdit,
  type AgentIntent,
  type AgentAnchor,
  type AgentProposal,
  type AgentOp,
  type TiptapNode,
} from '@/services/collaboration';

// ─── 阶段状态 ─────────────────────────────────────────────────────────────────

export type EditPhase = 'idle' | 'intent' | 'anchor' | 'proposal' | 'reviewing' | 'error';

export interface PendingProposal {
  proposalId: string;
  description: string;
  ops: AgentOp[];
  suggestionId: string;
  applied: boolean;
}

export interface UseDocumentEditReturn {
  phase: EditPhase;
  intent: AgentIntent | null;
  anchor: AgentAnchor | null;
  currentMessage: string | null;
  /** Live thinking tokens for the currently-active step (resets each step) */
  thinkingRaw: string;
  /** Per-step final thinking — set when structured event arrives, persists forever */
  intentThinking: string;
  anchorThinking: string;
  proposalThinking: string;
  /** Per-step raw output — accumulates during streaming, persists after step done */
  intentRaw: string;
  anchorRaw: string;
  proposalRaw: string;
  pendingProposals: PendingProposal[];
  errorMessage: string | null;
  isStreaming: boolean;
  submitEdit: (message: string, documentId?: string) => Promise<void>;
  acceptProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  reset: () => void;
}

// ─── 将 TiptapNode 树中所有文本节点加上 agentSuggestion mark ─────────────────

function injectSuggestionMark(
  nodes: TiptapNode[],
  suggestionId: string,
  variant: 'added' | 'deleted' = 'added',
  editor?: Editor,
): TiptapNode[] {
  const suggestionMark = { type: 'agentSuggestion', attrs: { suggestionId, variant } };
  const agentMarkType = editor?.state.schema.marks.agentSuggestion;

  function markConflicts(markName: string): boolean {
    if (!agentMarkType || !editor) return markName === 'code';

    const otherType = editor.state.schema.marks[markName];
    if (!otherType) return false;

    return otherType.excludes(agentMarkType) || agentMarkType.excludes(otherType);
  }

  function inject(node: TiptapNode): TiptapNode {
    if (node.type === 'text') {
      const existingMarks = node.marks ?? [];
      const hasConflict = existingMarks.some((m) => {
        const name = typeof m === 'string' ? m : (m as { type: string }).type;

        return markConflicts(name);
      });
      if (hasConflict) return node;

      return { ...node, marks: [...existingMarks, suggestionMark] };
    }

    if (node.content && node.content.length > 0) {
      return { ...node, content: node.content.map(inject) };
    }

    return node;
  }

  return nodes.map(inject);
}

// ─── 在 TipTap 中寻找节点位置并插入 ──────────────────────────────────────────

function applyOpToEditor(editor: Editor, op: AgentOp, suggestionId: string): boolean {
  const nodesWithMark = injectSuggestionMark(op.content, suggestionId, 'added', editor);

  switch (op.type) {
    case 'append_to_doc': {
      const { doc } = editor.state;
      const insertPos = doc.content.size;

      return editor.chain().focus().insertContentAt(insertPos, nodesWithMark).run();
    }

    case 'insert_after':

    case 'insert_before': {
      if (!op.nodeId) {
        const insertPos = editor.state.doc.content.size;

        return editor.chain().focus().insertContentAt(insertPos, nodesWithMark).run();
      }

      let anchorPos: number | null = null;

      editor.state.doc.descendants((node, pos) => {
        if (anchorPos !== null) return false;

        if ((node.attrs as { id?: string })?.id === op.nodeId) {
          anchorPos = op.type === 'insert_after' ? pos + node.nodeSize : pos;
        }
      });

      const insertAt = anchorPos ?? editor.state.doc.content.size;

      return editor.chain().focus().insertContentAt(insertAt, nodesWithMark).run();
    }

    case 'replace': {
      if (!op.nodeId) return false;

      let targetFrom: number | null = null;
      let targetTo: number | null = null;

      editor.state.doc.descendants((node, pos) => {
        if (targetFrom !== null) return false;

        if ((node.attrs as { id?: string })?.id === op.nodeId) {
          targetFrom = pos;
          targetTo = pos + node.nodeSize;
        }
      });

      if (targetFrom === null || targetTo === null) return false;

      const agentMarkType = editor.state.schema.marks.agentSuggestion;

      if (agentMarkType) {
        const deletedMark = agentMarkType.create({ suggestionId, variant: 'deleted' });
        const tr = editor.state.tr;

        editor.state.doc.nodesBetween(targetFrom + 1, targetTo - 1, (node, pos) => {
          if (!node.isText) return;

          const safe = node.marks.every(
            (m) => !m.type.excludes(agentMarkType) && !agentMarkType.excludes(m.type),
          );
          if (safe) tr.addMark(pos, pos + node.nodeSize, deletedMark);
        });

        editor.view.dispatch(tr);
      }

      return editor.chain().focus().insertContentAt(targetTo, nodesWithMark).run();
    }
  }

  return false;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDocumentEdit(editor: Editor | null): UseDocumentEditReturn {
  const [phase, setPhase] = useState<EditPhase>('idle');
  const [intent, setIntent] = useState<AgentIntent | null>(null);
  const [anchor, setAnchor] = useState<AgentAnchor | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  // Live thinking for the current step — resets between steps
  const [thinkingRaw, setThinkingRaw] = useState('');
  // Per-step frozen thinking — saved when structured event arrives, never cleared until reset()
  const [intentThinking, setIntentThinking] = useState('');
  const [anchorThinking, setAnchorThinking] = useState('');
  const [proposalThinking, setProposalThinking] = useState('');
  // Per-step raw output — accumulates during streaming, persists after done
  const [intentRaw, setIntentRaw] = useState('');
  const [anchorRaw, setAnchorRaw] = useState('');
  const [proposalRaw, setProposalRaw] = useState('');

  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const cancelRef = useRef<(() => void) | null>(null);

  // ── Ref-based token accumulators + timer-based flush ─────────────────────
  // Token events arrive on every SSE chunk (ms apart). Accumulate in refs and
  // flush to React state via setTimeout(0) — one render per burst, not per char.
  // setTimeout(0) fires even in background tabs (unlike requestAnimationFrame).
  const thinkingAccRef = useRef('');
  const intentAccRef = useRef('');
  const anchorAccRef = useRef('');
  const proposalAccRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushTokensToState = useCallback(() => {
    timerRef.current = null;
    setThinkingRaw(thinkingAccRef.current);
    setIntentRaw(intentAccRef.current);
    setAnchorRaw(anchorAccRef.current);
    setProposalRaw(proposalAccRef.current);
  }, []);

  const scheduleTokenFlush = useCallback(() => {
    if (timerRef.current === null) {
      timerRef.current = setTimeout(flushTokensToState, 0);
    }
  }, [flushTokensToState]);

  /** Flush pending timer immediately, then cancel it */
  const flushAndCancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    flushAndCancelTimer();
    thinkingAccRef.current = '';
    intentAccRef.current = '';
    anchorAccRef.current = '';
    proposalAccRef.current = '';
    setPhase('idle');
    setIntent(null);
    setAnchor(null);
    setCurrentMessage(null);
    setThinkingRaw('');
    setIntentThinking('');
    setAnchorThinking('');
    setProposalThinking('');
    setIntentRaw('');
    setAnchorRaw('');
    setProposalRaw('');
    setPendingProposals([]);
    setErrorMessage(null);
    setIsStreaming(false);
  }, [flushAndCancelTimer]);

  const applyProposalToEditor = useCallback(
    (proposal: AgentProposal, suggestionId: string): boolean => {
      if (!editor) return false;

      let success = false;

      for (const op of proposal.ops) {
        if (applyOpToEditor(editor, op, suggestionId)) success = true;
      }

      return success;
    },
    [editor],
  );

  const submitEdit = useCallback(
    async (message: string, documentId?: string) => {
      if (!editor || isStreaming) return;

      reset();
      setIsStreaming(true);
      setPhase('intent');
      setCurrentMessage(message);

      const documentContent = editor.getJSON() as Record<string, unknown>;

      const cancel = await streamDocumentEdit(
        { message, documentContent, documentId },
        (event) => {
          switch (event.type) {
            // ── token chunks ───────────────────────────────────────────────
            case 'thinking_token':
              thinkingAccRef.current += (event.data as { text: string }).text;
              scheduleTokenFlush();
              break;

            case 'intent_token':
              intentAccRef.current += (event.data as { text: string }).text;
              scheduleTokenFlush();
              break;

            case 'anchor_token':
              anchorAccRef.current += (event.data as { text: string }).text;
              scheduleTokenFlush();
              break;

            case 'proposal_token':
              proposalAccRef.current += (event.data as { text: string }).text;
              scheduleTokenFlush();
              break;

            // ── structured results ─────────────────────────────────────────
            case 'intent': {
              flushAndCancelTimer();

              // Freeze this step's raw output + thinking (persist for display)
              const frozenIntentRaw = intentAccRef.current;
              const frozenIntentThinking = thinkingAccRef.current;
              // Reset accumulators for next step
              thinkingAccRef.current = '';
              intentAccRef.current = '';
              setIntentRaw(frozenIntentRaw);
              setIntentThinking(frozenIntentThinking);
              setThinkingRaw('');
              setIntent(event.data as AgentIntent);
              setPhase('anchor');
              break;
            }

            case 'anchor': {
              flushAndCancelTimer();

              const frozenAnchorRaw = anchorAccRef.current;
              const frozenAnchorThinking = thinkingAccRef.current;
              thinkingAccRef.current = '';
              anchorAccRef.current = '';
              setAnchorRaw(frozenAnchorRaw);
              setAnchorThinking(frozenAnchorThinking);
              setThinkingRaw('');
              setAnchor(event.data as AgentAnchor);
              setPhase('proposal');
              break;
            }

            case 'proposal': {
              flushAndCancelTimer();

              const frozenProposalRaw = proposalAccRef.current;
              const frozenProposalThinking = thinkingAccRef.current;
              thinkingAccRef.current = '';
              proposalAccRef.current = '';
              setProposalRaw(frozenProposalRaw);
              setProposalThinking(frozenProposalThinking);
              setThinkingRaw('');

              const proposal = event.data as AgentProposal;
              const suggestionId = `sug_${uuidv4().slice(0, 8)}`;
              const applied = applyProposalToEditor(proposal, suggestionId);
              setPendingProposals((prev) => [...prev, { ...proposal, suggestionId, applied }]);
              setPhase('reviewing');
              setIsStreaming(false);
              break;
            }

            case 'done':
              setIsStreaming(false);
              break;

            case 'error': {
              // Flush any partial tokens before showing error
              flushAndCancelTimer();
              setThinkingRaw(thinkingAccRef.current);
              setIntentRaw(intentAccRef.current);
              setAnchorRaw(anchorAccRef.current);
              setProposalRaw(proposalAccRef.current);
              setErrorMessage((event.data as { message?: string }).message ?? '未知错误');
              setPhase('error');
              setIsStreaming(false);
              break;
            }
          }
        },
        (err) => {
          setErrorMessage(err.message);
          setPhase('error');
          setIsStreaming(false);
        },
      );

      cancelRef.current = cancel;
    },

    [editor, isStreaming, applyProposalToEditor, reset],
  );

  const acceptProposal = useCallback(
    (proposalId: string) => {
      const found = pendingProposals.find((p) => p.proposalId === proposalId);
      if (!found || !editor) return;
      editor.chain().focus().acceptAgentSuggestion(found.suggestionId).run();
      setPendingProposals((prev) => {
        const next = prev.filter((p) => p.proposalId !== proposalId);
        if (next.length === 0) setPhase('idle');

        return next;
      });
    },
    [editor, pendingProposals],
  );

  const rejectProposal = useCallback(
    (proposalId: string) => {
      const found = pendingProposals.find((p) => p.proposalId === proposalId);
      if (!found || !editor) return;
      editor.chain().focus().rejectAgentSuggestion(found.suggestionId).run();
      setPendingProposals((prev) => {
        const next = prev.filter((p) => p.proposalId !== proposalId);
        if (next.length === 0) setPhase('idle');

        return next;
      });
    },
    [editor, pendingProposals],
  );

  const acceptAll = useCallback(() => {
    if (!editor) return;

    const chain = editor.chain().focus();
    for (const p of pendingProposals) chain.acceptAgentSuggestion(p.suggestionId);
    chain.run();
    setPendingProposals([]);
    setPhase('idle');
  }, [editor, pendingProposals]);

  const rejectAll = useCallback(() => {
    if (!editor) return;

    const chain = editor.chain().focus();
    for (const p of pendingProposals) chain.rejectAgentSuggestion(p.suggestionId);
    chain.run();
    setPendingProposals([]);
    setPhase('idle');
  }, [editor, pendingProposals]);

  return {
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
  };
}
