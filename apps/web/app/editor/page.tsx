'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type {
  DiagramDocument,
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  NodeType,
  NodeShape,
  ThemeId,
  Point,
  CustomCollection,
  GroupStyle,
} from '@platform/diagram-schema';
import { resolveTheme, type Theme } from '@platform/design-system';

/**
 * Module-scoped context. Populated once per editor mount; consumed by every
 * CustomDiagramNode and CustomGroupNode so we don't re-resolve the theme
 * inside their renders. Nodes are React.memo'd — when a node re-renders
 * because something else changed, `useContext(ThemeContext)` is still a
 * constant, so the theme lookup happens exactly once per render at the
 * page level instead of 30+ times per frame across all nodes.
 */
const ThemeContext = React.createContext<Theme | null>(null);
import {
  DiagramHistoryManager,
  InsertNodeCommand,
  MoveNodeCommand,
  UpdateNodeCommand,
  DeleteNodeCommand,
  ConnectNodesCommand,
  DeleteEdgeCommand,
  UpdateEdgeCommand,
  ChangeThemeCommand,
  UpdateMetadataCommand,
  InsertGroupCommand,
  UpdateGroupCommand,
  MoveGroupCommand,
  DeleteGroupCommand,
  AssignNodesToGroupCommand,
  AssignNodeGroupCommand,
  createNodeId,
  createEdgeId,
  createGroupId,
  getNodeDefinition,
} from '@platform/diagram-core';
import { computeElkLayout } from '@platform/diagram-layout';

import { CustomDiagramNode } from '../../components/editor/CustomDiagramNode';
import { CustomGroupNode } from '../../components/editor/CustomGroupNode';
import { FilletOrthogonalEdge } from '../../components/editor/FilletOrthogonalEdge';
import { BezierCurvedEdge } from '../../components/editor/BezierCurvedEdge';
import { StraightEdge } from '../../components/editor/StraightEdge';
import { StepOrthogonalEdge } from '../../components/editor/StepOrthogonalEdge';
import { ComponentPalette } from '../../components/editor/ComponentPalette';
import { PropertiesPanel } from '../../components/editor/PropertiesPanel';
import { EditorToolbar } from '../../components/editor/EditorToolbar';
import { ExportModal } from '../../components/editor/ExportModal';
import { AiCopilotPanel } from '../../components/editor/AiCopilotPanel';

const nodeTypes = {
  customDiagramNode: CustomDiagramNode,
  customGroupNode: CustomGroupNode,
};
const edgeTypes = {
  filletOrthogonal: FilletOrthogonalEdge,
  bezierCurved: BezierCurvedEdge,
  straight: StraightEdge,
  stepOrthogonal: StepOrthogonalEdge,
};

/** Map edge.routing (canonical IR) to the React-Flow edge component id. */
function edgeTypeFor(routing: string | undefined): 'filletOrthogonal' | 'bezierCurved' | 'straight' | 'stepOrthogonal' {
  switch (routing) {
    case 'curved':
      return 'bezierCurved';
    case 'straight':
      return 'straight';
    case 'step':
      return 'stepOrthogonal';
    case 'orthogonal':
    default:
      return 'filletOrthogonal';
  }
}

// Module-scope so the reference is stable across renders — passing a fresh
// `{}` to <ReactFlow defaultEdgeOptions> on every render allocates a new
// object that ReactFlow's effects can compare against.
const DEFAULT_EDGE_OPTIONS = { type: 'filletOrthogonal' as const };

/**
 * The canonical "blank" document. The editor opens with this when no
 * ?projectId&diagramId is present. Keeping the theme explicit (rather than
 * `undefined`) means the resolveTheme() call has something stable to read
 * on first render.
 */
function blankDiagramDocument(): DiagramDocument {
  return {
    schemaVersion: '1.0',
    rendererVersion: '1.0.0',
    theme: 'editorial-dark',
    nodes: [],
    edges: [],
    groups: [],
    annotations: [],
    metadata: {
      title: 'Untitled',
      description: '',
      width: 1280,
      height: 800,
      tags: [],
      author: 'agentic / diagrams',
    },
  };
}

