import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteCompetencyLevelService {
    async run(competenceLevelId: number): Promise<void> {
        await axios.delete(`${services.classroom}/classroom-administration/competencyLevels/${competenceLevelId}`);
    }
}