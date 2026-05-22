import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface DetailSaleDto extends TimestampDto{
    id: number | null;
    description?: any;
    invoiceId: number | null;
    productId: number | null;
    productValueId?: any;
    quantity: number | null;
    unitValue: number | null;
    percentDiscount?: number;
    totalValue?: number | null;
    productName?: string;
    validityPeriod?: number;
}