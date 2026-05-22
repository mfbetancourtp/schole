export interface ExportCollectionDto {
    isExport: number;
    code?: any;
    createDate: string;
    totalPurchase: number;
    client: string;
    institution: string;
    identificationClient: string;
    wayToPay: string;
    pendingValue: number;
    countDetails: number;
    countQuotes: number;
}