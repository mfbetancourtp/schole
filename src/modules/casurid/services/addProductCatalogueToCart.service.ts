import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IAddProductCatalogueToCartService {
    quantity: number;
    productId: number;
}

export class AddProductCatalogueToCartService {
    async run(data: IAddProductCatalogueToCartService): Promise<void> {
        await axios.post(`${services.casurid}/catalogue/cart-products`, data);
    }
}