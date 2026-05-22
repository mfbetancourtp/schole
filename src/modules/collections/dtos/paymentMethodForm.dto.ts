import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ParameterDto extends TimestampDto {
    id: number;
    paymentGatewayAvailableId: number;
    code: string;
    name: string;
    value: string;
}

export interface PaymentGatewayDto extends TimestampDto {
    id: number;
    name: string;
    urlProd: string;
    urlTest: string;
    isActive: number;
    createdAt: string;
    updatedAt?: any;
    parameters: ParameterDto[];
}        

export interface PaymentMethodFormDto {
    paymentGateways: PaymentGatewayDto[];
    paymentTypes: string[];
}