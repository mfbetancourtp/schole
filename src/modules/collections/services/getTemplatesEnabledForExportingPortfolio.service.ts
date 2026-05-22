import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

import { TemplatesEnabledDto } from '../dtos/templatesEnabled.dto';

export class GetTemplatesEnabledForExportingPortfolioService {
    run() {
        return axios.get<TemplatesEnabledDto[]>(`${services.configurations}/export-entities/invoices`)
            .then(response => response.data);
    }
}