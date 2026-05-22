import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDocumentConceptsAndDiscountsService {
    async run(documentId: any) {
        return axios.get(`${services.academic}/academic-administration/documents-products-and-discounts/${documentId}`)
            .then(response => response.data);
    }
}