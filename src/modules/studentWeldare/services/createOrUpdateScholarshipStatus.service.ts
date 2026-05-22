import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { ScholarshipStatusDto } from '../dtos/scholarshipStatus.dto';

export class CreateOrUpdateScholarshipStatusService extends CreateOrUpdateBaseService<ScholarshipStatusDto> {
  url = `${services.structure}/scholarship-statuses`;
  isFormData = false;

  async run(data: ScholarshipStatusDto, id?: number): Promise<any> {
    // Only send basic fields, exclude nextStatuses, totalNextStatuses, isFinalStatus
    const cleanData = {
      code: data.code?.trim() || '',
      name: data.name?.trim() || '',
      description: data.description?.trim() || '',
      color: data.color || '#2563eb',
    };

    // Call parent class run with cleaned data
    return super.run(cleanData as ScholarshipStatusDto, id);
  }
}
