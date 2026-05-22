import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface DiscountDto extends TimestampDto {
    id: number;
    institutionId: number;
    title: string;
    description: string;
    value: number;
    isPercent: number;
    allowEdit: number;
    applyProduct: number;
    applyInvoice: number;
    requireAttachment: number;
    descriptionAttachment: string;
    checked?: boolean;
}