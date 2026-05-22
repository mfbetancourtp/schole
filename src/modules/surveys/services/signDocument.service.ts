import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class SignDocumentService {
    async run(data: any) {
        await axios.post(`${services.academic}/academic-planning/sign-document`, data);
    }
}