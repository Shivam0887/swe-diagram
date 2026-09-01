'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
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
  NodeType,
  NodeShape,
  ThemeId,
  Point,
  CustomCollection,
} from '@platform/diagram-schema';
import { sampleDiagrams } from '@platform/diagram-schema';
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
  createNodeId,
  createEdgeId,
  getNodeDefinition,
} from '@platform/diagram-core';
import { computeElkLayout } from '@platform/diagram-layout';

import { CustomDiagramNode } from '../../components/editor/CustomDiagramNode';
import { FilletOrthogonalEdge } from '../../components/editor/FilletOrthogonalEdge';
import { BezierCurvedEdge } from '../../components/editor/BezierCurvedEdge';
import { StraightEdge } from '../../components/editor/StraightEdge';
import { StepOrthogonalEdge } from '../../components/editor/StepOrthogonalEdge';
import { ComponentPalette } from '../../components/editor/ComponentPalette';
import { PropertiesPanel } from '../../components/editor/PropertiesPanel';
import { EditorToolbar } from '../../components/editor/EditorToolbar';
import { ExportModal } from '../../components/editor/ExportModal';
import { AiCopilotPanel } from '../../components/editor/AiCopilotPanel';

const nodeTypes = { customDiagramNode: CustomDiagramNode };
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

function EditorCanvasContent() {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Seed from ?doc=<sampleKey> when present, else default
  const initialDoc = useMemo<DiagramDocument>(() => {
    const requested = searchParams?.get('doc');
    if (requested) {
      const baseKey = requested.split('--')[0]; // strip theme-variant suffix from gallery
      if (sampleDiagrams[baseKey]) return sampleDiagrams[baseKey];
    }
    return sampleDiagrams['aws-three-tier-elasticache'];
  }, [searchParams]);

  const [doc, setDoc] = useState<DiagramDocument>(initialDoc);
  const historyManagerRef = useRef(new DiagramHistoryManager(50));

  const [collections, setCollections] = useState<CustomCollection[]>(
    () =>
      initialDoc.customCollections ?? [
        { id: 'col-default', name: 'My Custom Blocks', items: [] },
      ]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Refresh undo/redo state for the toolbar
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  useEffect(() => {
    const update = () =>
      setHistoryState({
        canUndo: historyManagerRef.current.canUndo(),
        canRedo: historyManagerRef.current.canRedo(),
      });
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, []);

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
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo]);

  const flowNodes: Node[] = useMemo(
    () =>
      doc.nodes.map((node) => ({
        id: node.id,
        type: 'customDiagramNode',
        position: node.position,
        data: {
          ...node.data,
          shape: node.shape ?? 'rounded_card',
          style: node.style,
          themeId: doc.theme,
        },
        selected: node.id === selectedNodeId,
      })),
    [doc.nodes, doc.theme, selectedNodeId]
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      doc.edges.map((edge) => ({
        id: edge.id,
        source: edge.source.nodeId,
        target: edge.target.nodeId,
        sourceHandle: edge.source.portId,
        targetHandle: edge.target.portId,
        type: edgeTypeFor(edge.routing),
        data: {
          ...edge.data,
          waypoints: edge.waypoints,
          // Edge style is at the top level in the IR; the React-Flow edge
          // component reads it from data.dashStyle.
          dashStyle: edge.style,
        },
        selected: edge.id === selectedEdgeId,
      })),
    [doc.edges, selectedEdgeId]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') executeCommand(new DeleteNodeCommand(change.id));
        else if (change.type === 'select') {
          if (change.selected) {
            setSelectedNodeId(change.id);
            setSelectedEdgeId(null);
          } else if (selectedNodeId === change.id) setSelectedNodeId(null);
        }
      }
    },
    [executeCommand, selectedNodeId]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') executeCommand(new DeleteEdgeCommand(change.id));
        else if (change.type === 'select') {
          if (change.selected) {
            setSelectedEdgeId(change.id);
            setSelectedNodeId(null);
          } else if (selectedEdgeId === change.id) setSelectedEdgeId(null);
        }
      }
    },
    [executeCommand, selectedEdgeId]
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
      const existing = doc.nodes.find((n) => n.id === node.id);
      if (!existing) return;
      if (existing.position.x === node.position.x && existing.position.y === node.position.y) return;
      executeCommand(new MoveNodeCommand(node.id, node.position, existing.position));
    },
    [doc.nodes, executeCommand]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
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
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/diagram-node');
      if (!raw) return;
      const { type, shape } = JSON.parse(raw) as { type: NodeType; shape?: NodeShape };
      if (!type) return;
      const pos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      handleAddNode(type, shape, undefined, undefined);
      // Snap the most recent node to the drop position
      setTimeout(() => {
        setDoc((currentDoc) => {
          const last = currentDoc.nodes[currentDoc.nodes.length - 1];
          if (!last) return currentDoc;
          return { ...currentDoc, nodes: currentDoc.nodes.map((n) => (n.id === last.id ? { ...n, position: { x: Math.round(pos.x), y: Math.round(pos.y) } } : n)) };
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

  const handleLoadTemplate = useCallback((templateKey: string) => {
    const templateDoc = sampleDiagrams[templateKey];
    if (templateDoc) {
      historyManagerRef.current.clear();
      setDoc(templateDoc);
      if (templateDoc.customCollections) setCollections(templateDoc.customCollections);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
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

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const fullDoc = { ...doc, customCollections: collections };
      await fetch('/api/v1/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: doc.metadata.title, description: doc.metadata.description, document: fullDoc }),
      });
    } catch (e) {
      console.error('Failed to save diagram:', e);
    } finally {
      setIsSaving(false);
    }
  }, [doc, collections]);

  const selectedNode = useMemo(
    () => doc.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [doc.nodes, selectedNodeId]
  );
  const selectedEdge = useMemo(
    () => doc.edges.find((e) => e.id === selectedEdgeId) ?? null,
    [doc.edges, selectedEdgeId]
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <EditorToolbar
        title={doc.metadata.title}
        onTitleChange={(newTitle) => executeCommand(new UpdateMetadataCommand({ title: newTitle }, doc.metadata))}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
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
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ComponentPalette
          onAddNode={handleAddNode}
          collections={collections}
          onSaveToCollection={handleSaveToCollection}
          onCreateCollection={handleCreateCollection}
          onDeleteCollectionItem={handleDeleteCollectionItem}
          selectedNode={selectedNode}
        />

        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative', background: 'var(--color-bg)' }}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            defaultEdgeOptions={{ type: 'filletOrthogonal' }}
            proOptions={{ hideAttribution: true }}
            selectionOnDrag
            panOnScroll
          >
            <Background color="var(--color-hairline)" gap={24} size={1} />
          </ReactFlow>
        </div>

        {copilotOpen ? (
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
            onUpdateNode={handleUpdateNode}
            onUpdateEdge={handleUpdateEdge}
          />
        )}
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        doc={{ ...doc, customCollections: collections }}
      />
    </div>
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
