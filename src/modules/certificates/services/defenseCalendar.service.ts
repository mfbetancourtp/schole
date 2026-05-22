import type { DefenseCalendarData, DefenseDetail, ProjectOption, NewDefenseForm } from '../dtos/defenseCalendar.dto';
import { defenseCalendarMock } from '../mocks/defenseCalendar';
import { defenseDetailsMock } from '../mocks/defenseCalendarDetails';

const projectOptionsMock: ProjectOption[] = [
  { id: 1, label: 'Sistema de Reconocimiento Facial - María González' },
  { id: 2, label: 'Plataforma E-commerce - Ana Martínez' },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class DefenseCalendarService {
  async getCalendarData(): Promise<DefenseCalendarData> {
    await delay(600);
    return defenseCalendarMock;
  }

  async getDefenseDetail(defenseId: number): Promise<DefenseDetail | null> {
    await delay(400);
    return defenseDetailsMock[defenseId] ?? null;
  }

  async getProjectOptions(): Promise<ProjectOption[]> {
    await delay(400);
    return projectOptionsMock;
  }

  async createDefense(_form: NewDefenseForm): Promise<{ success: boolean }> {
    return { success: true };
  }
}

export const defenseCalendarService = new DefenseCalendarService();
