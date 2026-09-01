import type { DiagramDocument } from '@platform/diagram-schema';
import type { DiagramCommand } from '../commands';

export class DiagramHistoryManager {
  private undoStack: DiagramCommand[] = [];
  private redoStack: DiagramCommand[] = [];
  private maxHistory: number;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  execute(command: DiagramCommand, currentDoc: DiagramDocument): DiagramDocument {
    const nextDoc = command.execute(currentDoc);
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    return nextDoc;
  }

  undo(currentDoc: DiagramDocument): DiagramDocument {
    const cmd = this.undoStack.pop();
    if (!cmd) return currentDoc;
    const prevDoc = cmd.undo(currentDoc);
    this.redoStack.push(cmd);
    return prevDoc;
  }

  redo(currentDoc: DiagramDocument): DiagramDocument {
    const cmd = this.redoStack.pop();
    if (!cmd) return currentDoc;
    const nextDoc = cmd.execute(currentDoc);
    this.undoStack.push(cmd);
    return nextDoc;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
