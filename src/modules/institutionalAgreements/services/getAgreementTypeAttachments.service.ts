import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AgreementTypeAttachmentDto } from '../dtos/agreementTypeAttachment.dto';

export class GetAgreementTypeAttachmentsService {
  async run(agreementTypeId: string | number): Promise<AgreementTypeAttachmentDto[]> {
    return axios.get<AgreementTypeAttachmentDto[]>(`${services.structure}/agreements-types/${agreementTypeId}/attachments`).then((response) => response.data);
  }
}
