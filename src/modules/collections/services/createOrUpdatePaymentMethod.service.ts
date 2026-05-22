import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface ParameterDto {
    id: number;
    value: string;
}

export interface ICreateOrUpdatePaymentMethodService {
    paymentType: string;
    title: string;
    paymentGatewayAvailableId: number | null;
    urlWebCheckout: string | null;
    parameters: ParameterDto[];
    onlyOfficials: number;
}

export class CreateOrUpdatePaymentMethodService extends CreateOrUpdateBaseService<ICreateOrUpdatePaymentMethodService> {
    url = `${services.payments}/payment-methods`;
}    