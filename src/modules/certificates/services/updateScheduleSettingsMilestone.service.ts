import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { UpdateScheduleSettingMilestoneDto } from '../dtos/scheduleConfig.dto';

export class UpdateScheduleSettingsMilestoneService extends CreateOrUpdateBaseService<UpdateScheduleSettingMilestoneDto> {
  url = `${services.structure}/schedule-settings-milestones`;
  isFormData = false;
}
