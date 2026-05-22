import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class ConfirmRegistrationService {
    async run(token: string): Promise<void> {
        await axios.post(`${services.casurid}/access/register-confirmation`, {token});
    }
}