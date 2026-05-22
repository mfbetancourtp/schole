import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { UpsertPostRequest } from '../dtos/post.dto';

export class CreateOrUpdateGraduatePostService extends CreateOrUpdateBaseService<UpsertPostRequest> {
  url = `${services.graduates}/posts`;
  isFormData = false;
}
