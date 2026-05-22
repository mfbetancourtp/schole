import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {LicensesDto} from '../dtos/licenses.dto';

export class GetUsedLicensesService {
    async run(productId: number) {

        return axios.get<LicensesDto[]>(`${services.casurid}/purchases/used-curriculum-products-by-curriculum-product/${productId}`)
            .then((response) => response.data);
    }
}