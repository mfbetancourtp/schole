import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteCompetencyTypeService {
    async run(competenceTypeId: number): Promise<void> {
        await axios.delete(`${services.classroom}/classroom-administration/competency-types/${competenceTypeId}`);
    }
}