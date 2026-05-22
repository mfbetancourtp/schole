import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {LevelDto} from '../../../shared/dto/level.dto';
import {SubjectDto} from '../../../shared/dto/subject.dto';
import {AreaDto} from '../../../shared/dto/area.dto';

export interface SubjectRelatedData extends SubjectDto {
    isArea: boolean;
}

export class GetRelatedDataImportContentService {
    async run() {
        const response = await Promise.all([
            this.getLevelsAndDegrees(),
            this.getSubjects(),
        ]);

        return {
            levels: response[0],
            subjects: response[1],
        };
    }

    private async getLevelsAndDegrees() {
        return axios.get<LevelDto[]>(`${services.academic}/academic-programs/levels-with-degrees`).then(response => response.data);
    }

    private getSubjects() {
        return axios.get(`${services.academic}/academic-programs/areas-subjects`).then((response) => {
            const subjects: SubjectRelatedData[] = [];

            response.data.forEach((area: AreaDto) => {
                subjects.push({
                    name: area.name,
                    isArea: true,
                });

                area.subjects.forEach(subject => {
                    subjects.push({
                        ...subject,
                        isArea: false,
                    });
                });
            });

            return subjects;
        });
    }
}
