import axios from '../../../utils/axios';
import {services} from '../../../constant/services';
import {ProcessPaymentDto} from '../../../dto/paymentGateway/pagueATiempo/processPayment.dto';

interface IProcessPaymentService {
    value: number | string;
    iva: number;
    currency: string;
    invoiceId?: string | number;
}

export class ProcessPaymentService {
    run(data: IProcessPaymentService) {
        return axios.post<ProcessPaymentDto>(`${services.payments}/pague-a-tiempo/process-payment`, data).then(response => response.data);
    }
}
