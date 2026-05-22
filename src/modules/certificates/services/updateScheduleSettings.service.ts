import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { CreateScheduleSettingDto } from '../dtos/scheduleConfig.dto';

export class UpdateScheduleSettingsService extends CreateOrUpdateBaseService<CreateScheduleSettingDto> {
  url = `${services.structure}/schedule-settings`;
  isFormData = false;
}
