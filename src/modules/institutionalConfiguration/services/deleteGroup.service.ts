import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteGroupService {
    async run(groupId: number): Promise<void> {
        await axios.delete(`${services.academic}/institutional-configuration/groups/${groupId}`);
    }
}