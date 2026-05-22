import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {DegreeDto} from '../dtos/degree.dto';
import {LevelDto} from '../dtos/level.dto';
import {SubjectDto} from '../dtos/subject.dto';
import {ContentDto} from '../dtos/content.dto';

interface IGetRelatedDataPlansFormService {
    degree: DegreeDto;
    level: LevelDto;
    subject: SubjectDto;
    contents: ContentDto[];
}

interface IParams {
    levelId: number;
    degreeId: number;
    subjectId: number;
}

export class GetRelatedDataPlansFormService {
    run(params: IParams) {
        return axios.get<IGetRelatedDataPlansFormService>(`${services.casurid}/catalogue/admin/related-data-products`, {
            params,
        }).then((response) => {
            return response.data;
        });
    }
}