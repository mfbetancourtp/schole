import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteIdentificationTypesService {
    async run(identificationTypeId: number): Promise<void> {
        await axios.delete(`${services.users}/people/identification-types/${identificationTypeId}`);
    }
}