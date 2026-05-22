import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRelatedDataDocumentsSignersService {
    async run() {
        return axios.get(`${services.academic}/academic-administration/related-data-documents-signers`).then(response => response.data);
    }
}