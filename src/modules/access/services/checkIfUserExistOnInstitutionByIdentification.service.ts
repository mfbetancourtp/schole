import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CreateOrUpdateUserDto } from '../dtos/createOrUpdateUser.dto';

export class CheckIfUserExistOnInstitutionByIdentificationService {
  async run(identification: any) {
    return axios.get<CreateOrUpdateUserDto>(`${services.users}/access/check-users-exist/${identification}`).then((response) => response.data);
  }
}
