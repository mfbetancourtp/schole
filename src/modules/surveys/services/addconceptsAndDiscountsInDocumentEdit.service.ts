import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class AddconceptsAndDiscountsInDocumentEditService {
    async run(data: any) {
        await axios.post(`${services.academic}/academic-administration/documents-products-and-discounts`, data);
    }
}