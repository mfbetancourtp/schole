import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface PortfolioDiscountDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  description: string;
  value: any;
  isPercent: number;
  allowEdit: number;
  applyProduct: number;
  applyInvoice: number;
  requireAttachment: number;
  descriptionAttachment: string;
  checked?: boolean;
}
