import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { CreateScheduleSettingDto } from '../dtos/scheduleConfig.dto';

export class CreateScheduleSettingsService extends CreateOrUpdateBaseService<CreateScheduleSettingDto> {
  url = `${services.structure}/schedule-settings`;
  isFormData = false;
}
