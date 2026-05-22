import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteDiscountSupportService {
    async run(id: number) {
        await axios.delete(`${services.academic}/academic-planning/delete-file-convocation-enrol-discount/${id}`);
    }
}