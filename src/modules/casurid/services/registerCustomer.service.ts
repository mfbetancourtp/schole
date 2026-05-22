import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IRegisterCustomerService {
    institution: {
        identification: string;
        name: string;
        phone: string;
        municipalityId: string,
        email: string
    };
    user: {
        userToken: string;
        password: string;
        passwordConfirmation: string;
    };

}

export class RegisterCustomerService {
    async run(data: IRegisterCustomerService): Promise<void> {
        await axios.post(`${services.casurid}/clients/register`, data);
    }
}