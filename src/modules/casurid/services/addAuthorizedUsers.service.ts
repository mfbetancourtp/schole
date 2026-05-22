import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class AddAuthorizedUsersService {
    async run(data: { whiteListEmails: string }, id: number): Promise<void> {
        await axios.put(`${services.casurid}/purchases/csd-curriculum-products/${id}`, data);
    }
}