function EditorCanvasContent() {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Track the project/diagram this editor session is bound to. Pulled from
  // ?projectId&diagramId on first render. A null pair means "blank doc" —
  // the user will create a project/diagram on first save.
  const initialBinding = useMemo(() => {
    return {
      projectId: searchParams?.get('projectId') ?? null,
      diagramId: searchParams?.get('diagramId') ?? null,
    };
  }, [searchParams]);

  /**
   * A blank canonical document. Used when the editor is opened without
   * ?projectId&diagramId, while the URL-bound doc is being fetched, and
   * any time a remote fetch fails.
   */
  const blankDoc = useMemo<DiagramDocument>(() => blankDiagramDocument(), []);

  const [doc, setDoc] = useState<DiagramDocument>(blankDoc);
  const [binding, setBinding] = useState<{ projectId: string | null; diagramId: string | null }>(initialBinding);
  const [loading, setLoading] = useState<boolean>(Boolean(initialBinding.diagramId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const historyManagerRef = useRef(new DiagramHistoryManager(50));

  // When the URL has ?projectId&diagramId, fetch the persisted doc and
  // swap it in. On 404 we leave the blank doc in place and surface a
  // small error in the toolbar.
  useEffect(() => {
    if (!initialBinding.diagramId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/diagrams/${initialBinding.diagramId}`);
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(`Diagram not found (${res.status})`);
          setLoading(false);
          return;
        }
        const body = await res.json();
        const record = body?.data;
        if (cancelled) return;
        if (record?.document) {
          setDoc(record.document);
          setBinding({ projectId: record.projectId, diagramId: record.id });
          if (record.name) {
            // Keep the metadata title in sync with the record name.
            setDoc((d) => ({ ...d, metadata: { ...d.metadata, title: record.name } }));
          }
        }
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load diagram');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialBinding.diagramId]);

  // Cached `data` projections for each node/group. Without this, every
  // `flowNodes` rebuild spreads `...node.data` (allocating a fresh
  // object) and reassigns `shape`/`style`/`themeId` — which means even
  // an unrelated doc change (e.g. one node's title being edited) busts
  // the `React.memo` on every other node, because their `data` prop
  // reference flipped. With this cache, only the node that actually
  // changed gets a new `data` ref.
  //
  // For diagram nodes, we key on the specific source fields that flow
  // into the projection (`data`, `shape`, `style`, `doc.theme`). The
  // command pipeline produces a new ref on each field it changes, so
  // identity comparison is the right test — and a pure position move
  // (which replaces the parent node object but keeps `data`/`shape`/
  // `style` refs) does NOT bust the cache.
  const nodeDataCache = useRef(
    new Map<string, { data: Record<string, unknown>; refs: unknown[] }>()
  );

  // Theme is resolved once per doc.theme change and passed down via context.
  // Each custom node/edge reads it with useContext, avoiding a 30× per-frame
  // resolveTheme() call during pan/zoom.
  const resolvedTheme = useMemo<Theme>(() => resolveTheme(doc.theme), [doc.theme]);

  const [collections, setCollections] = useState<CustomCollection[]>(
    () => [
      { id: 'col-default', name: 'My Custom Blocks', items: [] },
    ]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);

  // History (canUndo/canRedo) lives in a child so its 200ms polling does
  // not re-render the entire editor. The actual element is rendered in
  // the JSX below (where all the callbacks are in scope).

  const executeCommand = useCallback((command: any) => {
    setDoc((currentDoc) => historyManagerRef.current.execute(command, currentDoc));
  }, []);

  const handleUndo = useCallback(() => {
    setDoc((currentDoc) => historyManagerRef.current.undo(currentDoc));
  }, []);
  const handleRedo = useCallback(() => {
    setDoc((currentDoc) => historyManagerRef.current.redo(currentDoc));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (isMod && e.key.toLowerCase() === 'y') ||
        (isMod && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // Plain Delete/Backspace: remove whichever selection the user
        // currently has (node wins over edge wins over group). React Flow
        // already routes Backspace through `onNodesChange` / `onEdgesChange`
        // when its own canvas has focus; this handler is the safety net
        // for when focus is on the toolbar or elsewhere.
        e.preventDefault();
        if (selectedNodeId) {
          const existing = doc.nodes.find((n) => n.id === selectedNodeId);
          if (existing) executeCommand(new DeleteNodeCommand(selectedNodeId));
        } else if (selectedGroupId) {
          const existing = (doc.groups ?? []).find((g) => g.id === selectedGroupId);
          if (existing) executeCommand(new DeleteGroupCommand(selectedGroupId));
        } else if (selectedEdgeId) {
          const existing = doc.edges.find((ed) => ed.id === selectedEdgeId);
          if (existing) executeCommand(new DeleteEdgeCommand(selectedEdgeId));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo, executeCommand, selectedNodeId, selectedEdgeId, selectedGroupId, doc.nodes, doc.edges, doc.groups]);

  const flowNodes: Node[] = useMemo(
    () => {
      // Groups first so they sit behind the actual nodes (zIndex default).
      //
      // We deliberately do NOT set `selected` here: ReactFlow already tracks
      // selection in its internal store and passes `selected` as a prop to
      // each node component. Setting it here means changing the selection
      // re-runs this memo, which allocates fresh `data` objects for every
      // node, busting every `React.memo`'d `CustomDiagramNode` /
      // `CustomGroupNode` on every click — that's the largest remaining
      // drag/zoom lag contributor on a 30+ node diagram.
      //
      // The `nodeDataCache` below keeps each node's `data` reference
      // stable when the underlying fields haven't changed, so even an
      // unrelated doc change doesn't bust every node's memo.
      const cache = nodeDataCache.current;
      const seenIds = new Set<string>();

      const getCachedData = (id: string, refs: unknown[], build: () => Record<string, unknown>) => {
        const entry = cache.get(id);
        if (entry && entry.refs.length === refs.length && entry.refs.every((r, i) => r === refs[i])) {
          return entry.data;
        }
        const next = build();
        cache.set(id, { data: next, refs });
        return next;
      };

      const groupNodes: Node[] = (doc.groups ?? []).map((g) => {
        seenIds.add(g.id);
        const data = getCachedData(
          g.id,
          [g.title, g.subtitle, g.style, g.colorRole, doc.theme],
          () => ({
            title: g.title,
            subtitle: g.subtitle,
            style: g.style ?? 'boundary',
            colorRole: g.colorRole,
            themeId: doc.theme,
          })
        );
        return {
          id: g.id,
          type: 'customGroupNode',
          position: g.position,
          // React Flow expects width/height at the top level of a node.
          width: g.size.width,
          height: g.size.height,
          // Pre-fill `measured` so the XYResizer's drag handler starts from
          // the real size. Without this, `node.measured.width` is undefined
          // on first render and the resizer falls back to 0 — meaning the
          // very first drag collapses the group to zero pixels wide.
          measured: { width: g.size.width, height: g.size.height },
          data,
          // Make sure groups don't show handles or get auto-connected.
          draggable: true,
          selectable: true,
          connectable: false,
          zIndex: -1,
          deletable: true,
        };
      });
      const diagramNodes: Node[] = doc.nodes.map((node) => {
        seenIds.add(node.id);
        const data = getCachedData(
          node.id,
          [node.data, node.shape, node.style, doc.theme],
          () => ({
            ...node.data,
            shape: node.shape ?? 'rounded_card',
            style: node.style,
            themeId: doc.theme,
          })
        );
        return {
          id: node.id,
          type: 'customDiagramNode',
          position: node.position,
          data,
          parentId: node.groupId,
        };
      });

      // Drop cache entries for nodes that no longer exist.
      for (const cachedId of Array.from(cache.keys())) {
        if (!seenIds.has(cachedId)) cache.delete(cachedId);
      }

      return [...groupNodes, ...diagramNodes];
    },
    // No selection IDs in deps — see comment above. ReactFlow's store is
    // the single source of truth for which node is selected.
    [doc.nodes, doc.groups, doc.theme]
  );

  const flowEdges: Edge[] = useMemo(
    () => {
      // Cache `data` per edge so a single-edge edit doesn't bust memo
      // on every other edge component (each edge component is
      // `React.memo`'d and re-renders when its `data` ref changes).
      // The cleanup pass lives in `flowNodes` above so we don't
      // double-track the seen set.
      const cache = nodeDataCache.current;
      return doc.edges.map((edge) => {
        const refs = [edge.data, edge.waypoints, edge.style, edge.routing];
        const entry = cache.get(edge.id);
        let data: Record<string, unknown>;
        if (
          entry &&
          entry.refs.length === refs.length &&
          entry.refs.every((r, i) => r === refs[i])
        ) {
          data = entry.data;
        } else {
          data = {
            ...edge.data,
            waypoints: edge.waypoints,
            // Edge style is at the top level in the IR; the React-Flow
            // edge component reads it from data.dashStyle.
            dashStyle: edge.style,
          };
          cache.set(edge.id, { data, refs });
        }
        return {
          id: edge.id,
          source: edge.source.nodeId,
          target: edge.target.nodeId,
          sourceHandle: edge.source.portId,
          targetHandle: edge.target.portId,
          type: edgeTypeFor(edge.routing),
          data,
        };
      });
    },
    [doc.edges]
  );

  // Always-fresh reference to `doc` so change handlers can read it
  // without becoming stale or pulling `doc` into their deps (which
  // would rebuild them — and therefore the `onNodesChange` reference
  // passed to <ReactFlow> — on every doc mutation).
  const docRef = useRef(doc);
  docRef.current = doc;

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const currentDoc = docRef.current;
      const groups = currentDoc.groups ?? [];
      for (const change of changes) {
        if (change.type === 'remove') {
          // Groups and nodes share the React Flow `nodes` channel; route
          // removes to the right command based on which collection the
          // id belongs to.
          if (groups.some((g) => g.id === change.id)) {
            executeCommand(new DeleteGroupCommand(change.id));
          } else {
            executeCommand(new DeleteNodeCommand(change.id));
          }
        } else if (change.type === 'select') {
          if (change.selected) {
            if (groups.some((g) => g.id === change.id)) {
              setSelectedGroupId(change.id);
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            } else {
              setSelectedNodeId(change.id);
              setSelectedEdgeId(null);
              setSelectedGroupId(null);
            }
          } else {
            // We can't read the latest selected* ids from a stale
            // closure; the setters guard against no-op writes so it's
            // safe to call them with the value from the change.
            if (!change.id) return;
            setSelectedNodeId((prev) => (prev === change.id ? null : prev));
            setSelectedGroupId((prev) => (prev === change.id ? null : prev));
          }
        } else if (change.type === 'dimensions') {
          // Resize finished (resizing: false). Persist the new size to the
          // doc so the next render doesn't snap back to the old size.
          // We only commit on the final event of a drag — committing on
          // every tick would spam history with hundreds of undo steps.
          if (!change.resizing && change.dimensions) {
            const group = groups.find((g) => g.id === change.id);
            if (group) {
              const nextSize = {
                width: Math.round(change.dimensions!.width),
                height: Math.round(change.dimensions!.height),
              };
              if (
                nextSize.width !== Math.round(group.size.width) ||
                nextSize.height !== Math.round(group.size.height)
              ) {
                executeCommand(
                  new UpdateGroupCommand(
                    change.id,
                    { size: nextSize },
                    group
                  )
                );
              }
            }
          }
        }
      }
    },
    [executeCommand]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') executeCommand(new DeleteEdgeCommand(change.id));
        else if (change.type === 'select') {
          if (change.selected) {
            setSelectedEdgeId(change.id);
            setSelectedNodeId(null);
          } else {
            setSelectedEdgeId((prev) => (prev === change.id ? null : prev));
          }
        }
      }
    },
    [executeCommand]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newEdge: DiagramEdge = {
        id: createEdgeId(connection.source, connection.target),
        source: { nodeId: connection.source, portId: connection.sourceHandle ?? undefined },
        target: { nodeId: connection.target, portId: connection.targetHandle ?? undefined },
        routing: 'orthogonal',
        data: { color: '#8C8A85', strokeWidth: 1.5, animated: true, flowColor: '#FF5A1F' },
      };
      executeCommand(new ConnectNodesCommand(newEdge));
    },
    [executeCommand]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      // Groups and nodes share the React Flow nodes channel; dispatch
      // to the right command based on which collection the id belongs to.
      const group = (doc.groups ?? []).find((g) => g.id === node.id);
      if (group) {
        const next: Point = { x: node.position.x, y: node.position.y };
        if (group.position.x === next.x && group.position.y === next.y) return;
        executeCommand(new MoveGroupCommand(node.id, next, group.position));
        return;
      }
      const existing = doc.nodes.find((n) => n.id === node.id);
      if (!existing) return;
      if (existing.position.x === node.position.x && existing.position.y === node.position.y) return;
      executeCommand(new MoveNodeCommand(node.id, node.position, existing.position));
    },
    [doc.nodes, doc.groups, executeCommand]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedGroupId(null);
  }, []);

  const handleAddNode = useCallback(
    (type: NodeType, shape?: NodeShape, initialData?: Partial<DiagramNode['data']>, initialStyle?: Partial<DiagramNode['style']>) => {
      const def = getNodeDefinition(type);
      const position: Point = { x: 150 + Math.random() * 300, y: 150 + Math.random() * 200 };
      const newNode: DiagramNode = {
        id: createNodeId(type),
        type,
        shape: shape ?? def.defaultShape,
        position,
        size: def.defaultSize,
        data: {
          title: initialData?.title ?? def.label,
          subtitle: initialData?.subtitle ?? '',
          role: initialData?.role ?? def.category,
          icon: initialData?.icon ?? def.defaultIcon,
          badge: initialData?.badge ?? '',
          ...initialData,
        },
        style: initialStyle,
      };
      executeCommand(new InsertNodeCommand(newNode));
      setSelectedNodeId(newNode.id);
    },
    [executeCommand]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    // The palette announces `effectAllowed = 'copy'`; mirror it here so
    // the cursor shows a "+" instead of the forbidden-circle, and so the
    // browser actually delivers the drop event.
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      // Try the custom MIME first; fall back to text/plain (browsers
      // occasionally strip custom MIME types on certain platforms).
      const raw =
        event.dataTransfer.getData('application/diagram-node') ||
        event.dataTransfer.getData('text/plain');
      if (!raw) return;
      let parsed: { type: NodeType; shape?: NodeShape };
      try {
        parsed = JSON.parse(raw) as { type: NodeType; shape?: NodeShape };
      } catch {
        return;
      }
      if (!parsed?.type) return;
      const pos = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      handleAddNode(parsed.type, parsed.shape, undefined, undefined);
      // Snap the most recent node to the drop position
      setTimeout(() => {
        setDoc((currentDoc) => {
          const last = currentDoc.nodes[currentDoc.nodes.length - 1];
          if (!last) return currentDoc;
          return {
            ...currentDoc,
            nodes: currentDoc.nodes.map((n) =>
              n.id === last.id
                ? { ...n, position: { x: Math.round(pos.x), y: Math.round(pos.y) } }
                : n
            ),
          };
        });
      }, 0);
    },
    [handleAddNode, reactFlowInstance]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<DiagramNode>) => {
      const existing = doc.nodes.find((n) => n.id === nodeId);
      if (!existing) return;
      executeCommand(new UpdateNodeCommand(nodeId, updates, existing));
    },
    [doc.nodes, executeCommand]
  );

  const handleUpdateEdge = useCallback(
    (edgeId: string, updates: Partial<DiagramEdge>) => {
      const existing = doc.edges.find((e) => e.id === edgeId);
      if (!existing) return;
      executeCommand(new UpdateEdgeCommand(edgeId, updates, existing));
    },
    [doc.edges, executeCommand]
  );

  const handleAddGroup = useCallback(
    (style: 'boundary' | 'container' | 'swimlane' | 'card' = 'container') => {
      const newGroup: DiagramGroup = {
        id: createGroupId(),
        title: 'New group',
        subtitle: '',
        style,
        position: { x: 120, y: 120 },
        size: { width: 360, height: 240 },
      };
      executeCommand(new InsertGroupCommand(newGroup));
      setSelectedGroupId(newGroup.id);
    },
    [executeCommand]
  );

  // Wrap currently-selected nodes in a new group. Computes a bounding
  // box from the selected nodes (with 32px padding) and assigns them.
  const handleGroupSelection = useCallback(() => {
    if (!selectedNodeId) return;
    const selectedIds = new Set(
      doc.nodes.filter((n) => n.id === selectedNodeId).map((n) => n.id)
    );
    if (selectedIds.size === 0) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of doc.nodes) {
      if (!selectedIds.has(n.id)) continue;
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + n.size.width);
      maxY = Math.max(maxY, n.position.y + n.size.height);
    }
    if (!Number.isFinite(minX)) return;
    const pad = 32;
    const newGroup: DiagramGroup = {
      id: createGroupId(),
      title: 'Group',
      subtitle: '',
      style: 'container',
      position: { x: minX - pad, y: minY - pad },
      size: { width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 },
    };
    // Insert the group, then assign the nodes in a second command so
    // both appear in the undo stack independently.
    executeCommand(new InsertGroupCommand(newGroup));
    executeCommand(new AssignNodesToGroupCommand(newGroup.id, Array.from(selectedIds)));
    setSelectedGroupId(newGroup.id);
    setSelectedNodeId(null);
  }, [doc.nodes, executeCommand, selectedNodeId]);

  const handleUpdateGroup = useCallback(
    (groupId: string, updates: Partial<DiagramGroup>) => {
      const existing = (doc.groups ?? []).find((g) => g.id === groupId);
      if (!existing) return;
      executeCommand(new UpdateGroupCommand(groupId, updates, existing));
    },
    [doc.groups, executeCommand]
  );

  /**
   * Hard-delete the currently selected node/edge/group. Wired to the
   * trash button in the PropertiesPanel — pressing the keyboard's
   * Backspace or Delete key still goes through React Flow's `onNodesChange`
   * / `onEdgesChange` channels (which dispatch the same commands).
   * After deletion we also clear the local selection ids so the panel
   * snaps back to its empty state instead of holding a stale id.
   */
  const handleDeleteSelected = useCallback(
    (kind: 'node' | 'edge' | 'group') => {
      if (kind === 'node' && selectedNodeId) {
        const existing = doc.nodes.find((n) => n.id === selectedNodeId);
        if (existing) {
          executeCommand(new DeleteNodeCommand(selectedNodeId));
          setSelectedNodeId(null);
        }
      } else if (kind === 'edge' && selectedEdgeId) {
        const existing = doc.edges.find((e) => e.id === selectedEdgeId);
        if (existing) {
          executeCommand(new DeleteEdgeCommand(selectedEdgeId));
          setSelectedEdgeId(null);
        }
      } else if (kind === 'group' && selectedGroupId) {
        const existing = (doc.groups ?? []).find((g) => g.id === selectedGroupId);
        if (existing) {
          executeCommand(new DeleteGroupCommand(selectedGroupId));
          setSelectedGroupId(null);
        }
      }
    },
    [doc.nodes, doc.edges, doc.groups, executeCommand, selectedNodeId, selectedEdgeId, selectedGroupId]
  );

  const handleAutoLayout = useCallback(async () => {
    try {
      const layoutResult = await computeElkLayout(doc, { direction: 'horizontal', nodeSpacing: 60, layerSpacing: 100 });
      const updatedNodes = doc.nodes.map((node) => {
        const layoutPos = layoutResult.nodes.find((n) => n.id === node.id);
        return layoutPos ? { ...node, position: { x: layoutPos.position.x, y: layoutPos.position.y } } : node;
      });
      const updatedDoc: DiagramDocument = {
        ...doc,
        nodes: updatedNodes,
        edges: doc.edges.map((edge) => {
          const layoutEdge = layoutResult.edges.find((e) => e.id === edge.id);
          return layoutEdge ? { ...edge, waypoints: layoutEdge.waypoints } : edge;
        }),
      };
      historyManagerRef.current.clear();
      setDoc(updatedDoc);
    } catch (err) {
      console.error('Auto layout failed:', err);
    }
  }, [doc]);

  const handleLoadTemplate = useCallback((_templateKey: string) => {
    // Templates were removed when the gallery was deleted. The toolbar's
    // templates dropdown is gone; this handler is kept as a no-op so the
    // EditorToolbar's prop type stays valid (it still receives the prop
    // and just doesn't surface it).
  }, []);

  const handleCreateCollection = useCallback((name: string) => {
    setCollections((prev) => [...prev, { id: `col-${Date.now()}`, name, items: [] }]);
  }, []);

  const handleSaveToCollection = useCallback(
    (collectionId: string, name: string) => {
      const selectedNode = doc.nodes.find((n) => n.id === selectedNodeId);
      if (!selectedNode) return;
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                items: [
                  ...c.items,
                  {
                    id: `item-${Date.now()}`,
                    name,
                    category: selectedNode.data.role ?? 'General',
                    nodeTemplate: {
                      type: selectedNode.type,
                      shape: selectedNode.shape,
                      size: selectedNode.size,
                      data: selectedNode.data,
                      style: selectedNode.style,
                    },
                  },
                ],
              }
            : c
        )
      );
    },
    [doc.nodes, selectedNodeId]
  );

  const handleDeleteCollectionItem = useCallback((collectionId: string, itemId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    );
  }, []);

  /**
   * Save flow:
   *  1. If the editor isn't yet bound to a project, create an "Untitled"
   *     project and a diagram in one round-trip (POST /projects, then
   *     POST /projects/:id/diagrams).
   *  2. If the editor is bound, PUT /api/v1/diagrams/:id.
   *  3. On success, push the new ids into the URL so a refresh keeps the
   *     editor pointed at the same record.
   */
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setLoadError(null);
    try {
      const fullDoc = { ...doc, customCollections: collections };
      const name = doc.metadata.title || 'Untitled';
      const description = doc.metadata.description;

      if (!binding.diagramId) {
        // First save. Create project (if needed), then diagram.
        let projectId = binding.projectId;
        if (!projectId) {
          const projectRes = await fetch('/api/v1/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Untitled' }),
          });
          if (!projectRes.ok) {
            throw new Error(`Failed to create project (${projectRes.status})`);
          }
          const projectBody = await projectRes.json();
          projectId = projectBody?.data?.id;
        }
        if (!projectId) {
          throw new Error('No project id returned from server');
        }

        const diagramRes = await fetch(`/api/v1/projects/${projectId}/diagrams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, document: fullDoc }),
        });
        if (!diagramRes.ok) {
          throw new Error(`Failed to create diagram (${diagramRes.status})`);
        }
        const diagramBody = await diagramRes.json();
        const record = diagramBody?.data;
        if (record?.id) {
          setBinding({ projectId: record.projectId ?? projectId, diagramId: record.id });
          // Push the ids into the URL so a refresh reopens the same record.
          const url = new URL(window.location.href);
          url.searchParams.set('projectId', record.projectId ?? projectId);
          url.searchParams.set('diagramId', record.id);
          window.history.replaceState({}, '', url.toString());
        }
      } else {
        const res = await fetch(`/api/v1/diagrams/${binding.diagramId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, document: fullDoc }),
        });
        if (!res.ok) {
          throw new Error(`Save failed (${res.status})`);
        }
      }
    } catch (e) {
      console.error('Failed to save diagram:', e);
      setLoadError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [doc, collections, binding]);

  const selectedNode = useMemo(
    () => doc.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [doc.nodes, selectedNodeId]
  );
  const selectedEdge = useMemo(
    () => doc.edges.find((e) => e.id === selectedEdgeId) ?? null,
    [doc.edges, selectedEdgeId]
  );
  const selectedGroup = useMemo(
    () => (doc.groups ?? []).find((g) => g.id === selectedGroupId) ?? null,
    [doc.groups, selectedGroupId]
  );

  return (
    <ThemeContext.Provider value={resolvedTheme}>
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <ToolbarWithHistory
        historyManagerRef={historyManagerRef}
        title={doc.metadata.title}
        onTitleChange={(newTitle) => executeCommand(new UpdateMetadataCommand({ title: newTitle }, doc.metadata))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        currentTheme={doc.theme}
        onThemeChange={(newTheme) => executeCommand(new ChangeThemeCommand(newTheme, doc.theme))}
        onAutoLayout={handleAutoLayout}
        onSave={handleSave}
        onOpenExport={() => setIsExportOpen(true)}
        onLoadTemplate={handleLoadTemplate}
        onOpenCopilot={() => setCopilotOpen((v) => !v)}
        isSaving={isSaving}
        paletteOpen={paletteOpen}
        onTogglePalette={() => setPaletteOpen((v) => !v)}
        propertiesOpen={propertiesOpen}
        onToggleProperties={() => setPropertiesOpen((v) => !v)}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {paletteOpen && (
          <ComponentPalette
            onAddNode={handleAddNode}
            collections={collections}
            onSaveToCollection={handleSaveToCollection}
            onCreateCollection={handleCreateCollection}
            onDeleteCollectionItem={handleDeleteCollectionItem}
            selectedNode={selectedNode}
            onAddGroup={handleAddGroup}
            onGroupSelection={handleGroupSelection}
          />
        )}

        <div
          ref={reactFlowWrapper}
          onDragOver={onDragOver}
          onDrop={onDrop}
          style={{ flex: 1, position: 'relative', background: 'var(--color-bg)' }}
        >
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            proOptions={{ hideAttribution: true }}
            // selectionOnDrag was the single biggest contributor to drag
            // lag: it caused marquee selection to flip selectedNodeId on
            // every cursor pixel during a pan, invalidating the flowNodes
            // memo and re-rendering every node. Now pan is unconstrained;
            // users can still marquee-select by holding Shift.
            selectionOnDrag={false}
            panOnScroll
          >
            <Background color="var(--color-hairline)" gap={32} size={1} />
          </ReactFlow>
        </div>

        {propertiesOpen &&
          (copilotOpen ? (
            <AiCopilotPanel
              doc={doc}
              isOpen={copilotOpen}
              onClose={() => setCopilotOpen(false)}
              onApplyCommand={executeCommand}
            />
          ) : (
            <PropertiesPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              selectedGroup={selectedGroup}
              onUpdateNode={handleUpdateNode}
              onUpdateEdge={handleUpdateEdge}
              onUpdateGroup={handleUpdateGroup}
              onDelete={handleDeleteSelected}
            />
          ))}
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        doc={{ ...doc, customCollections: collections }}
      />
    </div>
    </ThemeContext.Provider>
  );
}

/**
 * Renders the editor toolbar AND owns the 200ms canUndo/canRedo polling.
 * Lives in its own component so that the 5Hz tick re-renders the toolbar
 * alone (which is cheap and rare to change) rather than the entire editor
 * (which holds the React Flow canvas). This is the single biggest win
 * after dropping `selectionOnDrag`.
 */
function ToolbarWithHistory({
  historyManagerRef,
  title,
  onTitleChange,
  onUndo,
  onRedo,
  currentTheme,
  onThemeChange,
  onAutoLayout,
  onSave,
  onOpenExport,
  onLoadTemplate,
  onOpenCopilot,
  isSaving,
  paletteOpen,
  onTogglePalette,
  propertiesOpen,
  onToggleProperties,
}: {
  historyManagerRef: React.MutableRefObject<DiagramHistoryManager>;
  title: string;
  onTitleChange: (t: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  currentTheme: ThemeId;
  onThemeChange: (t: ThemeId) => void;
  onAutoLayout: () => void;
  onSave: () => void;
  onOpenExport: () => void;
  onLoadTemplate: (t: string) => void;
  onOpenCopilot: () => void;
  isSaving: boolean;
  paletteOpen: boolean;
  onTogglePalette: () => void;
  propertiesOpen: boolean;
  onToggleProperties: () => void;
}) {
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  useEffect(() => {
    const update = () =>
      setHistoryState({
        canUndo: historyManagerRef.current.canUndo(),
        canRedo: historyManagerRef.current.canRedo(),
      });
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [historyManagerRef]);

  return (
    <EditorToolbar
      title={title}
      onTitleChange={onTitleChange}
      canUndo={historyState.canUndo}
      canRedo={historyState.canRedo}
      onUndo={onUndo}
      onRedo={onRedo}
      currentTheme={currentTheme}
      onThemeChange={onThemeChange}
      onAutoLayout={onAutoLayout}
      onSave={onSave}
      onOpenExport={onOpenExport}
      onLoadTemplate={onLoadTemplate}
      onOpenCopilot={onOpenCopilot}
      isSaving={isSaving}
      paletteOpen={paletteOpen}
      onTogglePalette={onTogglePalette}
      propertiesOpen={propertiesOpen}
      onToggleProperties={onToggleProperties}
    />
  );
}

export default function EditorPage() {
  return (
    <ReactFlowProvider>
      <Suspense fallback={null}>
        <EditorCanvasContent />
      </Suspense>
    </ReactFlowProvider>
  );
}
