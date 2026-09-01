import {
  diagramRepository,
  projectRepository,
  type DiagramRecord,
  type CreateDiagramDto,
  type UpdateDiagramDto,
} from '@platform/db';
import { validateDiagramDocument } from '@platform/diagram-schema';

export class DiagramService {
  /** List every diagram across every project. Used by the dashboard's
   *  optional "all projects" view if we add one later. Most callers should
   *  use `listByProject`. */
  async listDiagrams(): Promise<DiagramRecord[]> {
    return await diagramRepository.listAll();
  }

  async listByProject(projectId: string): Promise<DiagramRecord[]> {
    return await diagramRepository.listByProject(projectId);
  }

  async getDiagram(id: string): Promise<DiagramRecord | null> {
    return await diagramRepository.findById(id);
  }

  async createDiagram(dto: CreateDiagramDto): Promise<DiagramRecord> {
    const validation = validateDiagramDocument(dto.document);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
    }

    // Foreign-key check: the project must exist before we attach a diagram
    // to it. Without this we'd end up with orphan records on bad input.
    const project = await projectRepository.findById(dto.projectId);
    if (!project) {
      throw new Error(`Project not found: ${dto.projectId}`);
    }

    return await diagramRepository.create(dto);
  }

  async updateDiagram(id: string, dto: UpdateDiagramDto): Promise<DiagramRecord | null> {
    if (dto.document) {
      const validation = validateDiagramDocument(dto.document);
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
      }
    }

    return await diagramRepository.update(id, dto);
  }

  async deleteDiagram(id: string): Promise<boolean> {
    return await diagramRepository.delete(id);
  }

  async getVersions(id: string) {
    return await diagramRepository.listVersions(id);
  }
}

export const diagramService = new DiagramService();
