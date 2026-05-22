import {InstitutionDto} from '../../../shared/dto/institution.dto';
import {DetailSaleDto} from './detailSale.dto';

export interface SaleDto {
    id: number;
    code?: any;
    createDate: string;
    institutionId: number;
    userId: number;
    totalValue: number;
    totalDiscount: number;
    totalPurchase: number;
    isCredit: number;
    isQuote: number;
    totalPaid: number;
    observations?: any;
    isCancel: number;
    dateCancel?: any;
    observationCancel?: any;
    createdAt: string;
    updatedAt?: any;
    institution: InstitutionDto;
    details: DetailSaleDto[];
}