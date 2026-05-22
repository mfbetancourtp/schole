import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProductTypeOption {
  label: string;
  value: string;
}

export class GetRelatedDataProductsAcademicService {
  async run(): Promise<ProductTypeOption[]> {
    const response = await axios.get<{ types: ProductTypeOption[] }>(`${services.casurid}/catalogue/admin/related-data-products-academic`);
    return response.data.types;
  }
}
