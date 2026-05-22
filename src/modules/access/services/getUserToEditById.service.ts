import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { UserDataDto } from '../dtos/user.dto';

export class GetUserToEditByIdService {
  async run(userId: any) {
    return axios.get<UserDataDto>(`${services.users}/access/users-to-edit/${userId}`).then((response) => response.data);
  }
}
