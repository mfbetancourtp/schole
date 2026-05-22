import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IUpdateApprovedByInscritoService {
    id: number;
    isApproved: number;
    rejectedObservations?: string;
}

export class UpdateApprovedByInscritoService {
    async run(data: IUpdateApprovedByInscritoService) {
        await axios.post(`${services.academic}/academic-planning/update-status-convocation-enrol-step`, data);
    }
}