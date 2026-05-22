import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { TutorPanelProjectWithMilestonesApi, TutorPanelProjectMemberApi, StudentInfo } from '../dtos/tutorPanel.dto';
import { TutorPanelMilestoneDto } from '../dtos/tutorPanel.dto';

const unwrap = (payload: any) => payload?.data ?? payload;

const getFullName = (people?: { names?: string; lastnames?: string } | null) => {
  if (!people) return '';
  return `${people.names ?? ''} ${people.lastnames ?? ''}`.trim();
};

const buildInitials = (fullName: string) => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
};

const toStudentInfo = (user: { id: number; people: { names: string; lastnames: string } }) => {
  const name = getFullName(user.people);
  return { name, initials: buildInitials(name) };
};

const mapStudents = (project: TutorPanelProjectWithMilestonesApi): StudentInfo[] => {
  const byId = new Map<number, StudentInfo>();

  if (project.user?.id) {
    byId.set(project.user.id, toStudentInfo(project.user));
  }

  (project.members ?? []).forEach((m: TutorPanelProjectMemberApi) => {
    const u = m?.user;
    if (!u?.id) return;
    if (!byId.has(u.id)) {
      byId.set(u.id, toStudentInfo(u));
    }
  });

  return Array.from(byId.values()).filter((s) => Boolean(s.name));
};

export class TutorPanelService {
  async getProjectsWithMilestones(params: { institutionId: number; status?: string }): Promise<TutorPanelProjectWithMilestonesApi[]> {
    const response = await axios.get<any>(`${services.structure}/application-projects-milestones`, { params });
    const payload = unwrap(response.data);

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }

  async getMilestoneCards(params: { institutionId: number; status?: string }): Promise<TutorPanelMilestoneDto[]> {
    const projects = await this.getProjectsWithMilestones(params);
    const cards: TutorPanelMilestoneDto[] = [];

    for (const project of projects) {
      const students = mapStudents(project);
      for (const milestone of project.milestones ?? []) {
        cards.push(TutorPanelMilestoneDto.fromProjectMilestone(project, milestone, students));
      }
    }

    return cards;
  }
}

export const tutorPanelService = new TutorPanelService();
