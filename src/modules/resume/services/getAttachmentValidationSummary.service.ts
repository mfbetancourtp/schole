import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AttachmentValidationSummaryDto } from '../dtos/attachmentValidation.dto';

export class GetAttachmentValidationSummaryService {
  run(): Promise<AttachmentValidationSummaryDto> {
    return axios.get<AttachmentValidationSummaryDto>(`${services.structure}/cv-validation/summary`).then((response) => response.data);
  }
}
