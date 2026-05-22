import { TimestampDto } from "../timestamp.dto";

export interface PaymentMethodsAvailableDto extends TimestampDto {
    id: number;
    institutionId: number;
    paymentType: string;
    title: string;
    paymentGatewayAvailableId?: number;
    urlWebCheckout: string;
    onlyOfficials: number;
    urlTestPaymentGateway: string;
    urlProdPaymentGateway: string;
}
