import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class AcceptOrRejectEvidenceService {
    async run(enrolDiscountId: number, data: any) {
        await axios.put(`${services.academic}/academic-planning/convocation-enrol-discounts/${enrolDiscountId}`, data);
    }
}