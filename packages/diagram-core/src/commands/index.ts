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

/**
 * Insert a new group. The group is added with no children assigned —
 * users explicitly add nodes to the group via AssignNodeGroupCommand,
 * or by dragging nodes onto it.
 */
export class InsertGroupCommand implements DiagramCommand {
  readonly type = 'INSERT_GROUP';
  constructor(public readonly group: DiagramGroup) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      groups: [...doc.groups, this.group],
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    // Detach any nodes that were still pointing at this group so the
    // undo round-trip leaves the document in a consistent state.
    return {
      ...doc,
      groups: doc.groups.filter((g) => g.id !== this.group.id),
      nodes: doc.nodes.map((n) =>
        n.groupId === this.group.id ? { ...n, groupId: undefined } : n
      ),
    };
  }
}

export class UpdateGroupCommand implements DiagramCommand {
  readonly type = 'UPDATE_GROUP';
  constructor(
    public readonly groupId: string,
    public readonly patch: Partial<DiagramGroup>,
    public readonly prevGroup: DiagramGroup
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      groups: doc.groups.map((g) => (g.id === this.groupId ? { ...g, ...this.patch } : g)),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      groups: doc.groups.map((g) => (g.id === this.groupId ? this.prevGroup : g)),
    };
  }
}

export class MoveGroupCommand implements DiagramCommand {
  readonly type = 'MOVE_GROUP';
  constructor(
    public readonly groupId: string,
    public readonly newPosition: Point,
    public readonly prevPosition: Point
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      groups: doc.groups.map((g) => (g.id === this.groupId ? { ...g, position: this.newPosition } : g)),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      groups: doc.groups.map((g) => (g.id === this.groupId ? { ...g, position: this.prevPosition } : g)),
    };
  }
}

export class DeleteGroupCommand implements DiagramCommand {
  readonly type = 'DELETE_GROUP';
  private deletedGroup?: DiagramGroup;

  constructor(public readonly groupId: string) {}

  execute(doc: DiagramDocument): DiagramDocument {
    this.deletedGroup = doc.groups.find((g) => g.id === this.groupId);
    return {
      ...doc,
      groups: doc.groups.filter((g) => g.id !== this.groupId),
      // Detach member nodes so the doc stays valid.
      nodes: doc.nodes.map((n) =>
        n.groupId === this.groupId ? { ...n, groupId: undefined } : n
      ),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    if (!this.deletedGroup) return doc;
    return {
      ...doc,
      groups: [...doc.groups, this.deletedGroup],
    };
  }
}

/**
 * Assign a single node to a group (or to no group when `groupId` is
 * undefined). Used both for drag-to-group and for explicit assignment
 * from the properties panel.
 */
export class AssignNodeGroupCommand implements DiagramCommand {
  readonly type = 'ASSIGN_NODE_GROUP';
  constructor(
    public readonly nodeId: string,
    public readonly newGroupId: string | undefined,
    public readonly prevGroupId: string | undefined
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) =>
        n.id === this.nodeId ? { ...n, groupId: this.newGroupId } : n
      ),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) =>
        n.id === this.nodeId ? { ...n, groupId: this.prevGroupId } : n
      ),
    };
  }
}

/**
 * Assign many nodes to a group in one undoable step. Used by the
 * "Group selection" command in the editor.
 */
export class AssignNodesToGroupCommand implements DiagramCommand {
  readonly type = 'ASSIGN_NODES_TO_GROUP';
  private prevAssignments: Record<string, string | undefined> = {};

  constructor(
    public readonly groupId: string,
    public readonly nodeIds: string[]
  ) {}

  execute(doc: DiagramDocument): DiagramDocument {
    this.prevAssignments = {};
    return {
      ...doc,
      nodes: doc.nodes.map((n) => {
        if (!this.nodeIds.includes(n.id)) return n;
        this.prevAssignments[n.id] = n.groupId;
        return { ...n, groupId: this.groupId };
      }),
    };
  }

  undo(doc: DiagramDocument): DiagramDocument {
    return {
      ...doc,
      nodes: doc.nodes.map((n) => {
        if (!(n.id in this.prevAssignments)) return n;
        return { ...n, groupId: this.prevAssignments[n.id] };
      }),
    };
  }
}
