import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import {ResponsePaginationDto} from '../../../shared/dto/responsePagination.dto';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import {ProductCatalogueDto} from '../dtos/productCatalogue.dto';

interface IParams extends ParamsPaginationDto {
    levelsIds: number[];
    degreesIds: number[];
    areasIds: number[];
    subjectsIds: number[];
}

export class SearchProductsCatalogueService {
    async run(params: IParams) {
        return axios.get<ResponsePaginationDto<ProductCatalogueDto>>(`${services.casurid}/catalogue/products`, {
            params,
        }).then((response) => {
            const data = response.data;

            data.data.forEach((products) => {
                products.thumbnail = products.thumbnail ?? ImageNotAvailable;
            });

            return data;
        });
    }
}