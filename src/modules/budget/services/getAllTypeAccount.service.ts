import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {typeAccountDto} from '../dtos/typeAccount.dto';

export class GetAllTypeAccountService {
  async run() {
    return axios.get<typeAccountDto[]>(`${services.budget}/admin/type-accounts`,).then(response => response.data);
}
}
