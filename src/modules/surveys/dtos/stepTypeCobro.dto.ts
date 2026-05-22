import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface DetailInvoiceDto {
  code: string;
  title: string;
  productId: number;
  productValueId?: any;
  isOptional: number;
  quantity: number;
  unitValue: number;
  discountUnitValue: number;
  totalValue: number;
  invoiceId: number;
}

export interface InvoiceDto {
  id?: number;
  totalValue: number;
  totalDiscount: number;
  totalPurchase: number;
  isPending: boolean;
  details: DetailInvoiceDto[];
}

export interface EnrolDiscountDto extends TimestampDto {
  id: number;
  institutionId: number;
  convocationEnrolId: number;
  convocationEnrolStepId: number;
  convocationDiscountId: number;
  urlAttachment: string;
  isAccept?: any;
  rowId?: any;
  discountValue: number;
  discountType?: any;
  comments: any[];
}

export interface ConvocationDiscountDto {
  id: number;
  institutionId: number;
  productDiscount?: any;
  title: string;
  description: string;
  descriptionAttachment: string;
  value: number;
  isPercent: number;
  requireAttachment: number;
  enrolDiscount: EnrolDiscountDto;
}

export interface DetailDto {
  invoice: InvoiceDto;
  convocationDiscounts: ConvocationDiscountDto[];
}

export interface StepTypeCobroDto extends TimestampDto {
  id: number;
  institutionId: number;
  title: string;
  convocationId: number;
  convocationStepTypeId: number;
  surveyId?: any;
  order: number;
  allowQuotes: number;
  maxQuotes?: any;
  minInitialQuoteValue?: any;
  requiresApproval: number;
  notApplyPrevius: number;
  convocationEnrolStepId: any;
  isApproved: number;
  detail: DetailDto;
  statePayment: any;
}
