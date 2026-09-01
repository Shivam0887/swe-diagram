'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Square } from 'lucide-react';
import { Button, Spinner } from '@heroui/react';
import type { DiagramDocument, DiagramNode, NodeType, NodeShape } from '@platform/diagram-schema';
import { sampleDiagrams } from '@platform/diagram-schema';
import {
  InsertNodeCommand,
  ConnectNodesCommand,
  UpdateNodeCommand,
  createNodeId,
  createEdgeId,
  getNodeDefinition,
} from '@platform/diagram-core';
import { renderDiagram } from '@platform/diagram-renderer';

type CopilotMessage = {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  previewSvg?: string;
  pending?: boolean;
};

interface AiCopilotPanelProps {
  doc: DiagramDocument;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Receives a command to execute against the canonical IR. The same surface
   * the human-driven palette uses — the agent's changes show up in undo/redo.
   */
  onApplyCommand: (command: unknown) => void;
}

export function AiCopilotPanel({ doc, isOpen, onClose, onApplyCommand }: AiCopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'm0',
      role: 'system',
      text: 'Ask me to add nodes, connect services, or change a node\'s role. I edit the same canonical IR you do — every change is undoable.',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');

    const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);

    try {
      const response = await interpret(text, doc);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'agent',
          text: response.text,
          previewSvg: response.previewSvg,
        },
      ]);
      for (const cmd of response.commands) {
        onApplyCommand(cmd);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: 'agent',
          text: err instanceof Error ? err.message : 'something went wrong',
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <aside
      style={{
        width: 360,
        flexShrink: 0,
        height: '100%',
        background: 'var(--color-bg)',
        borderLeft: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 240ms ease',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        position: 'relative',
        zIndex: 5,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>co-pilot</h3>
        <span className="t-mono" style={{ marginLeft: 'auto' }}>agent</span>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={onClose}
          aria-label="Close co-pilot"
          style={{
            background: 'transparent',
            color: 'var(--color-ink-2)',
            minWidth: 0,
            width: 24,
            height: 24,
            padding: 0,
          }}
        >
          <Square size={12} />
        </Button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.map((m) => (
          <Message key={m.id} msg={m} />
        ))}
        {thinking && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 0',
              color: 'var(--color-ink-2)',
              fontSize: 13,
            }}
          >
            <Spinner size="sm" style={{ width: 12, height: 12 }} />
            <span>drafting…</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--color-hairline)', padding: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            padding: 10,
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-raised)',
            transition: 'border-color 150ms ease',
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline)')}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Add a Redis cache between gateway and order service…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              resize: 'none',
              minHeight: 20,
              maxHeight: 120,
              lineHeight: 1.5,
            }}
            rows={1}
          />
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={send}
            isDisabled={!input.trim() || thinking}
            aria-label="Send"
            style={{
              background: 'transparent',
              color: input.trim() && !thinking ? 'var(--color-accent)' : 'var(--color-ink-3)',
              minWidth: 0,
              width: 28,
              height: 28,
              padding: 0,
            }}
          >
            <ArrowRight size={14} />
          </Button>
        </div>
        <div
          className="t-mono"
          style={{ marginTop: 8, color: 'var(--color-ink-3)', fontSize: 10 }}
        >
          enter to send · shift+enter for newline
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}

function Message({ msg }: { msg: CopilotMessage }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  return (
    <div
      style={{
        marginBottom: 12,
        padding: isUser ? '8px 12px' : '0',
        background: isUser ? 'var(--color-bg-raised)' : 'transparent',
        border: isUser ? '1px solid var(--color-hairline)' : 'none',
        borderRadius: isUser ? 'var(--radius-md)' : 0,
        marginLeft: isUser ? 24 : 0,
        marginRight: !isUser && !isSystem ? 0 : 0,
      }}
    >
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: isSystem ? 'var(--color-ink-3)' : 'var(--color-ink)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.text}
      </div>
      {msg.previewSvg && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            background: 'var(--color-bg-sunken)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: msg.previewSvg }}
        />
      )}
    </div>
  );
}

/**
 * Naive rule-based agent. Maps a small set of intents to commands against
 * the canonical IR. Replace with an LLM-backed call in production.
 */
type AgentResponse = {
  text: string;
  commands: unknown[];
  previewSvg?: string;
};

