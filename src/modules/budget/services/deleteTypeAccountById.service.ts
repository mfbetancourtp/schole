import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteTypeAccountByIdService {
    async run(typeAccountId: number) {
        return axios.delete<any>(`${services.budget}/admin/type-accounts/${typeAccountId}`).then(response => response.data);
    }
}