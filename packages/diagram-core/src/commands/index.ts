import type {
  DiagramDocument,
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  DiagramAnnotation,
  ThemeId,
  Point,
  DiagramMetadata,
} from '@platform/diagram-schema';

export interface DiagramCommand {
  readonly type: string;
  execute(doc: DiagramDocument): DiagramDocument;
  undo(doc: DiagramDocument): DiagramDocument;
}

export class InsertNodeCommand implements DiagramCommand {
  readonly type = 'INSERT_NODE';
  constructor(public readonly node: DiagramNode) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: [...doc.nodes, this.node],
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.filter((n) => n.id !== this.node.id),
      edges: doc.edges.filter(
        (e) => e.source.nodeId !== this.node.id && e.target.nodeId !== this.node.id
      ),
    };
  }
}

export class MoveNodeCommand implements DiagramCommand {
  readonly type = 'MOVE_NODE';
  constructor(
    public readonly nodeId: string,
    public readonly newPosition: Point,
    public readonly prevPosition: Point
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) => (n.id === this.nodeId ? { ...n, position: this.newPosition } : n)),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) => (n.id === this.nodeId ? { ...n, position: this.prevPosition } : n)),
    };
  }
}

export class UpdateNodeCommand implements DiagramCommand {
  readonly type = 'UPDATE_NODE';
  constructor(
    public readonly nodeId: string,
    public readonly patch: Partial<DiagramNode>,
    public readonly prevNode: DiagramNode
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) =>
        n.id === this.nodeId
          ? {
              ...n,
              ...this.patch,
              data: { ...n.data, ...(this.patch.data ?? {}) },
            }
          : n
      ),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) => (n.id === this.nodeId ? this.prevNode : n)),
    };
  }
}

export class DeleteNodeCommand implements DiagramCommand {
  readonly type = 'DELETE_NODE';
  private deletedNode?: DiagramNode;
  private attachedEdges: DiagramEdge[] = [];

  constructor(public readonly nodeId: string) {}

  execute(doc: DiagramDocument): DiagramDocument {
    this.deletedNode = doc.nodes.find((n) => n.id === this.nodeId);
    this.attachedEdges = doc.edges.filter(
      (e) => e.source.nodeId === this.nodeId || e.target.nodeId === this.nodeId
    );

    return {
      ...doc,
      nodes: doc.nodes.filter((n) => n.id !== this.nodeId),
      edges: doc.edges.filter(
        (e) => e.source.nodeId !== this.nodeId && e.target.nodeId !== this.nodeId
      ),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    if (!this.deletedNode) return doc;
    return {
      ...doc,
      nodes: [...doc.nodes, this.deletedNode],
      edges: [...doc.edges, ...this.attachedEdges],
    };
  }
}

export class ConnectNodesCommand implements DiagramCommand {
  readonly type = 'CONNECT_NODES';
  constructor(public readonly edge: DiagramEdge) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      edges: [...doc.edges, this.edge],
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      edges: doc.edges.filter((e) => e.id !== this.edge.id),
    };
  }
}

export class DeleteEdgeCommand implements DiagramCommand {
  readonly type = 'DELETE_EDGE';
  private deletedEdge?: DiagramEdge;

  constructor(public readonly edgeId: string) {}

  execute(doc: DiagramDocument): DiagramDocument {
    this.deletedEdge = doc.edges.find((e) => e.id === this.edgeId);
    return {
      ...doc,
      edges: doc.edges.filter((e) => e.id !== this.edgeId),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    if (!this.deletedEdge) return doc;
    return {
      ...doc,
      edges: [...doc.edges, this.deletedEdge],
    };
  }
}

export class UpdateEdgeCommand implements DiagramCommand {
  readonly type = 'UPDATE_EDGE';
  constructor(
    public readonly edgeId: string,
    public readonly patch: Partial<DiagramEdge>,
    public readonly prevEdge: DiagramEdge
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      edges: doc.edges.map((e) =>
        e.id === this.edgeId
          ? {
              ...e,
              ...this.patch,
              data: { ...e.data, ...(this.patch.data ?? {}) },
            }
          : e
      ),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      edges: doc.edges.map((e) => (e.id === this.edgeId ? this.prevEdge : e)),
    };
  }
}

export class ChangeThemeCommand implements DiagramCommand {
  readonly type = 'CHANGE_THEME';
  constructor(
    public readonly newTheme: ThemeId,
    public readonly prevTheme: ThemeId
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      theme: this.newTheme,
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      theme: this.prevTheme,
    };
  }
}

export class UpdateMetadataCommand implements DiagramCommand {
  readonly type = 'UPDATE_METADATA';
  constructor(
    public readonly patch: Partial<DiagramMetadata>,
    public readonly prevMetadata: DiagramMetadata
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      metadata: { ...doc.metadata, ...this.patch },
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      metadata: this.prevMetadata,
    };
  }
}

export class BatchCommand implements DiagramCommand {
  readonly type = 'BATCH_COMMAND';
  constructor(public readonly commands: DiagramCommand[]) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return this.commands.reduce((currentDoc, cmd) => cmd.execute(currentDoc), doc);
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return [...this.commands]
      .reverse()
      .reduce((currentDoc, cmd) => cmd.undo(currentDoc), doc);
  }
}
