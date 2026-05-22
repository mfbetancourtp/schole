import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteBanksByIdService {
    async run(bankId: number) {
        return axios.delete<any>(`${services.budget}/admin/banks/${bankId}`).then(response => response.data);
    }
}