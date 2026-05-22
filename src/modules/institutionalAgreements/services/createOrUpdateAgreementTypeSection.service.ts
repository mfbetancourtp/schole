import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { CreateAgreementTypeSectionDto } from '../dtos/agreementTypeSection.dto';

const BASE_URL = `${services.structure}/agreements-types-sections`;

export class CreateOrUpdateAgreementTypeSectionService {
  // POST: crea un campo nuevo (objeto simple)
  create(data: CreateAgreementTypeSectionDto): Promise<any> {
    return axios.post(BASE_URL, data).then((r) => r.data);
  }

  // PUT: actualiza campos existentes (array, sin ID en URL)
  update(fields: (CreateAgreementTypeSectionDto & { id: number })[]): Promise<any> {
    return axios.put(BASE_URL, fields).then((r) => r.data);
  }
}
