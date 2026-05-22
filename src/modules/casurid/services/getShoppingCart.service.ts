import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export interface CartProductDto {
    id: number;
    productId: number;
    institutionId: number;
    quantity: number;
    createdAt: string;
    updatedAt?: any;
    productTitle: string;
    defaultUnitValue: number;
    total: number;
    levelName: string;
}

export interface LevelsProduct {
    name: string;
    products: CartProductDto[];
}

export interface IGetShoppingCartService {
    levelsProducts: LevelsProduct[];
}

export class GetShoppingCartService {
    async run(): Promise<IGetShoppingCartService> {
        return axios.get(`${services.casurid}/catalogue/cart-products`).then((response) => response.data);
    }
}