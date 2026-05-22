import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AgreementTypeDto } from '../dtos/agreementType.dto';

export class GetAgreementTypeByIdService {
  run(id: string | number): Promise<AgreementTypeDto> {
    return axios.get<AgreementTypeDto>(`${services.structure}/agreements-types/${id}/configuration`).then((response) => response.data);
  }
}
