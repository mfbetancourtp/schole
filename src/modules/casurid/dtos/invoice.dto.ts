export interface InvoiceDto {
    totalDiscount: number;
    isCredit?: number;
    observations: number;
    dateCancel?: string;
}