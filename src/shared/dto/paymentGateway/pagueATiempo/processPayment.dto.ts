interface PaymentMethods {
    id: number;
    name: string;
}

export interface ProcessPaymentDto {
    token: string;
    nit: string;
    url_procesamiento: string;
    value: number;
    iva: number;
    currency: string;
    orderNumber: string;
    responseUrl: string;
    params: any;
    paymentMethods: PaymentMethods[];
}
