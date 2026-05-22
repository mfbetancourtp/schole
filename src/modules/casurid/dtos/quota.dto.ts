export interface QuotaDto {
    id: number;
    invoiceId: number;
    numberQuote: number;
    dueDate: string;
    quoteValue: number;
    paidValue: number;
    createdAt: string;
    updatedAt?: any;
    code?: any;
    statusQuote: string;
    PendingValue: number;
}