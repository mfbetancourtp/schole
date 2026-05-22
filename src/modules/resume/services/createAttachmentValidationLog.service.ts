import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AttachmentValidationLogPayloadDto } from '../dtos/attachmentValidation.dto';

export class CreateAttachmentValidationLogService {
  run(data: AttachmentValidationLogPayloadDto): Promise<any> {
    return axios.patch(`${services.structure}/cv-validation-log`, data).then((response) => response.data);
  }
}
