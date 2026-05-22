import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteInstitutionService {
    async run(institutionId: number): Promise<void> {
        await axios.delete(`${services.casurid}/clients/institutions/${institutionId}`);
    }
}