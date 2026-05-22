import type { ScheduleConfigData, TemplateDetail, MilestoneItem } from '../dtos/scheduleConfig.dto';
import { scheduleConfigMock } from '../mocks/scheduleConfig';
import { templateDetailsMock } from '../mocks/scheduleConfigDetails';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class ScheduleConfigService {
  async getConfigData(): Promise<ScheduleConfigData> {
    await delay(600);
    return scheduleConfigMock;
  }

  async getTemplateDetail(id: number): Promise<TemplateDetail> {
    await delay(400);
    return templateDetailsMock[id];
  }

  async saveTemplate(templateId: number, milestones: MilestoneItem[]): Promise<{ success: boolean }> {
    console.log('Saving template', templateId, milestones);
    return Promise.resolve({ success: true });
  }
}

export const scheduleConfigService = new ScheduleConfigService();
