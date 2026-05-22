import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface ShoppingDto extends TimestampDto {
    id: number;
    curriculumSubjectId?: any;
    productId: number;
    invoiceDetailId: number;
    order: number;
    validUntil: string;
    quantity: number;
    active: number;
    quantityUsed: number;
    productName: string;
    levelName: string;
    DegreeName: string;
    subjectName: string;
}