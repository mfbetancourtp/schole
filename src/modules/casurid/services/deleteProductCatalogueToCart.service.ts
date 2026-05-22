import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteProductCatalogueToCartService {
    async run(cartId: number): Promise<void> {
        await axios.delete(`${services.casurid}/catalogue/cart-products/${cartId}`);
    }
}