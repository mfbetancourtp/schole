import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AgreementTypeSectionDto } from '../dtos/agreementTypeSection.dto';

export class GetAgreementTypeSectionsService {
  async run(agreementTypeId: string | number): Promise<AgreementTypeSectionDto[]> {
    return axios.get<AgreementTypeSectionDto[]>(`${services.structure}/agreements-types/${agreementTypeId}/sections`).then((response) => response.data);
  }
}
