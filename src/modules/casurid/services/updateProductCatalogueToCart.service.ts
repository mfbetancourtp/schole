import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IUpdateProductCatalogueToCartService {
    quantity: number;
    productId: number;
}

export class UpdateProductCatalogueToCartService {
    async run(cartId: number, data: IUpdateProductCatalogueToCartService): Promise<void> {
        await axios.put(`${services.casurid}/catalogue/cart-products/${cartId}`, data);
    }
}