import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { UpsertCommentRequest } from '../dtos/post.dto';

export class CreateOrUpdatePostCommentService extends CreateOrUpdateBaseService<UpsertCommentRequest> {
  url = `${services.graduates}/post-comments`;
  isFormData = false;
}
