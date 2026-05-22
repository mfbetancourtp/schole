import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { StudentDto } from '../dtos/qualifyActivity.dto';

export interface IPostActivitiesQualifyService {
  activityId: number;
  periodId: number;
  students: StudentDto[];
}

export class PostActivitiesQualifyService {
  run(data: IPostActivitiesQualifyService) {
    return axios
      .post(
        `${services.classroom}/classroom-assessment/qualify-deliveries`,
        data
      )
      .then((response) => response.data);
  }
}
