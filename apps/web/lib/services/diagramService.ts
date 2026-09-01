import { diagramRepository, type DiagramRecord, type CreateDiagramDto, type UpdateDiagramDto } from '@platform/db';
import { validateDiagramDocument, type DiagramDocument } from '@platform/diagram-schema';

export class DiagramService {
  async listDiagrams(): Promise<DiagramRecord[]> {
    return await diagramRepository.listAll();
  }

  async getDiagram(id: string): Promise<DiagramRecord | null> {
    return await diagramRepository.findById(id);
  }

  async createDiagram(dto: CreateDiagramDto): Promise<DiagramRecord> {
    const validation = validateDiagramDocument(dto.document);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
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
