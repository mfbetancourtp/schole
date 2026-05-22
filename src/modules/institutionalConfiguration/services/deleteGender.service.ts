import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteGenderService {
    async run(genderId: number): Promise<void> {
        await axios.delete(`${services.users}/people/genders/${genderId}`);
    }
}