import {
  projectRepository,
  diagramRepository,
  type ProjectRecord,
  type CreateProjectDto,
  type UpdateProjectDto,
} from '@platform/db';

export class ProjectService {
  async listProjects(): Promise<ProjectRecord[]> {
    return await projectRepository.listAll();
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    return await projectRepository.findById(id);
  }

  async createProject(dto: CreateProjectDto): Promise<ProjectRecord> {
    const name = dto.name?.trim();
    if (!name) {
      throw new Error('Project name is required');
    }
    return await projectRepository.create({ ...dto, name });
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectRecord | null> {
    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new Error('Project name cannot be empty');
      }
      dto = { ...dto, name: trimmed };
    }
    return await projectRepository.update(id, dto);
  }

  async deleteProject(id: string): Promise<boolean> {
    // Cascade: drop every diagram (and its versions) under this project
    // first, then the project itself. We do it in this order so a
    // partial failure leaves the data consistent — diagrams without a
    // project are orphan but discoverable; a project without its
    // diagrams is misleading.
    await diagramRepository.deleteByProject(id);
    return await projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();
