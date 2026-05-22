import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { ExportCollectionDto } from '../dtos/exportCollection.dto';

export class GenerateSummaryBeforeExportingPortfolioService {
    async run(data: any) {
        return await axios.post<ExportCollectionDto[]>(`${services.casurid}/invoices-summary-by-dates`, data)
            .then(response => response.data);
    }
}