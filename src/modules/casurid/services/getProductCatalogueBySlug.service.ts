import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ProductCatalogueDto} from '../dtos/productCatalogue.dto';
import {ProductContentDto} from '../dtos/productContent.dto';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';

interface IGetProductCatalogueBySlugService {
    product: ProductCatalogueDto;
    contents: ProductContentDto[];
}

export class GetProductCatalogueBySlugService {
    run(slug: string) {
        return axios.get<IGetProductCatalogueBySlugService>(`${services.casurid}/catalogue/product-detail/${slug}`).then((response) => {
            const data = response.data;

            data.product.thumbnail = data.product.thumbnail ?? ImageNotAvailable;

            return data;
        });
    }
}