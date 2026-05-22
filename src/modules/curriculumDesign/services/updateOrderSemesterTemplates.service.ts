import { services } from '../../../shared/constant/services';
import { PostBaseService } from '../../../shared/services/PostCreateOrUpdateBase.service';

interface SemesterTemplate {
  semesterTemplateId: number;
  order: number;
}

export class UpdateOrderSemesterTemplatesService extends PostBaseService<SemesterTemplate[]> {
  url = `${services.structure}/semesterTemplates/updateOrder`;
  isFormData = false;
}
