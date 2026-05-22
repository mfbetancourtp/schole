import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

import { TemplatesEnabledDto } from '../dtos/templatesEnabled.dto';

export class GetTemplatesEnabledForExportingPaymentsService {
    run() {
        return axios.get<TemplatesEnabledDto[]>(`${services.configurations}/export-entities/payments`)
            .then(response => response.data);
    }
}