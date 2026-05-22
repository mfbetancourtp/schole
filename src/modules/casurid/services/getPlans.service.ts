import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ProductDto} from '../dtos/product.dto';

export interface IGetPlansService {
    subjectId: number;
    subject: string;
    products: ProductDto[];
}

interface IParams {
    levelId: number;
    degreeId: number;
}

export class GetPlansService {
    run(params: IParams) {
        return axios.get<IGetPlansService[]>(`${services.casurid}/catalogue/admin/products`, {
            params,
        }).then((response) => {
            return response.data;
        });
    }
}