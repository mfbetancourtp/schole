import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetApplicationTypeDocumentsService {
  run(params: { applicationTypesId: number; noPag?: boolean }) {
    return axios.get<any>(`${services.structure}/application-types-documents`, { params }).then((response) => response.data);
  }
}
