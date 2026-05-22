import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AttachmentValidationCvSectionKey, AttachmentValidationPeopleDetailResponseDto } from '../dtos/attachmentValidation.dto';

export interface GetAttachmentValidationPeopleDetailParams {
  peopleId: number;
  key?: AttachmentValidationCvSectionKey;
}

export class GetAttachmentValidationPeopleDetailService {
  run(params: GetAttachmentValidationPeopleDetailParams): Promise<AttachmentValidationPeopleDetailResponseDto> {
    const { peopleId, key } = params;

    return axios
      .get<AttachmentValidationPeopleDetailResponseDto>(`${services.structure}/cv-validation/people/${peopleId}`, {
        params: {
          ...(key ? { key } : {}),
        },
      })
      .then((response) => response.data);
  }
}
