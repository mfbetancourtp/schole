import type { FacultyOption, TutorOption, PartnerResult, PostulationFormData, PostulationSubmitResult, PostulationListItem } from '../dtos/postulation.dto';
import { facultyOptionsMock, tutorOptionsMock, partnerSearchResultsMock, postulationListMock } from '../mocks/postulation';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class PostulationService {
  async getFaculties(): Promise<FacultyOption[]> {
    await delay(600);
    return facultyOptionsMock;
  }

  async getTutors(): Promise<TutorOption[]> {
    return tutorOptionsMock;
  }

  async searchPartners(query: string): Promise<PartnerResult[]> {
    if (!query) return partnerSearchResultsMock;
    const q = query.toLowerCase();
    return partnerSearchResultsMock.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }

  async submitPostulation(_form: PostulationFormData): Promise<PostulationSubmitResult> {
    return {
      success: true,
      trackingNumber: '#RAD-2026-180',
    };
  }

  async getPostulations(): Promise<PostulationListItem[]> {
    await delay(600);
    return postulationListMock;
  }
}

export const postulationService = new PostulationService();
