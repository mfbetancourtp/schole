import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetInstitutionRolesService {
  run(institutionId: number = 75): Promise<any> {
    return axios
      .get<any>(`${services.users}/access/roles`, {
        headers: {
          institutionId: String(institutionId),
        },
      })
      .then((response) => response.data);
  }
}
