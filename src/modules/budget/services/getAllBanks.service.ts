import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {bankDto} from '../dtos/bank.dto';

export class GetAllBanksService {
  async run() {
    return axios.get<bankDto[]>(`${services.budget}/admin/banks`,).then(response => response.data);
}
}
