import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class RequestDiscountService extends CreateOrUpdateBaseService<any> {
    url = `${services.casurid}/payments/convocations/invoice-for-discounts`;
}