import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CreateCurriculumSubjectsFromArrayService {
    async run(curriculumDegreeId: number, data: any){
        await axios.post(`${services.academic}/academic-programs/curriculum-degrees/${curriculumDegreeId}/curriculum-subjects`, data);
    }
}
