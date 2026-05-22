import type { CoordinationPanelData, PostulationDetail, TutorSelectOption } from '../dtos/coordinationPanel.dto';
import { coordinationPanelDataMock } from '../mocks/coordinationPanel';
import { postulationDetailsMock, tutorSelectOptionsMock } from '../mocks/postulationDetails';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class CoordinationPanelService {
  async getPanelData(): Promise<CoordinationPanelData> {
    await delay(600);
    return coordinationPanelDataMock;
  }

  async getPostulationDetail(postulationId: number): Promise<PostulationDetail | null> {
    await delay(400);
    return postulationDetailsMock[postulationId] ?? null;
  }

  async getTutorOptions(): Promise<TutorSelectOption[]> {
    return tutorSelectOptionsMock;
  }

  async approvePostulation(_postulationId: number, _tutorId: number): Promise<{ success: boolean }> {
    return { success: true };
  }

  async rejectPostulation(_postulationId: number): Promise<{ success: boolean }> {
    return { success: true };
  }
}

export const coordinationPanelService = new CoordinationPanelService();