async function interpret(prompt: string, doc: DiagramDocument): Promise<AgentResponse> {
  const lower = prompt.toLowerCase();
  await new Promise((r) => setTimeout(r, 350));

  // "add a <type> [between X and Y]" or "add <type>"
  const addMatch = lower.match(/add (?:a |an )?(\w+)(?:.*between (\w[\w-]*) and (\w[\w-]*))?/);
  if (addMatch) {
    const [, type, fromLabel, toLabel] = addMatch;
    const nodeType = resolveNodeType(type);
    if (!nodeType) {
      return { text: `I don't know the component "${type}". Try service, database, cache, queue, gateway.`, commands: [] };
    }
    const def = getNodeDefinition(nodeType);
    const newNode: DiagramNode = {
      id: createNodeId(nodeType),
      type: nodeType,
      shape: def.defaultShape as NodeShape,
      position: { x: 240, y: 200 + Math.random() * 80 },
      size: def.defaultSize,
      data: {
        title: def.label,
        subtitle: '',
        role: def.category,
        icon: def.defaultIcon,
        badge: '',
      },
    };

    const commands: unknown[] = [new InsertNodeCommand(newNode)];

    if (fromLabel && toLabel) {
      const source = findNodeByLabel(doc, fromLabel);
      const target = findNodeByLabel(doc, toLabel);
      if (source && target) {
        commands.push(
          new ConnectNodesCommand({
            id: createEdgeId(source.id, newNode.id),
            source: { nodeId: source.id },
            target: { nodeId: newNode.id },
            routing: 'orthogonal',
            data: { animated: true, flowColor: '#FF5A1F' },
          })
        );
        commands.push(
          new ConnectNodesCommand({
            id: createEdgeId(newNode.id, target.id),
            source: { nodeId: newNode.id },
            target: { nodeId: target.id },
            routing: 'orthogonal',
            data: { animated: true, flowColor: '#FF5A1F' },
          })
        );
      }
    }

    // Build a preview of the would-be document
    const previewDoc = applyPreview(doc, commands);
    const preview = renderDiagram(previewDoc, { width: 360, height: 220 });
    return {
      text: `Added a ${def.label.toLowerCase()}${
        fromLabel && toLabel ? ` between "${fromLabel}" and "${toLabel}"` : ''
      }. The change is undoable.`,
      commands,
      previewSvg: preview.svg,
    };
  }

  // "rename X to Y"
  const renameMatch = lower.match(/rename (\w[\w-]*) to (.+)/);
  if (renameMatch) {
    const [, target, newTitle] = renameMatch;
    const node = findNodeByLabel(doc, target);
    if (!node) return { text: `I can't find a node called "${target}".`, commands: [] };
    const cleanTitle = newTitle.trim();
    return {
      text: `Renamed "${node.data.title}" to "${cleanTitle}".`,
      commands: [new UpdateNodeCommand(node.id, { data: { ...node.data, title: cleanTitle } }, node)],
    };
  }

  // "load <template>" — uses sampleDiagrams
  const loadMatch = lower.match(/load (?:the )?(\w[\w-]*)(?: template| sample)?/);
  if (loadMatch) {
    const key = loadMatch[1];
    const found = sampleDiagrams[key];
    if (found) {
      return {
        text: `Loaded template "${found.metadata.title}". (Use the templates menu in the toolbar to actually apply it.)`,
        commands: [],
      };
    }
  }

  return {
    text: `I'm a simple rule-based agent right now. Try: "add a cache", "add a service between gateway and order", or "rename gateway to edge".`,
    commands: [],
  };
}

function resolveNodeType(input: string): NodeType | null {
  const map: Record<string, NodeType> = {
    service: 'service',
    microservice: 'service',
    database: 'database',
    db: 'database',
    sql: 'database',
    postgres: 'postgresql',
    postgresql: 'postgresql',
    cache: 'cache',
    redis: 'cache',
    queue: 'queue',
    kafka: 'kafka',
    worker: 'worker',
    gateway: 'api_gateway',
    api: 'api_gateway',
    lb: 'load_balancer',
    balancer: 'load_balancer',
    s3: 'object_storage',
    storage: 'object_storage',
    user: 'user',
    client: 'user',
    browser: 'browser',
  };
  const key = input.toLowerCase();
  return map[key] ?? null;
}

function findNodeByLabel(doc: DiagramDocument, label: string): DiagramNode | null {
  const l = label.toLowerCase().replace(/s$/, '');
  return (
    doc.nodes.find((n) => n.data.title.toLowerCase().includes(l)) ??
    doc.nodes.find((n) => n.type.includes(l)) ??
    null
  );
}

function applyPreview(doc: DiagramDocument, commands: unknown[]): DiagramDocument {
  let next = doc;
  for (const cmd of commands) {
    const c = cmd as { type?: string; node?: DiagramNode; edge?: DiagramDocument['edges'][number] };
    if (c.type === 'INSERT_NODE' && c.node) {
      next = { ...next, nodes: [...next.nodes, c.node] };
    }
    if (c.type === 'CONNECT_NODES' && c.edge) {
      next = { ...next, edges: [...next.edges, c.edge] };
    }
  }
  return next;
}
