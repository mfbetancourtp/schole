import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

// import { DetailedCompetenceDto } from '../dtos/competency.dto';

export class GetLearningPlanReportService {
  run(academicPeriodId: any, levelId: any, periodId: any, degreeId: any, subjectId: any) {
    // return axios.get<DetailedCompetenceDto[]>(`${services.classroom}/classroom-administration/course/${courseId}/competencies`).then((response) => response.data);
    return axios
      .get<{ competencies: any[] }>(`${services.classroom}/classroom-administration/competencies/report/getLearningPlanReport?academicPeriodId=${academicPeriodId ?? ''}&levelId=${levelId ?? ''}&periodId=${periodId ?? ''}&degreeId=${degreeId ?? ''}&subjectId=${subjectId ?? ''}`)
      .then((response) => response.data);
  }
}
