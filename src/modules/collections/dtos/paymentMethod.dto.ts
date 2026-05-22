import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface PaymentMethodDto extends TimestampDto{
    id: number;
    institutionId: number;
    paymentType: string;
    title: string;
    paymentGatewayAvailableId: number;
    urlWebCheckout?: any;
    onlyOfficials: number;
    urlTestPaymentGateway: string;
    urlProdPaymentGateway: string;
}